# Sovellusohjelmointi 2 -demot
Täältä löydät Sovellusohjelmointi 2 -opintojakson materiaaleissa tehtyjen demojen lähdekoodit. Voit kloonata/forkata repositorya vapaasti tai ihan vain tarkastella koodeja suoraan selaimessa.

## Demo 1 - Express-sovelluskehys

Tässä demossa tutustutaan Express-sovelluskehykseen ja palvelinohjelmoinnin perusteisiin. Demossa rakennetaan palvelinsovellus, jolla on reittejä erilaisiin tervehdyksiin. Samalla näytetään staattisten tiedostojen kansion ja query string käyttö.

## Demo 2

Tässä demossa perehdytään Web Service -käsitteeseen. Web Service on ohjelmointirajapinta, joka mahdollistaa palvelimen ja asiakkaan välisen kommunikoinnin. Web Service -tekniikalla voidaan välittää tietoa vastauksena asiakkaan tekemiin pyyntöihin palvelimella määritettyihin reitteihin. Tieto ei ole graafisia HTML-sivuja, vaan JSON-dataa, joka on demossa toteutettu TypeScriptin interfacen avulla. Sovelluksessa on esitetty tietomalli ja siihen perustuva lista käyttäjätiedoista. Näitä tietoja lähetetään vastauksena asiakkaan esittämiin pyyntöihin.

## Demo 3

Tässä demossa käsitellään REST API -arkkitehtuuria palvelinsovellusten toteutuksessa ja perehdytään enemmän tietomallien käyttöön. Demossa on toteutettu ostoslista, jota voidaan käsitellä REST API -kutsujen kautta. Demossa on luotu erillinen rajapinta ostoslistan tietojen hakemiselle, lisäämiselle, muokkaamiselle ja poistamiselle ja tämä ostokset API on ikään kuin oma kategoriallisesti rajattu kokonaisuus osana laajempaa palvelinsovellusta. Ideana on siis, että palvelimella voi olla useita rajapintoja (APIt) eri tarkoituksiin ja nämä erotellaan muusta palvelimen toiminnallisuudesta selkeämmän arkkitehtuurin ja koodin mahdollistamiseksi. Tämä taas tukee ja korostaa REST API -arkkitehtuurin periaatteita, jotka määrittävät, miten Web Servicet tulisi toteuttaa.

## Demo 4

Tässä demossa jatketaan Demo 3:n ostoslista-sovellusta ja otetaan mukaan virheiden käsittely. Virheenkäsittelyn avulla Web Servicet pystyvät paremmin ilmoittamaan käyttäjälle/kehittäjälle, minkälainen vika Web Servicen toiminnassa ilmeni. Vikatiloja voi olla monenlaisia monista eri syistä, ja näiden erittely on oleellista, jotta pysytään tietoisena siitä, mihin vika liittyy.

## Demo 5

Demo 5 jatkaa aiempia demoja. Tässä demossa `models`-kansiossa ollut tietomalli viedään nyt täysin omaksi tietokantataulukseen Prisma ORM -tietokantaan. Näin ollaan taas askel lähempänä realistisempaa Web Serviceä, jossa tietoa ei tallenneta palvelimelle json-tiedostoon, vaan sille on jokin oma järjestelmä, kuten esimerkiksi SQL-tietokanta.

## Demo 6

Demossa 6 ostoslista-sovellukselle luodaan oma asiakaspään sovellus Reactilla ja yhdistetään Web Service ja client-sovellus.
