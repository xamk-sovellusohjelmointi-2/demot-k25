# Prisma ORM asennus ja käyttöönotto

### [<-- Takaisin](../README.md)

Demossa Prisma-tietokanta on jo toteutettu, mutta käydään tässä alusta asti läpi Prisma ORM:n käyttöönotto ja toteutus osana REST API Web Service -sovellusta. Joudutte kuitenkin tätä käyttämään jatkossa itsenäisesti, joten on hyvä osata ainakin perusteet-tasolla asiat.

Prisma ORM:stä ja sen käytöstä voit lukea lisää [dokumentaatiosta](https://www.prisma.io/docs/getting-started/quickstart-sqlite "https://www.prisma.io/docs/getting-started/quickstart-sqlite").

## 1. Asentaminen

1) Aloita alustamalla uusi Node-projekti normaalisti ja asentamalla TypeScript ja Noden tyypit:

    `npx install typescript @types/node -D`

2) Tämän jälkeen asenna Prisma osaksi projektia kehitysriippuvuutena (voit myös yhdistää asennuskomennot edellisen kanssa)

    `npx install prisma -D`

   **Päivitys 10.4.2025**

    Prisman uusimmalla versiolla 6.6.0 voi tulla ongelma demon ohjeistuksen kanssa. Näyttäisi siltä, että Prisman käyttöönotto on voinut muuttua tai siinä on bugi, jonka takia asentamalla Prisman viimeisimmän version (6.6.0) komennolla `npm install -D prisma` tietokannan luominen ei onnistu pelkällä migraatiolla, kuten demon ohjeistuksessa neuvotaan.
    
    Helpoin tapa varmistua Prisman toiminnasta on asentaa demoissa käytetty versio 6.3.1. Tämä onnistuu uusiin projekteihin korvaamalla Prisman asennuskomento seuraavasti: `npm install -D prisma@6.3.1`, joka asentaa Prismasta sen version, jolla demojen mukainen tapa vielä toimii.

4) Seuraavaksi Prisma ORM pitää alustaa projektissa komennolla:

    `npx prisma init --datasource-provider sqlite`
    - Yllä olevassa komennossa määritetään samalla tietokannaksi SQLite
    - Komento luo projektikansioon uuden prisma-kansion sisältäen schema.prisma -tiedoston, joka toimii tietokannan mallina luomista varten.

## 2. Tietokannan muodostaminen

Seuraavaksi tietokannan [skeema](../prisma/schema.prisma) (schema) pitää määrittää halutuilla tietokannan tauluilla (model).

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

Skeemassa `generator` on määritetty automaattisesti ja `datasource` määriteltiin osana asennusta SQLite:ksi. Tavallisesti prisma määrittää tietokannan datan osoitteeksi ympäristömuuttujan `.env`, joka sisältää saman määritelmän kuin yllä oleva koodi `"file:./data.db"`. Voit itse päättää, kirjoitatko tietokannan datan lähteen suoraan yllä olevaan skeemaan vai pidätkö sen erillään ympäristömuuttujassa.

Tämän jälkeen on ostoslista-sovelluksessa käytetty Ostos-olio määritelty omana taulunaan tietokantaan. Tauluja kutsutaan nimellä `model`, jonka jälkeen tehdään taulun sarakkeiden, eri erilaisten tietojen määritykset. Ostos sisältää uniikin tunnisteen `id`, johon tässä toteutuksessa käytetään kokonaislukuja alkaen nollasta. `@id @default(autoincrement())` -määrittelee muun muassa sen, että kyseistä saraketta `id` käytetään taulun tietueiden ensisijaisina avaimina (Primary Key). Samalla `id`-sarakkeen arvo uusien tietueiden luonnissa määritetään kasvamaan automaattisesti yhdellä, eli tietokanta hoitaa `id`:n arvon määrittämisen automaattisesti. Määritetään ostokselle vielä jo tuttu `tuote`-arvo (string) ja `poimittu`-tieto (boolean). `@default(false)` määrittää `poimittu`-tiedon arvoksi uutta tietuetta luotaessa automaattisesti `false`.

## 3. Tietokannan luonti migraatiolla

Nyt kun tietokannan skeema on määritelty halutunlaiseksi, pitää itse tietokanta vielä luoda. Tämä tapahtuu migratoimalla ensimmäinen versio tietokannasta komennolla:

`npx prisma migrate dev --name init`

Yllä olevassa komennossa suoritetaan Prisma `migrate`-komento, jossa määritetään ensimmäinen migraatio nimellä "init".

## 4. Tietokannan käyttäminen sovelluksessa

Nyt kun tietokanta on luotu, se voidaan ottaa käyttöön. Tätä varten kuitenkin tarvitaan vielä toinen Prisman paketti `@prisma/client` Node-projektin tavallisena riippuvuutena.

`npm install @prisma/client`

Tietokanta sisällytetään palvelinsovellukseen liittämällä oheinen koodi [`apiOstokset.ts`-tiedostoon](../routes/apiOstokset.ts). Tietokanta otetaan käyttöön indexin sijasta apiOstoksissa johtuen juuri siitä, että REST API:n mukaisesti haluamme erotella ostoslistan hallintaan liittyvät osat palvelimesta oman routen alle.

```ts
import { PrismaClient } from '@prisma/client'

const prisma : PrismaClient = new PrismaClient();
```

Nyt Prisma-tietokantaa voidaan hallita ohjelmassa komennolla `prisma`. Esimerkiksi voidaan toteuttaa haku kaikista tietokannan tietueista. Kuten aiemmassakin demossa, tietokannan käsittely tehdään eri REST API -reittien kautta:

```ts
apiOstoksetRouter.get("/", async (req : express.Requst, res : express.Response, next : express.Nextfunction) => {
    try {
        res.json(await prisma.ostos.findMany());
    } catch (e: any) {
        next(new Virhe());
    }
});
```

Huomaa, että tietokannan käsittely toteutetaan asynkroonisesti `async...await` -komentopareilla, joista `async`-osa lisätään reitin nuolifunktion eteen määrittelemään, että kyseessä on asynkrooninen funktio ja `await`-osaa käytetään niiden komentojen edessä, joita halutaan "odottaa". Tämä tehdään siksi, että tietokannan kasvaessa haun tekemisessä saattaa kestää jonkin aikaa. Jos ohjelmaa suoritettaisiin normaalisti järjestyksessä, voisi liian hidas haku johtaa ongelmiin joko ohjelman suorituskyvyssä tai tietojen käsittelyn onnistumisessa.

### [<-- Takaisin](../README.md)
