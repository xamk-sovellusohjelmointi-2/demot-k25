# Demo 7: JWT-autorisointi

Demossa 7 jatketaan ostoslista-sovelluksen toteutusta. Edellisessä demossa sovelluksen tietoturvaa parannettiin CORS:n avulla, jossa määriteltiin sovellukset, joista ostoslistan palvelimen API:in voidaan ottaa yhteys. Tässä demossa tarkastellaan lisää tietoturvaa parantavia tekniikoita JWT:n muodossa.

## Mikä JWT on?

JSON Web Token (JWT) on avoin standardi, joka määrittelee kompaktin ja itsenäisen tavan siirtää tietoa turvallisesti osapuolten välillä JSON-objektina. Tämä tieto voidaan varmentaa ja siihen voidaan luottaa, koska se on digitaalisesti allekirjoitettu.

## Mihin JWT:tä käytetään?

JWT:tä käytetään pääasiassa seuraaviin tarkoituksiin:

- Autentikointi: Yleisin käyttökohde. Kun käyttäjä kirjautuu sisään, palvelin luo JWT:n ja palauttaa sen asiakassovellukselle. Jokaisen myöhemmän pyynnön yhteydessä asiakas lähettää tokenin, jonka avulla palvelin tunnistaa käyttäjän ilman tarvetta tarkistaa käyttäjätietoja tietokannasta.
- Tiedon vaihto: JWT:t ovat tehokkaita tapoja siirtää tietoa turvallisesti osapuolten välillä. Koska ne ovat allekirjoitettuja, vastaanottaja voi varmistaa lähettäjän henkilöllisyyden ja tarkistaa, onko sisältöä muutettu.
- Tilattomien sovellusten mahdollistaminen: JWT:t auttavat tilattomien (stateless) API-rajapintojen toteuttamisessa, koska tarvittava tieto kulkee tokenin mukana, eikä sitä tarvitse hakea tietokannasta joka kerta.

## Sisällys:

### [JWT:n käyttö demo 7](./readme/DEMO-7-KOODIT.md)
Tässä demossa ei vielä oteta kantaa käyttäjän autentikointiin. Nyt otamme vain JWT:n käyttöön ja määritämme sovellusten välille digitaalisen allekirjoituksen tokenilla, jonka avulla sovellukset (client ja palvelin) voivat kommunikoida keskenään. Ilman JWT-tokenia asiakassovellus ei voi yhdistää palvelimeen.