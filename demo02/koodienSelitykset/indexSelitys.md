### Tuonti ja Määrittelyt

```typescript
import express from 'express';
import path from 'path';
import kayttajat, { Kayttaja } from './models/kayttajat';
```
- **import express from 'express';**: Tuodaan `express`-moduuli, joka on kevyt ja joustava Node.js-verkkosovelluskehys.
- **import path from 'path';**: Tuodaan `path`-moduuli, joka tarjoaa apuvälineitä tiedostopolkujen käsittelyyn.
- **import kayttajat, { Kayttaja } from './models/kayttajat';**: Tuodaan `kayttajat`-taulukko ja `Kayttaja`-rajapinta `./models/kayttajat`-tiedostosta.

### Sovelluksen Luominen

```typescript
const app: express.Application = express();
```
- **const app: express.Application = express();**: Luodaan uusi Express-sovellus.

### Portin Määrittely

```typescript
const portti: number = Number(process.env.PORT) || 3002;
```
- **const portti: number = Number(process.env.PORT) || 3002;**: Määritellään portti, jota sovellus käyttää. Jos ympäristömuuttuja `PORT` on asetettu, käytetään sitä, muuten käytetään porttia 3002.

### Rajapintojen Määrittelyt

```typescript
interface Kayttajatieto {
    id: number;
    nimi: string;
    sahkoposti: string;
    kayttajatunnus: string;
    rekisteroitymisPvm: string;
}

interface Yhteystieto {
    id: number;
    nimi: string;
    sahkoposti: string;
}
```
- **interface Kayttajatieto**: Määritellään `Kayttajatieto`-rajapinta, joka kuvaa käyttäjän tiedot.
- **interface Yhteystieto**: Määritellään `Yhteystieto`-rajapinta, joka kuvaa yhteystiedot.

### Staattisten Tiedostojen kansio

```typescript
app.use(express.static(path.resolve(__dirname, "public")));
```
- **app.use(express.static(path.resolve(__dirname, "public")));**: Määritellään reitti, joka jakaa staattisia tiedostoja `public`-hakemistosta.

### GET Reitti (Yksi Yhteystieto)

```typescript
app.get("/yhteystiedot/:id", (req: express.Request, res: express.Response): void => {
    let yhteystieto: Yhteystieto | undefined = kayttajat.map((kayttaja: Kayttaja) => {
        return {
            id: kayttaja.id,
            nimi: `${kayttaja.etunimi} ${kayttaja.sukunimi}`,
            sahkoposti: kayttaja.sahkoposti
        };
    }).find((yhteystieto: Yhteystieto) => yhteystieto.id === Number(req.params.id));

    if (yhteystieto) {
        res.json(yhteystieto);
    } else {
        res.json({ virhe: `Käyttäjää id : ${req.params.id} ei löytynyt` });
    }
});
```
- **app.get("/yhteystiedot/:id", (req: express.Request, res: express.Response): void => { ... });**: Määritellään GET-reitti, joka palauttaa yhden yhteystiedon ID:n perusteella.
- **let yhteystieto: Yhteystieto | undefined = kayttajat.map((kayttaja: Kayttaja) => { ... }).find((yhteystieto: Yhteystieto) => yhteystieto.id === Number(req.params.id));**: Luodaan `yhteystieto`-olio, joka sisältää käyttäjän yhteystiedot ja etsitään yhteystieto ID:n perusteella.
- **if (yhteystieto) { res.json(yhteystieto); } else { res.json({ virhe: `Käyttäjää id : ${req.params.id} ei löytynyt` }); }**: Palautetaan yhteystieto JSON-muodossa, jos se löytyy, muuten palautetaan virheviesti.

### GET Reitti (Kaikki Yhteystiedot)

```typescript
app.get("/yhteystiedot", (req: express.Request, res: express.Response): void => {
    let yhteystiedot: Yhteystieto[] = kayttajat.map((kayttaja: Kayttaja) => {
        return {
            id: kayttaja.id,
            nimi: `${kayttaja.etunimi} ${kayttaja.sukunimi}`,
            sahkoposti: kayttaja.sahkoposti
        };
    });

    res.json(yhteystiedot);
});
```
- **app.get("/yhteystiedot", (req: express.Request, res: express.Response): void => { ... });**: Määritellään GET-reitti, joka palauttaa kaikki yhteystiedot.
- **let yhteystiedot: Yhteystieto[] = kayttajat.map((kayttaja: Kayttaja) => { ... });**: Luodaan `yhteystiedot`-taulukko, joka sisältää kaikkien käyttäjien yhteystiedot.
- **res.json(yhteystiedot);**: Palautetaan kaikki yhteystiedot JSON-muodossa.

### GET Reitti (Kaikki Käyttäjätiedot)

```typescript
app.get("/kayttajatiedot", (req: express.Request, res: express.Response): void => {
    let kayttajatiedot: Kayttajatieto[] = kayttajat.map((kayttaja: Kayttaja) => {
        return {
            id: kayttaja.id,
            nimi: `${kayttaja.etunimi} ${kayttaja.sukunimi}`,
            sahkoposti: kayttaja.sahkoposti,
            kayttajatunnus: kayttaja.kayttajatunnus,
            rekisteroitymisPvm: kayttaja.rekisteroitymisPvm
        };
    });

    if (typeof req.query.vuosi === "string") {
        kayttajatiedot = kayttajatiedot.filter((kayttajatieto: Kayttajatieto) => kayttajatieto.rekisteroitymisPvm.substring(0, 4) === req.query.vuosi);
    }

    res.json(kayttajatiedot);
});
```
- **app.get("/kayttajatiedot", (req: express.Request, res: express.Response): void => { ... });**: Määritellään GET-reitti, joka palauttaa kaikki käyttäjätiedot.
- **let kayttajatiedot: Kayttajatieto[] = kayttajat.map((kayttaja: Kayttaja) => { ... });**: Luodaan `kayttajatiedot`-taulukko, joka sisältää kaikkien käyttäjien tiedot.
- **if (typeof req.query.vuosi === "string") { kayttajatiedot = kayttajatiedot.filter((kayttajatieto: Kayttajatieto) => kayttajatieto.rekisteroitymisPvm.substring(0, 4) === req.query.vuosi); }**: Suodatetaan käyttäjätiedot rekisteröitymisvuoden perusteella, jos `vuosi`-kyselyparametri on annettu.
- **res.json(kayttajatiedot);**: Palautetaan kaikki käyttäjätiedot JSON-muodossa.

### Palvelimen Käynnistäminen

```typescript
app.listen(portti, () => {
    console.log(`Palvelin käynnistyi porttiin : ${portti}`);
});
```
- **app.listen(portti, () => { ... });**: Käynnistetään palvelin määritellyllä portilla.
- **console.log(`Palvelin käynnistyi osoitteeseen: http://localhost:${portti}`);**: Tulostetaan konsoliin viesti, joka ilmoittaa, että palvelin on käynnistynyt ja kuuntelee määritellyllä portilla.