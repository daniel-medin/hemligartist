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

Målarket är [en hemlig förfest](https://docs.google.com/spreadsheets/d/12M7fqcwc9KDa0ejhe7au5bBCMhhylnO9cRSxXlxcRLU/edit), fliken `Sheet1`, kolumn A (`Namn`). Apps Script-formuläret skriver enbart namn, en rad per inskickning. Arket behöver inte delas offentligt. Den publicerade webbappens adress är konfigurerad i `rsvp-config.js`. Anonym inskickning har verifierats mot Google Sheets den 15 november 2026; testnamnet har tagits bort.

Längst ned finns ”Coola typer som signat upp sig:”. Listan läser namn från kolumn A i anmälningsordning. Den hämtas vid sidöppning, var 30:e sekund medan fliken är aktiv och efter bekräftad anmälan. Namn renderas som text, inte HTML. Vid läsfel behålls den senaste lyckade listan och ett felmeddelande visas.

För att aktivera gästlistans nya läsfunktion behöver den uppdaterade `google-apps-script/Code.gs` publiceras som en ny version av samma Google-webbapp. Se [aktiveringsstegen](google-apps-script/SETUP.md). Frontend och läsflöde är testade lokalt; publicerad läsning av gästlistan återstår tills den nya Google-versionen är publicerad. Formuläret informerar gästen om att namnet visas på sidan.

## Form

Egen vektorlogga med inspiration från https://www.enhemligartist.se/. På värdens önskemål används samma rödrosa bakgrund, hämtad från referenssidans publika bild `EHA_BGOnly 2560x1440 mini.jpg` och sparad lokalt i `assets/background.jpg`. Ingen officiell koppling till arrangören påstås. Loggan innehåller inte referenssidans sponsorlogga. Changa One av Eduardo Tunni distribueras lokalt under SIL Open Font License; se `assets/FONT-LICENSE.txt`.
