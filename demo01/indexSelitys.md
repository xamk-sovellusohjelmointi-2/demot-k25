### Tuonti ja Määrittelyt

```typescript
import express from 'express';
import path from 'path';
```
- **import express from 'express';**: Tuodaan `express`-moduuli, joka on kevyt ja joustava Node.js-verkkosovelluskehys.
- **import path from 'path';**: Tuodaan `path`-moduuli, joka tarjoaa apuvälineitä tiedostopolkujen käsittelyyn.

### Sovelluksen Luominen

```typescript
const app: express.Application = express();
```
- **const app: express.Application = express();**: Luodaan uusi Express-sovellus.

### Portin Määrittely

```typescript
const portti: number = Number(process.env.PORT) || 3001;
```
- **const portti: number = Number(process.env.PORT) || 3001;**: Määritellään portti, jota sovellus käyttää. Jos ympäristömuuttuja `PORT` on asetettu, käytetään sitä, muuten käytetään porttia 3001.

### Staattisten tiedostojen kansio

```typescript
app.use(express.static(path.resolve(__dirname, "public")));
```
- **app.use(express.static(path.resolve(__dirname, "public")));**: Määritellään reitti, josta staattisia tiedostoja haetaan (`public`-kansio).

### Kommentoitu Koodi

```typescript
/*
Alla olevaa koodia (juureen tehdyn get-pyynnön käsittelijä) ei tarvita, koska Express-sovelluksen sisääntulopiste tai "entry point" on määritelty public-kansiossa olevalla index.html -tiedostolla.

Index-tiedosto on varattu Express-sovelluksissa automaattisena vastauksena silloin, kun sovellus avataan juuritasolla. Jos staattisten tiedostojen kansiota ja index-tiedostoa ei käytä, pitää sovelluksen juureen tehtävän pyynnön käsittelijä silloin määritellä erikseen.

app.get("/", (req : express.Request, res : express.Response) : void => {
    res.send("<h1>Heippa maailma, Henri kävi täällä!</h1>");
});
*/
```
- **Kommentoitu koodi**: Selittää, miksi juureen tehtävän GET-pyynnön käsittelijää ei tarvita, koska `public`-kansiossa oleva `index.html`-tiedosto toimii sovelluksen sisääntulopisteenä.

### GET Reitti (Heippa)

```typescript
app.get("/heippa", (req: express.Request, res: express.Response): void => {
    let nimi: string = "";

    if (typeof req.query.nimi === "string") {
        nimi = req.query.nimi;
    } else {
        nimi = "tuntematon";
    }

    res.send(`<h1>Heippa, ${nimi}!</h1>`);
});
```
- **app.get("/heippa", (req: express.Request, res: express.Response): void => { ... });**: Määritellään GET-reitti, joka vastaa "Heippa" viestillä.
- **let nimi: string = "";**: Alustetaan `nimi`-muuttuja.
- **if (typeof req.query.nimi === "string") { nimi = req.query.nimi; } else { nimi = "tuntematon"; }**: Tarkistetaan, onko kyselyparametri `nimi` merkkijono. Jos on, käytetään sitä, muuten käytetään "tuntematon".
- **res.send(`<h1>Heippa, ${nimi}!</h1>`);**: Lähetetään vastaus, joka sisältää tervehdyksen ja nimen.

### GET Reitti (Moikka)

```typescript
app.get("/moikka", (req: express.Request, res: express.Response): void => {
    res.send("<h1>Moikka!</h1>");
});
```
- **app.get("/moikka", (req: express.Request, res: express.Response): void => { ... });**: Määritellään GET-reitti, joka vastaa "Moikka" viestillä.
- **res.send("<h1>Moikka!</h1>");**: Lähetetään vastaus, joka sisältää tervehdyksen "Moikka".

### Palvelimen Käynnistäminen

```typescript
app.listen(portti, () => {
    console.log(`Palvelin käynnistyi osoitteeseen: http://localhost:${portti}`);
});
```
- **app.listen(portti, () => { ... });**: Käynnistetään palvelin määritellyllä portilla.
- **console.log(`Palvelin käynnistyi osoitteeseen: http://localhost:${portti}`);**: Tulostetaan konsoliin viesti, joka ilmoittaa, että palvelin on käynnistynyt ja kuuntelee määritellyllä portilla.

Toivottavasti tämä selitys auttaa! Jos sinulla on lisää kysymyksiä tai tarvitset lisäapua, kerro vain. 😊