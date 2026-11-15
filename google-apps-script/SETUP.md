# Aktivera anmälan till Google Sheets

Arket är förberett: `Sheet1`, kolumn A har rubriken **Namn**. Endast namn skrivs till arket, ett namn per rad. Namnen visas även i den publika gästlistan längst ned på inbjudan. Kalkylarket behöver inte delas offentligt.

## Uppdatera den befintliga publiceringen med gästlistan

1. Öppna projektets kodredigerare (`<>`) i Apps Script och ersätt hela `Code.gs` med den senaste [Code.gs](Code.gs). Spara.
2. Välj **Deploy → Manage deployments**, välj webbappen vars adress används i `rsvp-config.js` och klicka på **pennan**.
3. Välj **Version → New version**, **Execute as → Me** och **Who has access → Anyone**. Klicka **Deploy**. Samma `/exec`-adress kan behållas.

Anmälan och läsfunktionen för gästlistan är publicerade och verifierade mot Google Sheets. Listan hämtar bara namnen i `Sheet1!A2:A`, aldrig andra kolumner eller skriptets privata kvitton. Förfrågningar med `view=guests` är skrivfria.

## Första publicering

1. Öppna https://docs.google.com/spreadsheets/d/12M7fqcwc9KDa0ejhe7au5bBCMhhylnO9cRSxXlxcRLU/edit och välj **Tillägg → Apps Script** (Extensions → Apps Script).
2. Ersätt innehållet i `Code.gs` med hela [Code.gs](Code.gs) i denna mapp. Spara.
3. Välj **Implementera → Ny implementering → Webbapp** (Deploy → New deployment → Web app). Välj **Kör som: Jag** (Execute as: Me) och **Åtkomst: Alla** (Who has access: Anyone). Publicera och godkänn Googles åtkomstbegäran för ditt eget skript. Välj alternativet utan krav på Google-inloggning för gäster.
4. Skicka webbappens adress som slutar på `/exec` till Codex. Alternativt, klistra in adressen i `RSVP_ENDPOINT` i `rsvp-config.js` och pusha till `main`.

När adressen är konfigurerad ersätter webbplatsen det inaktiva formuläret med Googles inbäddade formulär. Skriptet körs med värdens rättigheter. Gäster får inte redigeringsåtkomst till kalkylarket; den publika läsfunktionen lämnar endast ut namn. Inga Google-nycklar läggs i den publika webbplatsen. En lyckad bekräftelse visas först när Google Sheets har bekräftat skrivningen.

Verifiera efter publicering genom att skicka ett tydligt testnamn från den publika sidan och kontrollera att det syns i både arket och gästlistan. Ta sedan bort testnamnet. Anonym inskickning, sparning och omedelbar uppdatering av gästlistan har verifierats den 15 november 2026. Testnamnen är borttagna.

Skriptet använder lås för samtidiga inskickningar och sparar ett privat kvitto per inskickning för att undvika dubbla rader vid omförsök efter nätverksfel. Två olika gäster kan ha samma namn. Kvittot lagras i Apps Scripts skriptegenskaper, inte som en extra kolumn i gästlistan.

Googles dokumentation: [Webbappar](https://developers.google.com/apps-script/guides/web), [Klient–server-kommunikation](https://developers.google.com/apps-script/guides/html/communication).
