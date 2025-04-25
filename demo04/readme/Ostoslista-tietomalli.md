# Ostoslista-luokka

### [<- Takaisin](../README.md)

Ostoslista-luokkaa käytetään määrittämään julkiset metodit, joiden kautta [ostoslista-"tietokantaa"](../models/ostokset.json) käsitellään. Tulevissa demoissa tietokantana käytetään Prisma ORM:ää, eikä tällaista erillistä tietokannan "käsittelyluokkaa" enää tehdä. On kuitenkin hyvä ymmärtää kokonaisuus, miten REST API -sovellukset voivat keskustella muiden järjestelmien kanssa.

## 1. Moduulien tuonti

```ts
import {readFile, writeFile} from 'fs/promises';
import path from 'path';
```

Ostoslista-luokka käyttää json-tiedoston lukemiseen ja kirjoittamiseen File System -aputyökalua. Työkalusta tuodaan "promises-versio", koska tallentaminen tapahtuu asynkroonisesti.

## 2. Ostos-rajapinnan määrittäminen

```ts
export interface Ostos {
    id : number,
    tuote : string,
    poimittu : boolean
}
```

Ostoslista koostuu yksittäisistä ostoksista, jotka tallennetaan "tietokantaan". Palvelimelle lähetettävien pyyntöjen otsikkotiedoista pitää saada sen muotoisia, että ne sopivat tietokantaan kirjoittamiseen. Tähän käytetään apuna Ostos-rajapintaa.

## 3. Ostoslista-luokka

Tietojen vastaanottaminen Ostokset API:lta ja niiden tallentaminen tietokantaan tapahtuu Ostoslista-luokassa. Luokka on tietorakenne, joka määrittää jossakin kontekstissa käsiteltävän tiedon ominaisuuksia ja metodeja. Esimerkiksi tässä luodaan Ostoslistan käsitteelle oma luokka, joka sisältää ostoslistan ominaisuudet ja sen käsittelyyn käytettävät metodit, eli toiminnallisuuden.

Ostoslista-luokan käyttö on hyödyllistä siksi, että nyt tietojen tallentamiseen tarvittava koodi on eroteltu Ostokset API:sta, jonka rooli on vain määrittää sovelluksella käytettävät pyyntöjen reitit. Periaatteessa luokassa määriteltävät metodit voitaisiin viedä vaikka palvelimen [juureen](../index.ts), mutta REST API -käytäntöjen mukaisesti ajatus on, että eri käyttötarkoitusten koodit sijaitsevat omissa konteksteissaan.

## 3.1 Ostoslista-luokan ominaisuuksien määrittäminen

```ts
private ostokset : Ostos[] = [];
private tiedosto : string[] = [__dirname, "ostokset.json"];
```

Ensimmäiseksi määritellään Ostoslistan ominaisuudet. Ostoslista käsittelee kahta tietoa:

1. Pyynnöistä saatavien ostos-tietojen käsittely `ostokset`-muuttujassa. `ostokset` on array, joka sisältää Ostos-rajapinnan määrittämiä Ostos-olioita. Koska "tietokannasta" saatavien tietojen tallennus pitää tehdä kokonaisen arrayn kautta, on Ostoslista-luokan ominaisuutena kaikki ostokset, eikä yksittäinen ostos.
2. Ostoslista-luokka käsittelee `ostokset.json`-tiedoston tietoja, joka esittää tässä demossa ostosten tietokantaa. `tiedosto`-muuttuja on string-array, joka sisältää `__dirname` ja `ostokset.json` reitit merkkijonoina, joista ostosten tietokantatiedoston lopullinen absoluuttinen reitti muodostetaan FileSystemilla käsittelyä varten.
    - `__dirname` on mainittu jo toisaalla, mutta kerrataan tässäkin. Apusana muodostaa ohjelmallisesti absoluuttisen reitin palvelinta ylläpitävän tietokoneen levyaseman juuresta, aina suorittavan tiedoston sijaintiin (tämän `ostoslista.ts`-tiedoston sijainti, eli `models`-kansio). `ostokset.json` sijaitsee samassa kansiossa, eli kun `__dirname`-polku yhdistetään tähän tiedostonimeen, saadaan muodostettua ´ostokset.json´-tiedoston absoluuttinen reitti.

## 3.2 Ostoslistan muodostin

```ts
constructor() {

        readFile(path.resolve(...this.tiedosto), "utf8")
            .then((data : string) => {
                this.ostokset = JSON.parse(data);
            })
            .catch((e : any) => {
                throw new Error(e);
            });

    }
```

Ostoslista-luokalle on määritettävä muodostin, jolla luokan ilmentymä muodostetaan. Kun ilmentymä muodostetaan, `constructor()`-metodin sisältämä koodi suoritetaan, joka lukee `ostokset.json`-tiedoston sisältämän datan ja parsii sen `ostokset`-muuttujaan, joka oli Ostos-olioiden lista.

1. ```ts
    readFile(path.resolve(...this.tiedosto), "utf8")
    ```
    Luetaan `ostokset.json` tiedosto käyttäen File System -moduulin `readFile()`-metodia. Ensimmäisessä parametrissa path-aputyökalua käytetään muodostamaan tiedoston absoluuttinen hakemistopolku `resolve()`-metodilla, joka ottaa vastaan absoluuttista hakemistopolkua vastaavat reitin osat (määritelty `tiedosto`-muuttujassa, `[__dirname, "ostokset.json"]`). `readFile()`-metodin toinen parametri `"utf8"` määrittää, miten tiedosto on enkoodattu.
2. ```ts
    .then((data : string) => {
                this.ostokset = JSON.parse(data);
            })
    ```
    Kun tiedosto on luettu, tehdään seuraava asia `.then()`. Määritetään metodin callbackina nuolifunktio, joka ottaa parametrikseen data-merkkijonon, joka on `ostokset.json`-tiedostosta luettu tieto. Tieto luetaan siis yhtenä merkkijonona `readFile()`-metodilla, jolloin se pitää vielä parsia JSON-muotoiseksi, käyttäen `JSON.parse(data)`-metodia. Koska `ostokset`-muuttuja oli Ostos-olioita sisältävä array, merkkijono-muotoinen data pitää parsia takaisin JSON-muotoon. Koska `ostokset.json`-tiedosto on muodoltaan array, se sopii suoraan `ostokset`-muuttujaan.
    - **Huomioi**, että [`ostokset.json`](../models/ostokset.json)-arrayn tietueet ovat rakenteeltaan samanlaisia, kuin Ostoslista-luokassa määritetty Ostos-rajapinta.