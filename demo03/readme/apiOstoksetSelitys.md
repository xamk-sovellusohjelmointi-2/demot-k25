### Tuonti ja Määrittelyt

```typescript
import express from 'express';
import Ostoslista, { Ostos } from '../models/ostoslista';
```
- **import express from 'express';**: Tuodaan `express`-moduuli, joka on kevyt ja joustava Node.js-verkkosovelluskehys.
- **import Ostoslista, { Ostos } from '../models/ostoslista';**: Tuodaan `Ostoslista`-luokka ja `Ostos`-rajapinta `../models/ostoslista`-tiedostosta.

### Ostoslista-Instanssi

```typescript
const ostoslista: Ostoslista = new Ostoslista();
```
- **const ostoslista: Ostoslista = new Ostoslista();**: Luodaan uusi `Ostoslista`-luokan instanssi.

### Routerin Määrittely

```typescript
const apiOstoksetRouter: express.Router = express.Router();
```
- **const apiOstoksetRouter: express.Router = express.Router();**: Luodaan uusi `express.Router`-instanssi, joka hallinnoi reittejä.

### JSON Middleware

```typescript
apiOstoksetRouter.use(express.json());
```
- **apiOstoksetRouter.use(express.json());**: Käytetään `express.json()`-middlewarea, joka muuntaa saapuvat JSON-pyynnöt JavaScript-objekteiksi.

### DELETE Reitti

```typescript
apiOstoksetRouter.delete("/:id", async (req: express.Request, res: express.Response) => {
    await ostoslista.poista(Number(req.params.id));
    res.json(ostoslista.haeKaikki());
});
```
- **apiOstoksetRouter.delete("/:id", async (req: express.Request, res: express.Response) => { ... });**: Määritellään DELETE-reitti, joka poistaa ostoksen ID:n perusteella.
- **await ostoslista.poista(Number(req.params.id));**: Kutsutaan `ostoslista.poista`-metodia ja annetaan parametriksi pyynnön ID.
- **res.json(ostoslista.haeKaikki());**: Palautetaan kaikki jäljellä olevat ostokset JSON-muodossa.

### PUT Reitti

```typescript
apiOstoksetRouter.put("/:id", async (req: express.Request, res: express.Response) => {
    let muokattuOstos: Ostos = {
        id: req.body.id,
        tuote: req.body.tuote,
        poimittu: req.body.poimittu
    }
    await ostoslista.muokkaa(muokattuOstos, Number(req.params.id));
    res.json(ostoslista.haeKaikki());
});
```
- **apiOstoksetRouter.put("/:id", async (req: express.Request, res: express.Response) => { ... });**: Määritellään PUT-reitti, joka muokkaa olemassa olevaa ostosta ID:n perusteella.
- **let muokattuOstos: Ostos = { ... };**: Luodaan `muokattuOstos`-olio pyynnön rungon tiedoista.
- **await ostoslista.muokkaa(muokattuOstos, Number(req.params.id));**: Kutsutaan `ostoslista.muokkaa`-metodia ja annetaan parametriksi muokattu ostos ja ID.
- **res.json(ostoslista.haeKaikki());**: Palautetaan kaikki ostokset JSON-muodossa.

### POST Reitti

```typescript
apiOstoksetRouter.post("/", async (req: express.Request, res: express.Response) => {
    let uusiOstos: Ostos = {
        id: 0,
        tuote: req.body.tuote,
        poimittu: req.body.poimittu
    }
    await ostoslista.lisaa(uusiOstos);
    res.json(ostoslista.haeKaikki());
});
```
- **apiOstoksetRouter.post("/", async (req: express.Request, res: express.Response) => { ... });**: Määritellään POST-reitti, joka lisää uuden ostoksen.
- **let uusiOstos: Ostos = { ... };**: Luodaan `uusiOstos`-olio pyynnön rungon tiedoista.
- **await ostoslista.lisaa(uusiOstos);**: Kutsutaan `ostoslista.lisaa`-metodia ja annetaan parametriksi uusi ostos.
- **res.json(ostoslista.haeKaikki());**: Palautetaan kaikki ostokset JSON-muodossa.

### GET Reitti (Yksi Ostos)

```typescript
apiOstoksetRouter.get("/:id", (req: express.Request, res: express.Response) => {
    res.json(ostoslista.haeYksi(Number(req.params.id)));
});
```
- **apiOstoksetRouter.get("/:id", (req: express.Request, res: express.Response) => { ... });**: Määritellään GET-reitti, joka palauttaa yhden ostoksen ID:n perusteella.
- **res.json(ostoslista.haeYksi(Number(req.params.id)));**: Palautetaan haettu ostos JSON-muodossa.

### GET Reitti (Kaikki Ostokset)

```typescript
apiOstoksetRouter.get("/", (req: express.Request, res: express.Response) => {
    res.json(ostoslista.haeKaikki());
});
```
- **apiOstoksetRouter.get("/", (req: express.Request, res: express.Response) => { ... });**: Määritellään GET-reitti, joka palauttaa kaikki ostokset.
- **res.json(ostoslista.haeKaikki());**: Palautetaan kaikki ostokset JSON-muodossa.

### Vienti

```typescript
export default apiOstoksetRouter;
```
- **export default apiOstoksetRouter;**: Viedään `apiOstoksetRouter`-olio, jotta se voidaan käyttää muissa tiedostoissa.