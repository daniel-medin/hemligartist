# En hemlig förfest

Inbjudan till den 21 november 2026, kl. 15.00 på Stenkolsgatan 1b.

Publicerad med GitHub Pages: https://daniel-medin.github.io/hemligartist/

## Utveckling

Sidan är vanlig HTML, CSS och JavaScript utan byggsteg eller externa runtime-beroenden. Kör `npm run dev` och öppna http://127.0.0.1:4173. Kör tidsgränstesterna med `npm test` (Node 18+).

GitHub Pages serverar roten från grenen `main`. En push uppdaterar sidan automatiskt.

## Portkod och tid

Portkoden visas automatiskt den **21 november 2026 kl. 15.00 i Europe/Stockholm**, vilket är **14.00 UTC**. Tiden har explicit UTC-offset, så besökarens tidszon påverkar inte släppet. En öppen sida uppdateras automatiskt. När en vilande flik återaktiveras kontrolleras tiden direkt.

Detta är en statisk inbjudan: koden finns i JavaScript-källan och klockan använder besökarens enhetstid. Nedräkningen är en visuell överraskning, inte en säker spärr. För verklig hemlighållning fram till ett visst klockslag behövs en server som inte lämnar ut koden före släppet; GitHub Pages kör ingen sådan backend.

## Anmälan

Målarket är [en hemlig förfest](https://docs.google.com/spreadsheets/d/12M7fqcwc9KDa0ejhe7au5bBCMhhylnO9cRSxXlxcRLU/edit), fliken `Sheet1`, kolumn A (`Namn`). Apps Script-formuläret skriver enbart namn, en rad per inskickning. Arket behöver inte delas offentligt.

Koden är förberedd i `google-apps-script/Code.gs`. Inskickning är fortfarande inaktiverad tills värden har publicerat Google-webbappen och dess `/exec`-adress har lagts in i `rsvp-config.js`. Se [aktiveringsstegen](google-apps-script/SETUP.md). Google-publicering och verklig inskickning till arket är ännu inte verifierade.

## Form

Egen vektorlogga med inspiration från https://www.enhemligartist.se/. På värdens önskemål används samma rödrosa bakgrund, hämtad från referenssidans publika bild `EHA_BGOnly 2560x1440 mini.jpg` och sparad lokalt i `assets/background.jpg`. Ingen officiell koppling till arrangören påstås. Loggan innehåller inte referenssidans sponsorlogga. Changa One av Eduardo Tunni distribueras lokalt under SIL Open Font License; se `assets/FONT-LICENSE.txt`.
