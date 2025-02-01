### Tuonti ja Määrittelyt

```typescript
import express from 'express';
import path from 'path';
import apiOstoksetRouter from './routes/apiOstokset';
```
- **import express from 'express';**: Tuodaan `express`-moduuli, joka on kevyt ja joustava Node.js-verkkosovelluskehys.
- **import path from 'path';**: Tuodaan `path`-moduuli, joka tarjoaa apuvälineitä tiedostopolkujen käsittelyyn.
- **import apiOstoksetRouter from './routes/apiOstokset';**: Tuodaan `apiOstoksetRouter`-reittitiedosto, joka hallinnoi ostoslistan API-reittejä.

### Sovelluksen Luominen

```typescript
const app: express.Application = express();
```
- **const app: express.Application = express();**: Luodaan uusi Express-sovellus.

### Portin Määrittely

```typescript
const portti: number = Number(process.env.PORT) || 3003;
```
- **const portti: number = Number(process.env.PORT) || 3003;**: Määritellään portti, jota sovellus käyttää. Jos ympäristömuuttuja `PORT` on asetettu, käytetään sitä, muuten käytetään porttia 3003.

### Staattisten Tiedostojen Palvelu

```typescript
app.use(express.static(path.resolve(__dirname, "public")));
```
- **app.use(express.static(path.resolve(__dirname, "public")));**: Määritellään reitti, joka palvelee staattisia tiedostoja `public`-hakemistosta.

### API-reitit

```typescript
app.use("/api/ostokset", apiOstoksetRouter);
```
- **app.use("/api/ostokset", apiOstoksetRouter);**: Määritellään reitti, joka käyttää `apiOstoksetRouter`-reittitiedostoa. Kaikki `/api/ostokset`-reitit käsitellään tässä tiedostossa.

### Palvelimen Käynnistäminen

```typescript
app.listen(portti, () => {
    console.log(`Palvelin käynnistyi porttiin : ${portti}`);
});
```
- **app.listen(portti, () => { ... });**: Käynnistetään palvelin määritellyllä portilla.
- **console.log(`Palvelin käynnistyi porttiin : ${portti}`);**: Tulostetaan konsoliin viesti, joka ilmoittaa, että palvelin on käynnistynyt ja kuuntelee määritellyllä portilla.