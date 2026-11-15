import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const source = readFileSync(new URL('../google-apps-script/Code.gs', import.meta.url), 'utf8');
const requestId = '00000000-0000-4000-8000-000000000001';

function server({ header = 'Namn', unavailable = false, failWrite = false, existingNames = [] } = {}) {
  const names = [...existingNames];
  const receipts = new Map();
  let released = false;
  let flushed = false;
  const sheet = {
    getRange(row, column, rowCount, columnCount) {
      assert.equal(column, 1);
      if (row === 1) return { getDisplayValue: () => header };
      if (rowCount !== undefined) {
        assert.equal(columnCount, 1);
        return { getDisplayValues: () => names.slice(row - 2, row - 2 + rowCount).map(name => [name]) };
      }
      return { setRichTextValue(value) { if (failWrite) throw new Error('Write failed'); names[row - 2] = value.text; } };
    },
    getLastRow: () => 1 + names.length,
    getMaxRows: () => 1000,
  };
  const context = vm.createContext({
    ContentService: {
      MimeType: { JAVASCRIPT: 'application/javascript', TEXT: 'text/plain' },
      createTextOutput(body) { return { body, setMimeType(type) { this.type = type; return this; } }; },
    },
    LockService: { getScriptLock: () => ({ tryLock: () => !unavailable, releaseLock() { released = true; } }) },
    PropertiesService: { getScriptProperties: () => ({ getProperty: key => receipts.get(key) ?? null, setProperty(key, value) { receipts.set(key, value); } }) },
    SpreadsheetApp: {
      openById(id) {
        assert.equal(id, '12M7fqcwc9KDa0ejhe7au5bBCMhhylnO9cRSxXlxcRLU');
        return { getSheetById(id) { assert.equal(id, 0); return sheet; } };
      },
      newRichTextValue() { return { setText(text) { this.text = text; return this; }, build() { return { text: this.text }; } }; },
      flush() { flushed = true; },
    },
  });
  vm.runInContext(source, context);
  return { register: payload => context.registerGuest(payload), guests: () => context.guestNames_(), request: parameter => context.doGet({ parameter }), names, receipts, released: () => released, flushed: () => flushed };
}

test('appends only a literal name to the designated column and confirms after flush', () => {
  const app = server();
  const result = app.register({ name: '  Åsa   Öberg ', requestId });
  assert.equal(result.saved, true);
  assert.deepEqual(app.names, ['Åsa Öberg']);
  assert.equal(app.flushed(), true);
  assert.equal(app.released(), true);
});

test('invalid names and malformed submission IDs never write a row', () => {
  const app = server();
  for (const name of ['', '   ', 'a'.repeat(81), 'Al\u0000ice']) {
    assert.throws(() => app.register({ name, requestId }));
  }
  assert.throws(() => app.register({ name: 'Åsa', requestId: 'invalid' }));
  assert.deepEqual(app.names, []);
});

test('retrying a saved submission does not append another row', () => {
  const app = server();
  app.register({ name: 'Åsa', requestId });
  assert.equal(app.register({ name: 'Åsa', requestId }).saved, true);
  assert.deepEqual(app.names, ['Åsa']);
  assert.throws(() => app.register({ name: 'Bengt', requestId }));
});

test('different people may register the same name', () => {
  const app = server();
  app.register({ name: 'Alex', requestId });
  app.register({ name: 'Alex', requestId: '00000000-0000-4000-8000-000000000002' });
  assert.deepEqual(app.names, ['Alex', 'Alex']);
});

test('name text is never submitted as a spreadsheet formula', () => {
  const app = server();
  app.register({ name: '=1+1', requestId });
  assert.deepEqual(app.names, ['=1+1']);
});

test('a changed header or unavailable lock cannot overwrite existing content', () => {
  for (const options of [{ header: 'Something else' }, { unavailable: true }]) {
    const app = server(options);
    assert.throws(() => app.register({ name: 'Åsa', requestId }));
    assert.deepEqual(app.names, []);
    assert.equal(app.receipts.size, 0);
  }
});

test('failed writes do not produce successful receipts and release the lock', () => {
  const app = server({ failWrite: true });
  assert.throws(() => app.register({ name: 'Åsa', requestId }));
  assert.equal(app.receipts.size, 0);
  assert.equal(app.released(), true);
});

test('public guest names skip the header and blank rows and preserve signup order', () => {
  const app = server({ existingNames: ['Åsa Öberg', '', '  ', 'Alex', 'Alex'] });
  assert.deepEqual(Array.from(app.guests()), ['Åsa Öberg', 'Alex', 'Alex']);
  app.register({ name: 'Kim', requestId });
  assert.deepEqual(Array.from(app.guests()), ['Åsa Öberg', 'Alex', 'Alex', 'Kim']);
});

test('guest endpoint returns only names as safely quoted, read-only JSONP', () => {
  const names = ['Åsa', '</script><img src=x onerror=alert(1)>', 'O\'Brien'];
  const app = server({ existingNames: names });
  const callback = 'hemligartistGuests_' + 'a'.repeat(32);
  const response = app.request({ view: 'guests', callback });
  let received;
  vm.runInNewContext(response.body, { [callback]: data => { received = data; } });
  assert.equal(response.type, 'application/javascript');
  assert.deepEqual(Object.keys(received), ['names']);
  assert.deepEqual(Array.from(received.names), names);
  assert.deepEqual(app.names, names);
  assert.equal(app.receipts.size, 0);
});

test('guest endpoint rejects executable callback expressions and distinguishes read failure from empty list', () => {
  const app = server({ header: 'Not the guest list' });
  const invalid = app.request({ view: 'guests', callback: 'alert(1)//' });
  assert.equal(invalid.type, 'text/plain');
  const callback = 'hemligartistGuests_' + 'b'.repeat(32);
  let received;
  vm.runInNewContext(app.request({ view: 'guests', callback }).body, { [callback]: data => { received = data; } });
  assert.equal(typeof received.error, 'string');
  assert.equal(received.names, undefined);
  assert.equal(server().guests().length, 0);
});
