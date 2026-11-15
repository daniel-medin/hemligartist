// Paste this entire file into Code.gs in Extensions > Apps Script in the sheet.
// Deploy as a Web app: Execute as Me; Who has access: Anyone.
const SPREADSHEET_ID = '12M7fqcwc9KDa0ejhe7au5bBCMhhylnO9cRSxXlxcRLU';
const SHEET_ID = 0;

function doGet(event) {
  if (event && event.parameter && event.parameter.view === 'guests') {
    const callback = event.parameter.callback || '';
    if (!/^hemligartistGuests_[a-f0-9]{32}$/.test(callback)) {
      return ContentService.createTextOutput('Ogiltig förfrågan.').setMimeType(ContentService.MimeType.TEXT);
    }
    let result;
    try {
      result = { names: guestNames_() };
    } catch (error) {
      result = { error: 'Gästlistan kunde inte hämtas.' };
    }
    // Read-only public names, explicitly requested by the host. No other data.
    const json = JSON.stringify(result).replace(/</g, '\\u003c');
    return ContentService.createTextOutput(callback + '(' + json + ');')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return HtmlService.createHtmlOutput(formHtml_())
    .setTitle('Anmäl dig till en hemlig förfest')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// Called only by an explicit form submission, via google.script.run.
// The separate read-only guest-list route returns names from column A only.
function registerGuest(payload) {
  if (!payload || typeof payload.name !== 'string' || typeof payload.requestId !== 'string') {
    throw new Error('Fyll i ditt namn och försök igen.');
  }
  const name = payload.name.normalize('NFC').trim().replace(/\s+/g, ' ');
  if (!name || name.length > 80 || /[\u0000-\u001f\u007f]/.test(name)) {
    throw new Error('Ange ett namn med högst 80 tecken.');
  }
  if (!/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(payload.requestId)) {
    throw new Error('Ladda om anmälan och försök igen.');
  }
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(10000)) throw new Error('Många anmäler sig just nu. Försök igen om en liten stund.');
  try {
    const receipts = PropertiesService.getScriptProperties();
    const receiptKey = 'rsvp:' + payload.requestId;
    const previousName = receipts.getProperty(receiptKey);
    if (previousName !== null) {
      if (previousName !== name) throw new Error('Ladda om anmälan innan du anmäler ett annat namn.');
      return { saved: true };
    }
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetById(SHEET_ID);
    if (!sheet || sheet.getRange(1, 1).getDisplayValue() !== 'Namn') {
      throw new Error('Anmälan är tillfälligt stängd. Försök igen senare.');
    }
    const row = Math.max(2, sheet.getLastRow() + 1);
    if (row > sheet.getMaxRows()) sheet.insertRowsAfter(sheet.getMaxRows(), 100);
    // Rich text stores the exact name as text, including names starting with =.
    sheet.getRange(row, 1).setRichTextValue(SpreadsheetApp.newRichTextValue().setText(name).build());
    SpreadsheetApp.flush();
    receipts.setProperty(receiptKey, name);
    return { saved: true };
  } finally {
    lock.releaseLock();
  }
}

function guestNames_() {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetById(SHEET_ID);
  if (!sheet || sheet.getRange(1, 1).getDisplayValue() !== 'Namn') {
    throw new Error('Gästlistan är tillfälligt stängd.');
  }
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];
  return sheet.getRange(2, 1, lastRow - 1, 1).getDisplayValues()
    .map(row => row[0].trim()).filter(name => name !== '');
}

function formHtml_() {
  return `<!doctype html>
<html lang="sv"><head><meta charset="utf-8"><base target="_top"><meta name="viewport" content="width=device-width, initial-scale=1">
<style>
*{box-sizing:border-box}html,body{margin:0;background:#111110;color:#eeeae1;font-family:Arial,Helvetica,sans-serif;color-scheme:dark}
body{padding:5px}form{display:flex;gap:12px;align-items:end;flex-wrap:wrap}.field{flex:1;min-width:130px}
label{display:block;font:10px monospace;letter-spacing:1px;margin-bottom:9px}
input{width:100%;min-height:48px;border:1px solid #69675f;border-radius:0;appearance:none;background:transparent;color:#eeeae1;font:16px Arial,sans-serif;padding:13px 14px}input::placeholder{color:#aaa69d}
button{display:flex;align-items:center;justify-content:space-between;gap:30px;min-height:48px;background:#eeeae1;border:1px solid #eeeae1;border-radius:0;color:#111110;font:12px monospace;padding:12px 18px;cursor:pointer}button span{font-size:18px}
button:hover{background:#fff}button:disabled{opacity:.5;cursor:default}input:focus-visible,button:focus-visible{outline:2px solid #eeeae1;outline-offset:3px}
.note{flex-basis:100%;margin:0;font-size:12px;line-height:1.6;color:#c6c2b8}.note.error{color:#ffaca1}
@media(max-width:360px){.field,button{flex-basis:100%}button{width:100%}}
</style></head><body>
<form id="signup" aria-describedby="status">
<div class="field"><label for="name">Namn</label><input id="name" name="name" autocomplete="name" required maxlength="80" placeholder="Ditt namn"></div>
<button id="submit" type="submit">Jag kommer <span aria-hidden="true">↗</span></button>
<p class="note" id="status" role="status" aria-live="polite">Ditt namn visas i gästlistan på den här sidan.</p>
</form>
<script>
const form = document.getElementById('signup');
const input = document.getElementById('name');
const button = document.getElementById('submit');
const status = document.getElementById('status');
let busy = false;
let requestId = crypto.randomUUID();
let pendingName = '';
form.addEventListener('submit', function(event) {
  event.preventDefault();
  if (busy || !form.reportValidity()) return;
  const name = input.value.trim();
  if (!name) { input.setCustomValidity('Fyll i ditt namn.'); input.reportValidity(); return; }
  // Keep the same receipt when retrying an uncertain response for the same name.
  if (pendingName && pendingName !== name) requestId = crypto.randomUUID();
  pendingName = name;
  busy = true;
  input.readOnly = true;
  button.disabled = true;
  button.textContent = 'Sparar…';
  status.className = 'note';
  status.textContent = 'Sparar din anmälan…';
  google.script.run.withSuccessHandler(function(result) {
    if (!result || result.saved !== true) { failed({ message: 'Anmälan kunde inte bekräftas. Försök igen.' }); return; }
    status.textContent = 'Du är anmäld. Vi ses på förfesten!';
    button.textContent = 'Du är på listan ✓';
    input.disabled = true;
    // Only a refresh signal; no names or credentials are sent between frames.
    window.top.postMessage({ type: 'hemligartist:rsvp-saved' }, '*');
  }).withFailureHandler(failed).registerGuest({ name: name, requestId: requestId });
});
input.addEventListener('input', function() { input.setCustomValidity(''); });
function failed(error) {
  busy = false;
  input.readOnly = false;
  button.disabled = false;
  button.textContent = 'Försök igen ↗';
  status.className = 'note error';
  // Display text, never HTML. Internal provider errors stay out of the form.
  status.textContent = 'Det gick inte att bekräfta anmälan. Försök igen om en stund.';
}
</script></body></html>`;
}
