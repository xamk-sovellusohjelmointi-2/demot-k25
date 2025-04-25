# REST API-virhekäsittelijä

### [<- Takaisin](./express_server.md)

REST API:n virheidenkäsittely on olennainen osa luotettavan ja käyttäjäystävällisen verkkopalvelun rakentamista. Palvelimen API:n täytyy kommunikoida virhetilanteet selkeästi sekä muille sovelluksille että kehittäjille. Virheidenkäsittelyn tehtävänä on kertoa mitä tapahtui, jos sovellus meni tilaan, jossa se ei pysty suorittamaan haluttuja toimintoja.

## Huomioitavaa REST API:n virheiden käsittelyssä

REST API:n virheidenkäsittelyssä on tärkeää huomioida seuraavat asiat:

1. **Johdonmukaiset vastaukset**: API:n tulisi palauttaa selkeät vastaukset virhetilanteissa, jotka kuvaavat tapahtunutta virhettä ymmärrettävästi.
2. **HTTP-statuskoodit**: Oikeat HTTP-statuskoodit auttavat API:n kehittäjiä ja käyttäjiä ymmärtämään virheen luokan. Statuskoodit on luokiteltu virheen tyypi mukaisesti. Esim. 400-alkuiset koodit kertovat asiakaspäässä tapahtuneesta virheestä, kuten virheellisesti muodostetusta pyynnöstä.
3. **Selkeät virheilmoitukset**: Virheilmoitusten tulisi kertoa ymmärrettävästi, mitä tapahtui ja miksi.Esim. "Virheellinen pyyntö", kun asiakassovellus tekee pyynnön väärillä tiedoilla.

Tässä demossa virheidenkäsittely on toteutettu `virhekasittelija.ts`-tiedostossa, ja sitä hyödynnetään `apiOstokset.ts`-reitittimessä sekä palvelimella `index.ts`:ssä.

Katsotaan seuraavaksi virhekäsittelijän koodeja.

## 1. Virheluokan määrittäminen

```ts
export class Virhe extends Error {
    status : number
    viesti : string
    constructor(status? : number, viesti? : string) {
        super();
        this.status = status || 500;
        this.viesti = viesti || "Palvelimella tapahtui odottamaton virhe";
    }
}
```

Ensiksi määritellään `Virhe`-luokka, joka perii JavaScriptin valmiin `Error`-luokan ja sen ominaisuudet. Virhe-luokka laajentaa perusvirheluokkaa Error kahdella tärkeällä ominaisuudella:

1. `status`: HTTP-statuskoodi, joka kertoo virheen tyypin (esim. 400 = virheellinen pyyntö, 404 = ei löydy, 500 = palvelinvirhe)
2. `viesti`: Selkokielinen virheilmoitus, joka kertoo virheen syyn

Konstruktorissa (constructor) määritellään oletusarvot:
- Jos statuskoodia ei anneta, käytetään koodia 500 (yleinen/tunnistamaton palvelinvirhe)
- Jos viestiä ei anneta, käytetään yleistä virheilmoitusta "Palvelimella tapahtui odottamaton virhe"

Kysymysmerkki parametrin tyypin perässä (esim. `status?: number`) tarkoittaa, että parametri on valinnainen.

## 2. Virhekäsittelijän toteutus

```ts
const virhekasittelija = (err : Virhe, req : express.Request, res : express.Response, next : express.NextFunction) => {
    res.status(err.status).json({virhe : err.viesti});
    next();
}
```

`virhekasittelija`-metodi ottaa vastaan neljä parametria:
1. `err`: Virhe-objekti, joka sisältää statuskoodin ja virheilmoituksen
2. `req`: HTTP-pyyntö
3. `res`: HTTP-vastaus
4. `next`: Funktio, joka siirtää käsittelyn seuraavalle metodille

Virhekäsittelijä:
1. Asettaa vastauksen statuskoodin virheluokan määrittämään arvoon (`res.status(err.status)`)
2. Lähettää JSON-muotoisen virheilmoituksen (`json({virhe : err.viesti})`)
3. Kutsuu seuraavaa middlewarea (`next()`)

## 3. Virhekäsittelijän käyttö Express-sovelluksessa

Express-sovelluksen tiedostossa `index.ts` virhekäsittelijä otetaan käyttöön:

```ts
import virhekasittelija from './errors/virhekasittelija';
// ...
app.use(virhekasittelija);
```

Virhekäsittelijä otetaan käyttöön middlewarena.

## 4. Virhekäsittelijän hyödyntäminen reiteissä

`apiOstokset.ts`-tiedostossa näemme, miten virhekäsittelijää hyödynnetään reiteissä:

```ts
import { Virhe } from '../errors/virhekasittelija';

// Esimerkki virhekäsittelystä DELETE-reitissä
apiOstoksetRouter.delete("/:id", async (req : express.Request, res : express.Response, next : express.NextFunction) => {
    if (ostoslista.haeYksi(Number(req.params.id))) {
        try {
            await ostoslista.poista(Number(req.params.id));
            res.json(ostoslista.haeKaikki());
        } catch (e : any) {
            next(new Virhe())
        }
    } else {
        next(new Virhe(400, "Virheellinen id"));
    }
});
```

Tässä esimerkissä:

1. Jos pyydettyä ID:tä ei löydy (`ostoslista.haeYksi` palauttaa `undefined`), suoritetaan `else`-lohko, jossa luodaan uusi `Virhe`-objekti statuskoodilla 400 ja viestillä "Virheellinen id"
2. Jos poisto-operaatiossa tapahtuu virhe (`try...catch`-ehtorakenne), luodaan uusi `Virhe`-objekti oletusparametreilla (statuskoodi 500 ja oletusviesti)
3. `next()`-funktion kutsuminen virhe-parametrilla siirtää suorituksen virhekäsittelijälle

## 5. Erilaisten virheiden käsittely

`apiOstokset.ts`-tiedostossa on käsitelty useita erilaisia virhetilanteita:

### 5.1 Virheellisen ID:n käsittely

```ts
if (ostoslista.haeYksi(Number(req.params.id))) {
    // ID löytyy, jatketaan käsittelyä
} else {
    next(new Virhe(400, "Virheellinen id"));
}
```

### 5.2 Virheellisen pyynnön body:n käsittely

```ts
if (req.body.tuote?.length > 0 && (req.body.poimittu === true || req.body.poimittu === false)) {
    // Body on kelvollinen, jatketaan käsittelyä
} else {
    next(new Virhe(400, "Virheellinen pyynnön body"));
}
```

### 5.3 Odottamattomien virhetilanteiden käsittely

```ts
try {
    await ostoslista.lisaa(uusiOstos);
    res.json(ostoslista.haeKaikki());
} catch (e : any) {
    next(new Virhe())
}
```
Huomaa, kuinka virheessä 5.3 ei määritellä erikseen virheen HTTP-statusta tai virheilmoitusta, jolloin käytetään virheen konstruktorin oletusarvoja (500, "Palvelimella tapahtui odottamaton virhe")

## 6. Käytännön neuvoja REST API:n virheidenkäsittelyyn

1. **Ole johdonmukainen virhevastauksissa**: Käytä samaa rakennetta kaikissa virhevastauksissa

2. **Käytä oikeita HTTP-statuskoodeja**:
   - 400: Bad Request (virheellinen pyyntö)
   - 401: Unauthorized (autentikointi puuttuu)
   - 403: Forbidden (ei käyttöoikeutta)
   - 404: Not Found (resurssia ei löydy)
   - 500: Internal Server Error (palvelinvirhe)

3. **Käytä try-catch-lohkoja** kun käsittelet operaatioita, jotka voivat aiheuttaa virheitä (esim. tietokantaoperaatiot).


## Yhteenveto

REST API:n virheidenkäsittely auttaa hallitsemaan sovelluksen eri virhetilanteita antamalla selkeät ja johdonmukaiset vastaukset virheisiin. On ymmärrettävä, että tässä virheiden määrittely on kuitenkin kehittäjän vastuulla, eli kehittäjän on itse suunniteltava ja ymmärrettävä, mikä virhe voi tapahtua missäkin osassa koodia.