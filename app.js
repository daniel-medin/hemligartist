import { getCountdown, REVEAL_AT } from './countdown.js';

// Keep the RSVP visibly pending until the host selects a collection destination.
document.getElementById('rsvp-form').addEventListener('submit', event => event.preventDefault());

const fields = Object.fromEntries(['days', 'hours', 'minutes', 'seconds'].map(key => [key, document.getElementById(key)]));
const countdown = document.getElementById('countdown');
const reveal = document.getElementById('reveal');
let timer;
let revealed = false;

function update() {
  clearTimeout(timer);
  const now = Date.now();
  const state = getCountdown(now);

  if (state.unlocked) {
    if (!revealed) {
      revealed = true;
      document.getElementById('door-title').textContent = 'DÖRREN ÄR DIN.';
      document.getElementById('door-status').textContent = 'VÄLKOMMEN IN';
      document.getElementById('door-code').textContent = '3399';
      document.getElementById('door-code').setAttribute('aria-label', 'Portkod: 3 3 9 9');
      document.getElementById('door-note').textContent = 'Stenkolsgatan 1b · En hemlig förfest';
      document.querySelector('.door').classList.add('is-open');
      countdown.hidden = true;
      reveal.hidden = false;
      document.getElementById('announcement').textContent = 'Nu börjar förfesten! Portkoden är 3 3 9 9. Välkommen in.';
    }
    return;
  }

  for (const [key, element] of Object.entries(fields)) {
    element.textContent = String(state[key]).padStart(2, '0');
  }
  // Align updates with the second and schedule the last one at the reveal time.
  timer = setTimeout(update, Math.min(REVEAL_AT - now, 1000 - (now % 1000)));
}

document.addEventListener('visibilitychange', () => {
  if (!document.hidden) update();
});
window.addEventListener('pageshow', update);
update();
