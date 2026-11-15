export function getRsvpUrl(endpoint) {
  const url = new URL(endpoint);
  if (url.origin !== 'https://script.google.com' || !/^\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(url.pathname) || url.search || url.hash) {
    throw new Error('Anmälningsadressen måste vara en publicerad Google Apps Script-webbapp.');
  }
  return url;
}

export function mountRsvp(endpoint, container) {
  if (!endpoint) return false;
  const url = getRsvpUrl(endpoint);
  const frame = document.createElement('iframe');
  frame.className = 'rsvp-frame';
  frame.title = 'Anmäl dig till en hemlig förfest';
  frame.src = url.href;
  frame.referrerPolicy = 'no-referrer';
  container.replaceChildren(frame);
  return true;
}
