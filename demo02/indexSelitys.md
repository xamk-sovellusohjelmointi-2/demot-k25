# Express-sovellus

> Pohjautuu tekoälyn (Claude.ai, 2025) muodostamaan selitykseen koodista.

Aloitetaan alkuosan määrittelyistä:

```typescript
import express from 'express';
import path from 'path';
import kayttajat, { Kayttaja } from './models/kayttajat';
```
Nämä rivit tuovat sovelluksen tarvitsemat moduulit. Express on web-sovelluskehys, path auttaa tiedostopolkujen käsittelyssä, ja kayttajat-tiedostosta tuodaan käyttäjätiedot sekä Kayttaja-rajapinta.

```typescript
const app: express.Application = express();
const portti: number = Number(process.env.PORT) || 3002;
```
Tässä luodaan Express-sovellus ja määritellään portti. Jos ympäristömuuttujissa on määritelty PORT, käytetään sitä, muuten käytetään porttia 3002.

Seuraavaksi määritellään kaksi rajapintaa:
```typescript
interface Kayttajatieto {
    id: number,
    nimi: string,
    sahkoposti: string,
    kayttajatunnus: string,
    rekisteroitymisPvm: string
}

interface Yhteystieto {
    id: number,
    nimi: string,
    sahkoposti: string
}
```
Nämä määrittelevät tietorakenteet käyttäjä- ja yhteystiedoille. Huomaa, että Yhteystieto on suppeampi versio Kayttajatieto-rajapinnasta.

```typescript
app.use(express.static(path.resolve(__dirname, "public")));
```
Tämä rivi määrittää staattisten tiedostojen (kuten HTML, CSS, JavaScript) sijainnin public-kansiossa.

## Reitit (Web Service -haku)

### 1. Yksittäisen käyttäjän yhteystiedot ``/yhteystiedot/:id``:

```typescript
app.get("/yhteystiedot/:id", (req: express.Request, res: express.Response): void => {
    let yhteystieto: Yhteystieto | undefined = kayttajat.map((kayttaja: Kayttaja) => {
        return {
            id: kayttaja.id,
            nimi: `${kayttaja.etunimi} ${kayttaja.sukunimi}`,
            sahkoposti: kayttaja.sahkoposti
        }
    }).find((yhteystieto: Yhteystieto) => yhteystieto.id === Number(req.params.id));
```

Tämä reitti käsittelee pyynnöt muodossa "/yhteystiedot/1", missä 1 on käyttäjän ID.

- `let yhteystieto : Yhteystieto | undefined`: määritellään muuttuja yhteystieto, johon haettava käyttäjän yhteystieto tallennetaan. Koska hakuparametrina annetulla id:llä voidaan löytää tai olla löytämättä käyttäjä, pitää kumpikin vaihtoehto huomioida metodin tyypityksessä.

- `kayttajat.map((kayttaja : Kayttaja)) => {...}`: "mapataan" käyttäjät, eli käydään ne yksi kerrallaan läpi. `kayttajat`-array tuotiin `kayttajat.ts`-tiedostosta. `map()` on arrayn käsittelymetodi.
    - `map()` luo kopion arrayn sisällöstä. "mappaus" tehdään, jotta arrayn tietoja voidaan tutkia jälkimmäisellä `find()`-metodilla.
    - `map()`-metodin parametrina määritellään nuolifunktio, eli tehdään "mapatuille" tiedoile jotain. Tässä tilanteessa käyttäjästä luotu `Yhteystieto` palautetaan (return) ketjutetun metodin `find()` käsiteltäväksi.
    - `map()` on kuin muunnosliukuhihna. Se käy läpi jokaisen alkuperäisen käyttäjän ja muuntaa sen uuteen muotoon. Esimerkiksi alkuperäinen käyttäjä voisi olla:
        - ```typescript
            {
                id: 1,
                sukunimi: "Meikäläinen",
                etunimi: "Matti",
                sahkoposti: "matti@email.com",
                kayttajatunnus: "mattime",
                salasana: "5548746452ceef5433d972cbe7eec6f3aa3005f6c03df0b61c0c2145503155c5",
                ipOsoite: "106.223.35.204",
                rekisteroitymisPvm: "2020-10-08T08:17:24Z"
            }
            ```
        - `map()` muuntaa sen `Yhteystieto`-rajapinnan mukaiseksi:
        - ```typescript
            {
                id: 1,
                nimi: "Matti Meikäläinen",
                sahkoposti: "matti@email.com"
            }
            ``` 
- `find()` puolestaan etsii tästä muunnetusta listasta sen yhteystiedon, jonka id vastaa URL:ssä annettua id:tä. Jos URL on `/yhteystiedot/1`, find etsii yhteystiedon, jonka id on 1

### 2. Kaikkien käyttäjien yhteystiedot ``/yhteystiedot``:
```typescript
app.get("/yhteystiedot", (req: express.Request, res: express.Response): void => {
    let yhteystiedot: Yhteystieto[] = kayttajat.map((kayttaja: Kayttaja) => {
        return {
            id: kayttaja.id,
            nimi: `${kayttaja.etunimi} ${kayttaja.sukunimi}`,
            sahkoposti: kayttaja.sahkoposti
        }
    });
```

Tässä tehdään sama map-muunnos kuin edellä, mutta nyt palautetaan koko lista. Jos alkuperäisessä listassa olisi kolme käyttäjää, palautetaan kolme yhteystietoa. Yhteystieto[]-merkintä tarkoittaa, että kyseessä on taulukko Yhteystieto-tyyppisiä objekteja.

### 3. Kaikki käyttäjätiedot vuosisuodatuksella ``/kayttajatiedot``:

```typescript
app.get("/kayttajatiedot", (req: express.Request, res: express.Response): void => {
    let kayttajatiedot: Kayttajatieto[] = kayttajat.map((kayttaja: Kayttaja) => {
        return {
            id: kayttaja.id,
            nimi: `${kayttaja.etunimi} ${kayttaja.sukunimi}`,
            sahkoposti: kayttaja.sahkoposti,
            kayttajatunnus: kayttaja.kayttajatunnus,
            rekisteroitymisPvm: kayttaja.rekisteroitymisPvm
        }
    });

    if (typeof req.query.vuosi === "string") {
        kayttajatiedot = kayttajatiedot.filter((kayttajatieto: Kayttajatieto) => 
            kayttajatieto.rekisteroitymisPvm.substring(0, 4) === req.query.vuosi);
    }
```

Tässä on kaksi vaihetta:

1. Ensin map-funktiolla muunnetaan käyttäjät Kayttajatieto-rajapinnan mukaisiksi. Tämä rajapinta sisältää enemmän tietoja kuin Yhteystieto.
2. Jos URL:ssä on vuosi-parametri (esim. "/kayttajatiedot?vuosi=2024"), filter-funktio suodattaa listasta vain ne käyttäjät, joiden rekisteröitymisvuosi vastaa annettua vuotta. Substring(0, 4) ottaa päivämäärästä neljä ensimmäistä merkkiä eli vuosiluvun.

Rajapintojen käyttö (Yhteystieto ja Kayttajatieto) auttaa TypeScriptiä varmistamaan, että palautettava tieto on oikeassa muodossa. Ne toimivat kuin sopimus: "tässä on täsmälleen ne tiedot, jotka lupaamme palauttaa".

### Lopuksi palvelimen käynnistys:
```typescript
app.listen(portti, () => {
    console.log(`Palvelin käynnistyi osoitteeseen: http://localhost:${portti}`);
});
```
Tämä käynnistää palvelimen määritettyyn porttiin ja tulostaa konsoliin vahvistuksen käynnistymisestä.