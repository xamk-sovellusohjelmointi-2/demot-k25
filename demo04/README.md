# Demo 4: REST API:n Virheiden käsittely

Tämä on demo REST API -palvelinsovelluksen virheenkäsittelystä. REST API (tai yleensäkin Web Service) -toteutuksissa virhetilanteiden ja muiden poikkeuksien käsittely on merkittävässä roolissa, sillä näiden sovellusten "käyttäjinä" ovat toiset sovellukset. Palvelin- ja asiakassovelluksen välisen viestinnän tuleekin olla mahdollisimman täsmällistä, jotta virhetilanteista voidaan tehdä esim. virheilmoituksia käyttöliittymässä.

Testaa demon toiminnallisuutta Postman-sovelluksella. Luo Postman-sovelluksella erilaisia GET-, POST-, PUT- ja DELETE-pyyntöjä url-osoitteeseen <i>http://localhost:3004/api/ostokset</i>. Kokeile tahallisesti käyttää virheellisiä tietoja syötteinä, virhellisiä reittejä jne.

## 1. Sovelluksen yleisen toiminnan tarkempi kuvaus

Demosovelluksessa on toteutettu Ostoslista-palvelu, jolla käyttäjä voi hakea (GET), lisätä (POST), muokata (PUT) ja poistaa (DELETE) ostoksia taustajärjestelmästä.

Ostosten "tietokanta" on toteutettu demoamismielessä [json-tiedostona](./models/ostokset.json), joka sisältää listan [Ostos-tietomallin](./models/ostoslista.ts) mukaisia alkioita. Tietojen käsittelyn näkökulmasta toiminnallisesti periaate on sama, kuin oikeassa tietokannassa. Sovelluksen Ostokset API:n reitteihin on luotu käsittelijät ostokset-tiedoille. Web Service -rajapinnan periaatteiden mukaisesti asiakassovelluksella tehtäisiin pyyntöjä näihin Ostokset API -reitteihin, joilla ostoksia hallittaisiin. Asiakassovelluksen sijaan pyyntöjen testaaminen tehdään Postman-sovelluksella.

Edellisen demon päälle on uutena asiana rakennettu virhekäsittelijä.

## 2. Sisällys

Demon sovellus sisältää viisi ohjelmatiedostoa, jotka ovat demon kannalta tärkeitä. Uusimpana ja oleellisimpana on "5. REST API -virhekäsittelijä".

### [1. Express-palvelin (index.ts) ->](./readme/Express-palvelin.md)

### [2. Ostosten API (apiOstokset.ts) ->](./readme/Ostokset-API.md)

### [3. Ostoslista-tietomalli (ostoslista.ts) ->](./readme/Ostoslista-tietomalli.md)

### [4. Ostokset-"tietokanta" (ostokset.json) ->](./readme/Ostokset-tietokanta.md)

### [5. REST API -virhekäsittelijä (virhekasittelija.ts) ->](./readme/REST-API-virhekäsittelijä.md)

