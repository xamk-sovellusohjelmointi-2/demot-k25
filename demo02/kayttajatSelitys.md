# `Kayttaja.ts`-tietomalli

> Pohjautuu tekoälyn (Copilot, 2025) muodostamaan selitykseen koodista.

Rajapinta (englanniksi "interface") on ohjelmoinnissa määritelmä, joka kuvaa olion tai luokan ominaisuuksia ilman, että se määrittelee niiden toteutusta. Rajapinnat määrittelevät, mitä ominaisuuksia ja metodeja olion tai luokan tulee sisältää, mutta eivät kerro, miten nämä ominaisuudet ja metodit toteutetaan.

TypeScriptissä rajapintaa voidaan käyttää oman TypeScript-tyypin määrittämiseen.

### Käyttötarkoitus

Rajapintoja käytetään useista syistä:

1. **Abstraktio**: Rajapinnat mahdollistavat abstraktion, joka erottaa olion tai luokan toiminnallisuuden sen toteutuksesta. Tämä helpottaa koodin ymmärtämistä ja ylläpitoa.
2. **Yhteensopivuus**: Rajapinnat varmistavat, että eri luokat voivat toimia yhdessä, jos ne toteuttavat saman rajapinnan. Tämä mahdollistaa polymorfismin, jossa samaa koodia voidaan käyttää eri olioiden kanssa.
3. **Dokumentaatio**: Rajapinnat toimivat dokumentaationa, joka kertoo, mitä ominaisuuksia ja metodeja luokan tai olion tulee sisältää.

### Määrittely

Rajapinta määritellään TypeScriptissä seuraavasti:

```typescript
export interface Kayttaja {
    id: number;
    sukunimi: string;
    etunimi: string;
    sahkoposti: string;
    kayttajatunnus: string;
    salasana: string;
    ipOsoite: string;
    rekisteroitymisPvm: string;
}
```

- **export interface Kayttaja**: Määritellään `Kayttaja`-rajapinta, joka kuvaa käyttäjän tiedot.
- **id: number**: Käyttäjän yksilöllinen tunniste.
- **sukunimi: string**: Käyttäjän sukunimi.
- **etunimi: string**: Käyttäjän etunimi.
- **sahkoposti: string**: Käyttäjän sähköpostiosoite.
- **kayttajatunnus: string**: Käyttäjän käyttäjätunnus.
- **salasana: string**: Käyttäjän salasana (hash-muodossa).
- **ipOsoite: string**: Käyttäjän IP-osoite.
- **rekisteroitymisPvm: string**: Käyttäjän rekisteröitymispäivämäärä.

### Miksi rajapinnat kirjoitetaan näin?

Rajapinnat kirjoitetaan näin, koska ne tarjoavat selkeän ja yksinkertaisen tavan määritellä olioiden ja luokkien rakenteen. Tämä auttaa kehittäjiä ymmärtämään, mitä ominaisuuksia ja metodeja tietyn rajapinnan toteuttavan luokan tai olion tulee sisältää. Lisäksi rajapinnat mahdollistavat koodin uudelleenkäytön ja helpottavat testauksen ja ylläpidon prosesseja.

### Käyttäjätaulukon Määrittely

```typescript
const kayttajat: Kayttaja[] = [
    {
        "id": 1,
        "sukunimi": "Thorsby",
        "etunimi": "Shayne",
        "sahkoposti": "sthorsby0@disqus.com",
        "kayttajatunnus": "sthorsby0",
        "salasana": "5548746452ceef5433d972cbe7eec6f3aa3005f6c03df0b61c0c2145503155c5",
        "ipOsoite": "106.223.35.204",
        "rekisteroitymisPvm": "2020-10-08T08:17:24Z"
    },
    {
        "id": 2,
        "sukunimi": "Hedylstone",
        "etunimi": "Loise",
        "sahkoposti": "lhedylstone1@networksolutions.com",
        "kayttajatunnus": "lhedylstone1",
        "salasana": "e959cee60de8abc6523d1799f91699b8aebe046bf75cd93e6bfdc35dee61491f",
        "ipOsoite": "2.8.148.221",
        "rekisteroitymisPvm": "2021-05-23T20:54:02Z"
    },
    // Lisää käyttäjiä...
];

export default kayttajat;
```
- ``const kayttajat: Kayttaja[] = [ ... ];``: Määritellään `kayttajat`-taulukko, joka sisältää useita `Kayttaja`-olioita.
- **id**: Käyttäjän yksilöllinen tunniste.
- **sukunimi**: Käyttäjän sukunimi.
- **etunimi**: Käyttäjän etunimi.
- **sahkoposti**: Käyttäjän sähköpostiosoite.
- **kayttajatunnus**: Käyttäjän käyttäjätunnus.
- **salasana**: Käyttäjän salasana (hash-muodossa).
- **ipOsoite**: Käyttäjän IP-osoite.
- **rekisteroitymisPvm**: Käyttäjän rekisteröitymispäivämäärä.

Tämä taulukko sisältää esimerkkejä käyttäjistä, joilla on erilaisia tietoja, kuten nimi, sähköposti, käyttäjätunnus, salasana, IP-osoite ja rekisteröitymispäivämäärä. Käyttäjät on generoitu Mockaroo-palvelulla.

### Miten rajapinta ja tietokantataulukko (tässä arrayn sisältämä json-muotoinen data) yhdistetään?

`Kayttaja`-rajapinta ja `kayttajat`-taulukko liittyvät toisiinsa siten, että `Kayttaja`-rajapinta määrittelee, millaisia olioita `kayttajat`-taulukko sisältää. Rajapinta toimii mallina, joka määrittelee, mitä ominaisuuksia jokaisella `kayttajat`-taulukon oliolla tulee olla.

- **Rajapinta**: Määrittelee, mitä tietoja käyttäjäolion tulee sisältää.
- **Taulukko**: Sisältää olioita, jotka noudattavat rajapinnan määrittelemää rakennetta.

Tämä yhteys varmistaa, että kaikki `kayttajat`-taulukon oliot ovat yhdenmukaisia ja sisältävät tarvittavat tiedot. Rajapinnan käyttö tekee koodista luotettavampaa ja helpommin ylläpidettävää, koska se varmistaa, että kaikki oliot noudattavat samaa rakennetta.

### Tiivistelmä

`kayttajat.ts`-tiedosto määrittelee yksittäisen käyttäjän rajapinnan `Kayttaja`, jonka mukaan taulukon käyttäjä-tietueet muotoillaan. Demossa tietokantataulu on korvattu json-muotoista dataa sisältävällä arraylla, jossa yksi tietue on json-objekti.

```json
// Kaksi json-objektia:
{
    "id" : 1,
    "etunimi" : "Matti",
    "sukunimi" : "Mallikas"
    // jne...
},
{
    "id" : 2,
    "etunimi" : "Maija",
    "sukunimi" : "Meikäläinen"
    // jne...
} // jne...
```

Tiedoston `Kayttaja`-rajapinta sekä `kayttajat` taulukko kumpikin exportataan vientiä varten Express-sovellukseen.