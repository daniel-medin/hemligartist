import { getRsvpUrl } from './rsvp.js?v=20261115-guestlist-2';

function fetchGuestNames(endpoint) {
  return new Promise((resolve, reject) => {
    const url = getRsvpUrl(endpoint);
    const callback = `hemligartistGuests_${crypto.randomUUID().replaceAll('-', '')}`;
    url.searchParams.set('view', 'guests');
    url.searchParams.set('callback', callback);
    const script = document.createElement('script');
    let settled = false;
    const timeout = setTimeout(() => finish(new Error('Gästlistan tog för lång tid att hämta.')), 15000);
    function finish(error, names) {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      script.remove();
      // Ignore an already-arriving callback if its request timed out.
      window[callback] = () => {};
      setTimeout(() => delete window[callback], 60000);
      if (error) reject(error);
      else resolve(names);
    }
    window[callback] = result => {
      if (!result || !Array.isArray(result.names) || !result.names.every(name => typeof name === 'string')) {
        finish(new Error('Gästlistan kunde inte hämtas.'));
      } else {
        finish(null, result.names);
      }
    };
    script.onerror = () => finish(new Error('Gästlistan kunde inte hämtas.'));
    script.onload = () => {
      if (!settled) finish(new Error('Gästlistan kunde inte hämtas.'));
    };
    script.src = url.href;
    script.referrerPolicy = 'no-referrer';
    document.head.append(script);
  });
}

export function startGuestList(endpoint, list, status, retry) {
  if (!endpoint) return;
  let loading = false;
  let hasLoaded = false;
  let timer;

  async function refresh() {
    if (loading || document.hidden) return;
    loading = true;
    clearTimeout(timer);
    retry.disabled = true;
    try {
      const names = await fetchGuestNames(endpoint);
      const items = names.map(name => {
        const item = document.createElement('li');
        item.textContent = name;
        return item;
      });
      list.replaceChildren(...items);
      list.hidden = names.length === 0;
      status.textContent = names.length === 0 ? 'Ingen har signat upp sig än. Bli först på listan.' : '';
      retry.hidden = true;
      hasLoaded = true;
    } catch (error) {
      status.textContent = hasLoaded ? 'Listan kunde inte uppdateras just nu.' : 'Gästlistan kunde inte hämtas just nu.';
      retry.hidden = false;
    } finally {
      loading = false;
      retry.disabled = false;
      timer = setTimeout(refresh, 30000);
    }
  }

  retry.addEventListener('click', refresh);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) refresh();
    else clearTimeout(timer);
  });
  window.addEventListener('pageshow', refresh);
  window.addEventListener('message', event => {
    if (!event.data || event.data.type !== 'hemligartist:rsvp-saved') return;
    let origin;
    try { origin = new URL(event.origin); } catch { return; }
    if (origin.protocol !== 'https:') return;
    const host = origin.hostname;
    if (host === 'script.google.com' || host === 'script.googleusercontent.com' || host.endsWith('.script.googleusercontent.com') || host.endsWith('-script.googleusercontent.com')) refresh();
  });
  status.textContent = 'Hämtar gästlistan…';
  refresh();
}
