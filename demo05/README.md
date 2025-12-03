# Demo 5: Prisma ORM

Demossa 4 Ostoslista-sovelluksen tietokanta oli toteutettu omana json-tiedostonaan, jota hallittiin FileSystem-apuohjelman komennoilla. Kyseinen demo havainnollisti yhden tavan käsitellä ja tallentaa tietoa, mutta tällaista menetelmää ei kukaan oikeasti käytä. Ehkä, jos teet omalle koneelle sovelluksen, jossa tallennat tekstidataa tiedostoon, FileSystemin käyttö voi olla tarpeen, mutta ei palvelinsovelluksissa.

Demossa 5 jatketaan ostoslistasovelluksen toteuttamista, mutta tietojen tallentamisessa käytetään json-tiedoston sijasta Prisma ORM:llä toteutettua SQLite-tietokantaa. Voit lukea lisää Prisman käyttöönotosta ja lyhyen tiivistelmän tietokantojen perusteista alla olevista linkeistä. Lopuksi vielä kerrotaan, miten edellisen demon toteutus on vaihdettu Prisma-tietokannan käyttöön.

## Sisällys:

### [Uusi vaiheittainen ohjeistus](./walkthrough/README.md)

### [Prisma ORM asennus ja käyttö](./readme/PRISMA-ORM-KAYTTO.md)
### [Tietopaketti tietokannoista](./readme/TIETOKANNAT.MD)

### [Prisma-tietokannan käyttö apiOstokset-routessa](./readme/PRISMA-OSTOKSET.md)
