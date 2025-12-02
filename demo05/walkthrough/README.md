# Demo 5 - Läpikulku

Demossa 5 jatketaan ostoslista-sovelluksen kehittämistä ottamalla käyttöön **Prisma ORM** (Object-Relational Mapping) -työkalu. Tässä demossa korvaamme demoissa 3 ja 4 itse toteutetun `ostoslista.ts`-tietomallin ja `ostokset.json`-tietokantatiedoston oikealla SQLite-tietokannalla, jota käsitellään Prisma ORM:n avulla.

## Miksi Prisma ORM?

Demoissa 3 toteutettiin tietokannan käsittely itse hyödyntämällä File System -metodeja ja json-tiedostoa. Tarkoituksena oli havainnollistaa, mitä tietokantojen käsittelyssä periaatteessa tapahtuu konepellin alla. Todellisessa sovelluskehityksessä kukaan ei kuitenkaan käsittele tietokantoja tällä tavalla.

**Prisma ORM** on työkalu, joka:
- Hoitaa tietokantayhteyden käsittelyn puolestamme
- Tarjoaa valmiin rajapinnan eli API:n tietokannan CRUD-operaatioihin (Create, Read, Update, Delete)
- Määrittää tietokannan rakenteen selkeässä schema.prisma -tiedostossa
- Tukee eri tietokantoja (SQLite, PostgreSQL, MySQL jne.)
- Tarjoaa TypeScript-tyypityksen automaattisesti

Tässä demossa käytetään Prisma ORM:n versiota 5.22, joka on viimeisin Prisma 5 -versio. Tämä tehdään siksi, että demossa käytetty Prisman työnkulku perustuu ns. vanhaan menetelmään. Prismasta on julkaistu loppusyksystä 2025 uusi 7-versio, joka muutti työkalun toimintaa merkittävällä tavalla.

## 1 Lähtötilanne

Demo 5 alkaa edellisen demon lopusta. Demo 4 päättyi siihen, että:
- Ostosten tallentaminen tapahtuu `ostokset.json`-tiedostoon, joka ajoi sovelluksen tietokannan asiaa
- `ostoslista.ts`-tietomalli käsittelee tietokantatiedostoa
- `apiOstokset.ts`-rajapinta tarjoaa REST API:n, eli reittikäsittelijät ostosten käsittelyyn
- Virheenkäsittely on toteutettu keskitetyllä `virhekasittelija.ts`-middlewarella

Seuraavaksi tässä demossa:
1. Asennetaan Prisma ORM
2. Ostosten tietokannan rakenne määritetään `schema.prisma`-tiedostossa
3. Tietokanta generoidaan
4. `apiOstokset.ts`-rajapinta refaktoroidaan käyttämään Prismaa
5. Poistetaan tarpeeton tietomalli `ostoslista.ts`

## 2 Prisma ORM:n asentaminen ja alustaminen

### 2.1 Prisma:n asentaminen

Aloitetaan asentamalla Prisma projektiin. Prisma koostuu kahdesta osasta:
- **Prisma CLI** (Command Line Interface) - kehitystyökalu
- **Prisma Client** - tietokantakirjasto, jota koodissa käytetään

Asennetaan ensin Prisma CLI kehitysriippuvuudeksi (dev dependency):

```bash
npm install prisma@5 --save-dev
```

**TAI**

```bash
npm install prisma@5.22.0 --save-dev
```

Asennetaan sitten Prisma Client varsinaiseksi riippuvuudeksi:

```bash
npm install @prisma/client@5
```

**TAI**

```bash
npm install @prisma/client@5.22.0
```

**Huom!** Version määrittäminen on tärkeää. Ilman version lukitsemista npm asentaa uusimman version, joka olisi Prisma 7, ja se toimii eri tavalla kuin tässä demossa opetetaan. Asennettaessa Node-paketteja, version voi määrittää mille tahansa paketille käyttämällä paketin nimen perässä `@x.x.x` -syntaksia. Yllä olevista esimerkeistä kumpikin toimii. Käyttämällä pelkkää `@5`-merkintää, asennetaan 5-version (major version) viimeisin päivitys. Käyttämällä tarkempaa versionumerointia asennetaan juuri tietty minor-versio. Koska 5.22.0 on 5-version viimeisin päivitys, tekee kumpikin yllä olevista vaihtoehdoista saman asian.

### 2.2 Prisma:n alustaminen projektiin

Seuraavaksi alustetaan Prisma projektiin. Tämä luo tarvittavan kansiorakenteen ja asetustiedostot. Suoritetaan komento:

```bash
npx prisma init --datasource-provider sqlite
```

Tämä komento:
- Luo `/prisma`-kansion projektin juureen
- Luo `/prisma/schema.prisma`-tiedoston tietokannan rakenteen määrittelyä varten
- Luo `.env`-tiedoston ympäristömuuttujia varten (tätä ei tässä demossa tarvita SQLiten kanssa ja **tiedoston voi halutessaan poistaa**)

## 3 Tietokannan rakenteen määrittäminen

### 3.1 Schema.prisma -tiedosto

Avataan `/prisma/schema.prisma`-tiedosto. Tiedostossa on kaksi valmiiksi määriteltyä osiota:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = "file:./data.db"
}
```

- **generator client** - Määrittää, että Prisma generoi JavaScript/TypeScript-clientin
- **datasource db** - Määrittää käytettävän tietokannan (SQLite) ja sen sijainnin (data.db-tiedosto prisma-kansiossa)

**Huom!** Datasource-objektissa url on oletuksena määritetty viittaamaan .env-tiedoston muuttujaan. On tässä tilanteessa aivan sama, käyttääkö oletusta vai yllä esiteltyä url-merkintää. Osoite osoittaa kuitenkin paikalliseen `.db`-tiedostoon samassa kansiossa, joka luodaan tietokannan migraatiossa ja generoinnissa.

### 3.2 Ostokset-taulun määrittäminen

Lisätään schema-tiedostoon määrittely `Ostos`-taululle. Tämä vastaa aiempaa `Ostos`-interfacea, mutta nyt se määritellään Prisma-skeemana:

#### schema.prisma
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = "file:./data.db"
}

model Ostos {
  id       Int     @id @default(autoincrement())
  tuote    String
  poimittu Boolean @default(false)
}
```

`Ostos`-taulun määrittely:

- **model Ostos** - Määrittää tietokantaan "Ostos"-nimisen taulun
- **id Int @id @default(autoincrement())** - Määrittää taulun pääavaimen (@id - PRIMARY KEY). Id on kokonaisluku (Int) joka kasvaa automaattisesti (@default(autoincrement())). Pääavainta käytetään taulukon tietueisiin viittaamiseen ja uniikkiin erittelyyn. Useammalla tietueella voi olla sama ostoksen tuote-nimi, mutta id erittelee tietueet uniikeiksi arvoiksi.
- **tuote String** - Merkkijono-kenttä tuotteen nimelle
- **poimittu Boolean @default(false)** - Totuusarvo-kenttä tuotteen poimittu-tiedolle, jonka oletusarvo on false (@default(false))

Huomaa, että Prisma mahdollistaa automaattisen id:n hallinnan verrattuna Demojen 3 ja 4 monimutkaisen sort()-metodin käyttöön.

### 3.3 Tietokannan luominen

Kun tietokannan skeema on määritelty, voidaan luoda varsinainen tietokanta. Suoritetaan komento:

```bash
npx prisma migrate dev --name init
```

Tämä komento:
- Luo `/prisma/data.db`-tietokantatiedoston
- Luo `/prisma/migrations`-kansion migraatiohistorialle
- Generoi Prisma Client -koodin, jota käytämme TypeScript-tiedostoissa

Konsoliin tulostuu viesti, joka kertoo tietokannan luomisen onnistuneen. Projektin rakenne näyttää nyt tältä:

```
/projekti
  /prisma
    /migrations
      /[aikaleima]_init
        migration.sql
    schema.prisma
    data.db
  ...
```

Prisman versiossa 5 migraatio suorittaa taustalla myös automaattisesti Prisman tietokannan generoinnin. Joissain tilanteissa tietokantaa voi joutua generoimaan uusiksi komennolla `npx prisma generate`. Näin voi joutua tekemään esim. skeeman muutosten jälkeen.

### 3.4 Aloitustietojen lisääminen tietokantaan

Tietokanta on aluksi tyhjä. Voimme lisätä siihen Ostos-tietueita Prisman graaffisessa käyttöliittymässä:

```bash
npx prisma studio
```

Tämä avaa selaimen, jossa voit lisätä, muokata ja poistaa tietoja visuaalisesti. Ostoksia voi lisätä Ostos-tauluun valitsemalla sen Prisma Studion sivuvalikosta ja lisäämällä tietueen `Add record`-painikkeella. Muutokset pitää vielä tallentaa erikseen.

Lisää 3-4 ostosta Prisma Studiolla, jotta meillä on testidataa. Esimerkiksi:
- Tuote: "Vissyä", Poimittu: false
- Tuote: "Leipää", Poimittu: false
- Tuote: "Kahvia", Poimittu: false

## 4 Prisma Client:n käyttöönotto

### 4.1 PrismaClient-ilmentymän luominen

Nyt kun tietokanta on luotu ja skeema määritelty, voidaan Prisma ottaa käyttöön palvelinsovelluksessa. Prisma tarjoaa **PrismaClient**-luokan, jota käytetään rajapintana tietokannan käsittelyyn ohjelmallisesti.

Avataan `apiOstokset.ts`-tiedosto ja muutetaan koodia seuraavasti:

1. Poistetaan vanha Ostoslista-tietomallin tuonti
2. Tuodaan PrismaClient
3. Luodaan PrismaClientin ilmentymä

#### apiOstokset.ts
```typescript
import express from 'express';
import { Virhe } from '../errors/virhekasittelija';
import { PrismaClient } from '@prisma/client'; // Tuodaan PrismaClient Prisma-kirjastosta

// Poistetaan vanhat rivit:
// import Ostoslista, { Ostos } from '../models/ostoslista';
// const ostoslista : Ostoslista = new Ostoslista();

const prisma : PrismaClient = new PrismaClient(); // Luodaan PrismaClient-ilmentymä

const apiOstoksetRouter : express.Router = express.Router();

apiOstoksetRouter.use(express.json());

// Reittikäsittelijät...
```

`PrismaClient`-ilmentymä `prisma` on yhteys tietokantaan. Sen kautta pääsee käsiksi kaikkiin schema.prisma-tiedostossa määriteltyihin tauluihin `Ostos` mukaanlukien. Taulua voidaan hallita käyttäen `prisma.ostos`-metodeja.

### 4.2 Prisman CRUD-metodit

Ennen `apiOstokset`-rajapinnan refaktorointia, käydään läpi Prisman CRUD-perustoiminnot (Create, Read, Update, Delete):

**Kaikkien tietueiden hakeminen:**
```typescript
await prisma.ostos.findMany()
```

**Yhden tietuen hakeminen:**
```typescript
await prisma.ostos.findUnique({
    where: { id: 1 } // Tai mikä tahansa muu ehto
})
```

**Tietueen lisääminen:**

Uuden tiedon lisäämiseen käytetään data-ominaisuutta, joka on objekti samalla rakenteella, mitä taulun skeemassa on määritelty. Koska id-määritetään automaattisesti Prisman toimesta, ei sitä tarvitse erikseen määrittää tässä. Samoin, jos taulussa on vaihtoehtoiseksi merkittyjä kenttiä, ei niitä ole pakko lisätä data-objektin yhteydessä. Samoin, jos tietueen sarake on vaihtoehtoinen (`?`-merkki), ei tietoa ole pakko sisällyttää data-objektiin.

```typescript
await prisma.ostos.create({
    data: {
        tuote: "Maitoa",
        poimittu: false
    }
})
```

**Tietueen päivittäminen:**

Tietueen päivittäminen tapahtuu hakemalla tietuetta jollain ehdolla (where) ja ylikirjoittamalla tietueen sarakkaiden arvot data-objektin tiedoilla.

```typescript
await prisma.ostos.update({
    where: { id: 1 },
    data: {
        tuote: "Maitoa",
        poimittu: true
    }
})
```

**Tietueen poistaminen:**
```typescript
await prisma.ostos.delete({
    where: { id: 1 }
})
```

**Tietueiden laskeminen:**
```typescript
await prisma.ostos.count({
    where: { id: 1 }
})
```

Kaikki nämä metodit ovat **asynkronisia**, joten niitä kutsuttaessa tulee käyttää `await`-avainsanaa. Samoin kuin `ostoslista.ts`-tietomallin kanssa.

## 5 Reittikäsittelijöiden refaktorointi

Käydään seuraavaksi läpi jokainen `apiOstokset`-reittikäsittelijä ja refaktoroidaan ne käyttämään Prismaa aiemman Ostoslista-tietomallin sijaan.

### 5.1 GET / - Kaikkien ostosten hakeminen

Yksinkertaisin reitti on kaikkien ostosten hakeminen. Aiemmin kutsuttiin `ostoslista.haeKaikki()`, nyt kutsutaan `prisma.ostos.findMany()`.

```typescript
apiOstoksetRouter.get("/", async (req : express.Request, res : express.Response, next : express.NextFunction) => {

    try {
        res.json(await prisma.ostos.findMany()); // Haetaan kaikki ostokset Prismalla
    } catch (e : any) {
        next(new Virhe()); // Jos tapahtuu virhe, välitetään se virhekäsittelijälle
    }
});
```

### 5.2 GET /:id - Yhden ostoksen hakeminen

Yhden ostoksen hakemisessa pitää ensin varmistaa, että ostos löytyy annetulla id:llä. Käytetään tähän `count()`-metodia. Jos count-metodi palauttaa 1, tiedetään, että tietokannasta löytyy ostos annetulla id:llä. Tämän jälkeen se voidaan hakea.

```typescript
apiOstoksetRouter.get("/:id", async (req : express.Request, res : express.Response, next : express.NextFunction) => {

    try {

        // Tarkistetaan ensin, löytyykö ostosta annetulla id:llä
        if (await prisma.ostos.count({
            where : {
                id : Number(req.params.id) // where-ehdolla määritetään hakukriteeri
            }
        }) === 1) {
            // Jos löytyy tasan yksi ostos, haetaan se
            res.json(await prisma.ostos.findUnique({
                where : {
                    id : Number(req.params.id)
                }
            }))
        } else {
            // Jos ei löydy, lähetetään virhe
            next(new Virhe(400, "Virheellinen id"));
        }
        
    } catch (e: any) {
        next(new Virhe());
    }
});
```

- `count()` laskee montako tietuetta täsmää where-ehtoon
- Jos count palauttaa 1, tiedetään, että ostos löytyy
- `findUnique()` hakee yksittäisen tietueen pääavaimen perusteella
- `where`-objektilla määritellään hakuehdot

### 5.3 POST / - Uuden ostoksen lisääminen

Ostoksen lisäämisessä tarkistetaan ensin, että pyynnön bodyssä on kelvollista dataa, ja sitten luodaan uusi tietue `create()`-metodilla.

```typescript
apiOstoksetRouter.post("/", async (req : express.Request, res : express.Response, next : express.NextFunction) => {

    // Tarkistetaan, että tuote-kenttä ei ole tyhjä
    if (req.body.tuote?.length > 0) {

        try {

            await prisma.ostos.create({
                data : { // data-objektissa määritellään uuden tietueen kentät
                    tuote : req.body.tuote,
                    poimittu : Boolean(req.body.poimittu)
                }
            });
            // Huom! id-kenttää ei tarvitse määritellä - se generoidaan automaattisesti!
    
            res.json(await prisma.ostos.findMany()); // Palautetaan kaikki ostokset lisäyksen jälkeen
    
        } catch (e : any) {
            next(new Virhe())
        }

    } else {
        next(new Virhe(400, "Virheellinen pyynnön body"));
    }

});
```

**Huomioita:**
- id-kenttää ei määritellä manuaalisesti vaan Prisma hoitaa automaattisen id:n generoinnin.
- `data`-objektissa määritellään vain ne kentät, jotka pitää/halutaan asettaa
- `poimittu`-kentälle on schema.prismassa oletusarvo `false`, joten sen voisi jättää pois

### 5.4 PUT /:id - Ostoksen päivittäminen

Päivittämisessä tarkistetaan ensin, että ostos löytyy (sama kuin yhden ostoksen hakemisessa). Sen jälkeen data validoidaan päivitystä varten ja lopuksi tietue päivitetään `update()`-metodilla.

```typescript
apiOstoksetRouter.put("/:id", async (req : express.Request, res : express.Response, next : express.NextFunction) => {

    // Tarkistetaan, että ostos löytyy annetulla id:llä
    if (await prisma.ostos.count({
        where : {
            id : Number(req.params.id)
        }
    }) === 1) {
        // Validoidaan bodyn sisältö
        if (req.body.tuote?.length > 0 && (req.body.poimittu === true || req.body.poimittu === false)) {

            try {

                await prisma.ostos.update({
                    where : {
                        id : Number(req.params.id) // Määritetään päivitettävä tietue
                    },
                    data : {
                        tuote : req.body.tuote, // Päivitetään tuote-kenttä
                        poimittu : req.body.poimittu // Päivitetään poimittu-kenttä
                    }
                });
        
                res.json(await prisma.ostos.findMany());
            } catch (e : any) {
                next(new Virhe())
            }
        } else {
            next(new Virhe(400, "Virheellinen pyynnön body"));
        }
    } else {
        next(new Virhe(400, "Virheellinen id"));
    }
});
```

**Huomioita:**
- `update()` vaatii sekä `where`- että `data`-objektit
- `where` määrittää sen, mikä tietue päivitetään
- `data` määrittää sen, mitkä kentät päivitetään ja mihin arvoihin

### 5.5 DELETE /:id - Ostoksen poistaminen

Viimeisenä poisto-operaatio. Tarkistetaan jälleen ensin ostoksen olemassaolo ja sitten poistetaan se `delete()`-metodilla.

```typescript
apiOstoksetRouter.delete("/:id", async (req : express.Request, res : express.Response, next : express.NextFunction) => {

    // Tarkistetaan, että ostos löytyy
    if (await prisma.ostos.count({
        where : {
            id : Number(req.params.id)
        }
    }) === 1)  {
        try {

            await prisma.ostos.delete({
                where : {
                    id : Number(req.params.id) // Määritetään poistettava tietue
                }
            });

            res.json(await prisma.ostos.findMany());

        } catch (e : any) {
            next(new Virhe())
        }
    } else {
        next(new Virhe(400, "Virheellinen id"));
    }

});
```

## 6 Vanhojen tiedostojen poistaminen

Nyt kun reittikäsittelijät on refaktoroitu käyttämään Prismaa, voidaan poistaa tarpeettomaksi käyneet tiedostot:

1. **ostoslista.ts**-tietomallia ei enää tarvita, Prisma hoitaa tietokannan käsittelyn.
2. **ostokset.json**-tietokantatiedostoa ei enää tarvita, data löytyy nyt data.db-tietokantatiedostosta.

Palvelimen juuritiedosto `index.ts` pysyy ennallaan - muutokset tehtiin vain `apiOstokset.ts`-rajapintaan.

## 7 Sovelluksen testaaminen

Käynnistetään palvelin ja testataan, että kaikki toimii Postmanilla. Huomaa, että portiksi on vaihdettu 3005 `index.ts`-tiedostossa demosovelluksen erottamiseen aiemmista demoista.

### 7.1 Kaikkien ostosten hakeminen

GET `http://localhost:3005/api/ostokset`

### 7.2 Yhden ostoksen hakeminen

GET `http://localhost:3005/api/ostokset/1`

### 7.3 Uuden ostoksen lisääminen

POST `http://localhost:3005/api/ostokset`

**Body:**
```json
{
  "tuote": "Jäätelöä",
  "poimittu": false // vaihtoehtoinen kenttä, määritetään oletuksen false Prisma-skeemassa
}
```

### 7.4 Ostoksen päivittäminen

PUT `http://localhost:3005/api/ostokset/1`

**Body:**
```json
{
  "tuote": "Vissyä",
  "poimittu": true
}
```

Ostos, jonka id on 1, saa arvot "Vissyä" ja true.

### 7.5 Ostoksen poistaminen

DELETE `http://localhost:3005/api/ostokset/4`

## 8 Lopuksi

Tässä demossa siirryimme itse toteutetusta tietokannan käsittelystä ORM-työkalun käyttöön. Tämä on merkittävä askel kohti todellisia tuotantosovelluksia.

### Mitä opimme:

1. **Prisma ORM:n perusteet** - Skeeman määrittely, migraatiot, Prisma Clientin CRUD-operaatiot
2. **SQLite-tietokannan käyttö** - Yksinkertainen tiedostopohjainen tietokanta kehitystyöhön

### Miksi Prisma on parempi kuin itse toteutettu tietomalli:

1. **Automaattinen tyypitys** - Prisma generoi TypeScript-tyypit automaattisesti skeemasta
2. **Tietoturva** - Prisma suojaa SQL-injektiolta automaattisesti
3. **Ylläpidettävyys** - Skeematiedosto toimii dokumentaationa ja tietokannan määrittäjänä
4. **Migraatiot** - Tietokannan muutoksia voidaan hallita versionhallintaa hoitavalla migratoinnilla
6. **Monipuolisuus** - Sama koodi toimii eri tietokantojen kanssa (SQLite, PostgreSQL, MySQL)