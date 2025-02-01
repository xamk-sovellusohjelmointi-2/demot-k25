# Demo 1: Express-perusteita

Demossa perehdytään Express-sovelluksen perusteisiin.

- Express-sovelluksen asennus ja käyttöönotto
- REST API-pyynnöt ja reitit
- Staattisten tiedostojen kansio

Alla oleva ohjeistus pohjautuu osin tekoälyltä (Copilot, 2025) saatuun ohjeistukseen.

### 1. Node-pakettien tuonti ja määrittelyt

Ensimmäiseksi tuodaan Express-sovelluksen tarvitsemat paketit.

```typescript
import express from 'express';
import path from 'path';
```
- `import express from 'express'`: Tuodaan `express`-moduuli, joka on kevyt ja joustava Node.js-verkkosovelluskehys.
- `import path from 'path'`: Tuodaan `path`-moduuli, joka tarjoaa apuvälineitä tiedostopolkujen käsittelyyn.

### 2. Express-sovelluksen luominen (ilmentymä)

Jotta Express-verkkosovellus voidaan ottaa käyttöön, siitä pitää luoda ilmentymä.

```typescript
const app: express.Application = express();
```

- Sovelluksen tyyppi saadaan express-paketista: `express.Application`

### 3. Portin määrittely

Määritellään portti, jota sovellus käyttää. Jos ympäristömuuttuja on sisällytetty sovellukseen (`.env`-tiedosto), haetaan portti sieltä. Muuten käytetään porttia 3001.

```typescript
const portti: number = Number(process.env.PORT) || 3001;
```

Sovellusohjelmoinnin demoissa käytetään aina ensisijaisesti "kovakoodattua" porttia, mutta ympäristömuuttujan kutsuminen on hyvä myös oppia.

### 4. Staattisten tiedostojen kansio

Seuraavaksi sovelluksessa on määritetty staattisten tiedostojen kansio. Staattisten tiedostojen kansio sisältää sellaisia tiedostoja, joita voidaan palauttaa REST-pyyntöjen vastauksina sellaisenaan.

```typescript
app.use(express.static(path.resolve(__dirname, "public")));
```
- `express.static()` määrittää staattisten tiedostojen kansion.
- `path.resolve()` muodostaa absoluuttisen hakemistopolun parametreina annetuista poluista. `express.static()` tarvitsee absoluuttisen polun kansion määrittämiseen.

### 5. Kommentoitu koodi (GET reitti: "/")

Alla olevaa koodia (juureen tehdyn get-pyynnön käsittelijä) ei tarvita, koska Express-sovelluksen sisääntulopiste tai "entry point" on määritelty public-kansiossa olevalla index.html -tiedostolla.

`index.html`-tiedosto on varattu Express-sovelluksissa automaattisena vastauksena silloin, kun sovellus käyttää staattisten tiedostojen kansiota. Jos staattisten tiedostojen kansiota ja index-tiedostoa EI käytä, pitää sovelluksen juureen tehtävän pyynnön käsittelijä silloin määritellä erikseen, esimerkiksi alla olevaan tyyliin.

```typescript
/*
app.get("/", (req : express.Request, res : express.Response) : void => {
    res.send("<h1>Heippa maailma, Henri kävi täällä!</h1>");
});
*/
```

### 6. GET reitti: /heippa

REST-pyynnöille voidaan määrittää erilaisia polkuja, joita voidaan hakea palvelinsovelluksen URLissa. Kun määritettyä polkua haetaan, suoritetaan sille määritetty pyynnön käsittelijä.

Pyynnön käsittelijä URL: http://localhost:3001/heippa

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
- `app.get("/heippa", (req: express.Request, res: express.Response): void => { ... });`: Määritellään GET-reitti `/heippa`-polkuun.
    - Expressin `get()` ottaa vastaan aina kaksi parametria `req` ja `res`.
    - `req` sisältää käyttäjän tekemän pyynnön tietoja, `res` palvelimen vastauksen tietoja. Parametrien tyypit ovat määritelty yllä.

- `let nimi: string = "";`: Alustetaan `nimi`-muuttuja tyhjänä. Nimi saadaan URL:n yhteydessä lähetettävästä query-stringistä (esim. `/heippa?nimi=Henri`).

- `if (typeof req.query.nimi === "string") { nimi = req.query.nimi; } else { nimi = "tuntematon"; }`: Tarkistetaan, onko kyselyparametri `nimi` merkkijono. Jos on, käytetään sitä `nimi`-muuttujan arvona, muuten käytetään "tuntematon".
- ``res.send(`<h1>Heippa, ${nimi}!</h1>`);``: Lähetetään vastaus, joka sisältää tervehdyksen ja nimen (tai "tuntematon").

### 7. GET reitti: /moikka

```typescript
app.get("/moikka", (req: express.Request, res: express.Response): void => {
    res.send("<h1>Moikka!</h1>");
});
```
- `app.get("/moikka", (req: express.Request, res: express.Response): void => { ... });`: Määritellään GET-reitti `/moikka`-polkuun, joka vastaa "Moikka" viestillä.

- `res.send("<h1>Moikka!</h1>");`: Lähetetään vastaus, joka sisältää tervehdyksen "Moikka".

### 8. Palvelimen käynnistäminen

```typescript
app.listen(portti, () => {
    console.log(`Palvelin käynnistyi osoitteeseen: http://localhost:${portti}`);
});
```
- `app.listen(portti, () => { ... });`: Käynnistetään palvelin määritellyllä portilla. Määritetään myös nuolifunktio, joka suoritetaan automaattisesti osana palvelimen käynnistymistä.

- ``console.log(`Palvelin käynnistyi osoitteeseen: http://localhost:${portti}`);``: Tulostetaan konsoliin viesti, joka ilmoittaa, että palvelin on käynnistynyt ja kuuntelee määritellyllä portilla.

