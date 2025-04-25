# Express-palvelin (Web Service)

### [<- Takaisin](../README.md)

[`index.ts`](../index.ts) määrittää Express-palvelimen, eli Web Servicen. Aiemmissa demoissa Web Servicen reitit oli määritetty tähän tiedostoon, mutta tässä demossa havainnollistetaan nyt routejen käyttö palvelimen rajapintojen määrittämiseksi. Palvelimen kontekstissa API tai ohjelmointirajapinta tarkoittaa niistä reiteistä muodostuvaa kokonaisuutta, joiden kautta sovellukset kommunikoivat keskenään. Yleensä API:t rajataan vielä omiin konteksteihinsa, esimerkiksi yhdellä API:lla voidaan hallita jotain tiettyä järjestelmää tai tietokantaa. Palvelimella voisi siis olla useampiakin rajapintoja, mutta tässä demossa on luotu vain yksi.

## 1. Moduulien importit

```ts
import express from 'express';
import path from 'path';
import apiOstoksetRouter from './routes/apiOstokset';
import virhekasittelija from './errors/virhekasittelija';
```

Tuodaan palvelimen tarvitsemat lisäosat käyttöön.

1. `import express from 'express'`: Tuodaan käyttöön express palvelimen määrittämiseksi.
2. `import path from 'path'`: Tuodaan käyttöön path-aputyökalu reittien ohjelmalliseen määrittämiseen.
3. `import apiOstoksetRouter from './routes/apiOstokset'`: Tuodaan käyttöön routes-kansiossa määritetty [apiOstokset](../routes/apiOstokset.ts) router.
4. `import virhekasittelija from './errors/virhekasittelija'`: Tuodaan käyttöön errors-kansiossa määritetty virhekäsittelijä.

## 2. Palvelimen määrittäminen

```ts
const app : express.Application = express();
const portti : number = Number(process.env.PORT) || 3004;
```

Palvelin määritetään vakioon `app`, jonka arvoksi tulee expressin muodostin. Palvelimen portiksi määritetään joko ympäristömuuttujista tuleva `PORT` tai 3004.

## 3. Palvelimen asetusten määrittäminen (middlewaret)

```ts
app.use(express.static(path.resolve(__dirname, "public")));
app.use("/api/ostokset", apiOstoksetRouter);
app.use(virhekasittelija);

app.use((req : express.Request, res : express.Response, next : express.NextFunction) => {

    if (!res.headersSent) {
        res.status(404).json({ viesti : "Virheellinen reitti"});
    }

    next();
});
```

1. Määritetään staattisten tiedostojen kansio, josta palvelin tarjoaa tiedostoja. Kansion hakemistopolku muodostetaan path-aputyökalun resolve-metodilla, joka automaattisesti yhdistää parametreina annetut reitin pätkät kokonaiseksi absoluuttiseksi reitiksi. `__dirname`-avaimella määritetään absoluuttinen reitti suorittavan tiedoston tasolle asti, eli `index.ts`:n tasolle. Tästä seuraavat parametrit määrittävät lopun reitistä. Koska staattisten tiedostojen kansio on palvelimen juuresta yksi kansio "syvemmälle" (public), lisätään se toiseksi parametriksi.
2. Määritetään palvelin käyttämään reititystä/routea `/api/ostokset`, jonka sisältämät tarkemmat reitit on määritetty tuodussa `apiOstoksetRouter`-moduulissa (eli `apiOstokset.ts`-tiedosto). Reitityksen määritys tarkoittaa siis sitä, että palvelimella on olemassa tällainen route `/api/ostokset`, joka jatkuu palvelimen juuresta `/`. Route on määritelty omassa tiedostossaan, jonne on kirjoitettu tarkemmin erilaiset reitit, joihin pyyntöjä voidaan tehdä. Kun näihin reitteihin halutaan päästä käsiksi, pitää palvelimen juureen lisätä `/api/ostokset`, joka sitten itsessään toimii Ostokset APIn juurena.
    - **Huomioi**, ettet kirjoita reittiä näin kahdella juuren kauttaviivalla: <i>http://localhost:3004//api/ostokset</i>, **vaan** <i>http://localhost:3004/api/ostokset</i>. `/api/ostokset`-routen ensimmäinen `/` on sama, kuin palvelimen juuri.
3. Määritetään palvelin käyttämään virhekäsittelijää. Virhekäsittelijä määrittää vastaukset sellaisiin tilanteisiin, joissa reitti voi olla oikein, mutta esimerkiksi pyynnön otsikkotiedoissa on vikaa tai palvelin ei toimi odotetusti. Tämän toiminnasta tarkemmin [virhekäsittelijän dokumentaatiossa](./REST-API-virhekäsittelijä.md)
4. Määritetään yleinen virhekäsittely kaikille sellaisille reiteille, joita ei ole määritelty palvelimella. Jos käyttäjä lähettää pyynnön reittiin, jota ei ollenkaan ole palvelimella, vastaa palvelin yleisellä virheilmoituksella `404. Virheellinen reitti`.
    - `if (!res.headersSent)` tarkistaa, onko pyynnön otsikkotietoja lähetetty. Jos ei ole, niin voidaan päätellä, että reitti on todennäköisesti virheellinen ja palautetaan vastauksena virhekäsittelijä json-muotoisena.
    - `res.status(404)` määrittää vastauksen [HTTP-statuksen](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status). Virhekäsittelijään voidaan ketjuttaa json-muotoinen viesti, joka tulostetaan osana vastausta komentokehotteeseen `.json({ viesti : "Virheellinen reitti"});`.

## 4. Palvelimen käynnistäminen

```ts
app.listen(portti, () => {
    console.log(`Palvelin käynnistyi osoitteeseen: http://localhost:${portti}`);    
});
```

Palvelin käynnistetään asettamalla se kuuntelemaan määritettyä reittiä ja siihen tulevia pyyntöjä.