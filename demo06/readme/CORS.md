# CORS - Cross-Origin Resource Sharing

### [<-- Takaisin](../README.md)

Vastauksessa on hyödynnetty Google Gemini 2.0 Flashia.

CORS (Cross-Origin Resource Sharing) on tietoturvamekanismi, joka mahdollistaa tai estää verkkosivuston tekemät pyynnöt toiseen kuin omaan verkkotunnukseen. Selaimet käyttävät tätä mekanismia rajoittaakseen JavaScript-koodin mahdollisuuksia tehdä pyyntöjä toisiin verkkotunnuksiin, mikä parantaa käyttäjien tietoturvaa.

## Miten CORS toimii?

1.  **Origin-otsikko:** Kun selain tekee pyynnön toiseen verkkotunnukseen, se lähettää `Origin`-otsikon, joka kertoo, mistä verkkotunnuksesta pyyntö tehdään.
2.  **Palvelimen vastaus:** Palvelin, johon pyyntö kohdistuu, voi tarkistaa `Origin`-otsikon ja päättää, hyväksyykö se pyynnön.
3.  **Access-Control-Allow-Origin -otsikko:** Jos palvelin hyväksyy pyynnön, se lähettää vastauksen mukana `Access-Control-Allow-Origin`-otsikon, joka kertoo, mistä verkkotunnuksista pyynnöt hyväksytään.
4.  **Selaimen tarkistus:** Selain tarkistaa `Access-Control-Allow-Origin`-otsikon ja vertaa sitä pyynnön lähettäneeseen verkkotunnukseen. Jos ne täsmäävät, selain sallii pyynnön. Muussa tapauksessa selain estää pyynnön ja näyttää virheilmoituksen.

## Miksi CORS:ia käytetään?

* **Tietoturva:** CORS suojaa käyttäjiä haitallisilta verkkosivustoilta, jotka yrittävät tehdä pyyntöjä toisiin verkkotunnuksiin.
* **Rajoitukset:** Verkkosivustot voivat rajoittaa, mistä muista verkkotunnuksista pyyntöjä voidaan tehdä.

## Node CORS -paketin käyttö Express-sovelluksessa

Node CORS -paketin avulla voit helposti määrittää CORS-säännöt Express-sovelluksessa. Tässä esimerkissä sallitaan pyynnöt `localhost:3000`:sta:

```ts
import express from 'express';
import cors from 'cors';

const App : express.Application = express();

const portti : number = Number(process.env.PORT) || 3006;

app.use(cors({origin : "http://localhost:3000"}));

// Määritä reitit tähän

app.listen(portti, () => {
    console.log(`Palvelin käynnissä osoitteessa http://localhost:${portti}`);
});
```

Tässä koodissa:

- `app.use(cors(...));`: Määritetään palvelin käyttämään cors-pakettia suluissa annetuilla `corsOptions`-parametreilla.
- `cors({origin: "http://localhost:3000"});`: Määritetään cors hyväksymään pyynnöt vain tästä osoitteesta, joka on asiakassovelluksen osoite.

Jos haluat sallia pyynnöt useammasta verkkotunnuksesta, voit määrittää ne `origin`-taulukossa:

```ts
const corsOptions = {
    origin: ['http://localhost:3000', 'https://www.toinensivusto.com']
};
```

Jos haluat sallia pyynnöt kaikista verkkotunnuksista, voit asettaa `origin`-arvoksi `true`:

```ts
const corsOptions = {
    origin: true
};
```

Huomaathan että kaikkien osoitteiden salliminen ei ole suositeltavaa tuotantosovelluksissa tietoturvasyistä.
