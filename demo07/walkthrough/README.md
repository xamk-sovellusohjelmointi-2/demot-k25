# Demo 7 - Läpikulku: JWT-autorisointi

Demossa 7 perehdytään asiakas- ja palvelinsovellusten turvallisuuskysymyksiin. Edellisessä demossa otettiin käyttöön CORS-säännöt, joilla saatiin rajoitettua selainsovelluksien pääsyä palvelimelle. CORS ei kuitenkaan estä yhdistämistä esimerkiksi Postman-sovelluksesta tai komentorivityökaluilla kuten curl. 

Tässä demossa toteutetaan JWT-pohjainen (Json Web Token) autorisointi, jolla voidaan valtuuttaa vain tietyt asiakassovellukset käyttämään palvelimen resursseja. Käytännössä tämä tarkoittaa, että palvelimelle pääsee tekemään pyyntöjä vain silloin, kun pyynnön mukana tulee salaisen avaimen avulla luotu ja allekirjoitettu token. Ilman oikeaa tokenia palvelin hylkää pyynnön.

## 1 Lähtötilanne

Demo jatkaa aiemman demon 6 sovelluksesta, jossa toteutettiin React-asiakassovellus ostoslistan käyttöliittymäksi. Sovellus koostuu kahdesta osasta:

1. **Express-palvelinsovellus** (portti 3007), joka tarjoaa REST API:n ostosten käsittelyyn Prisma-tietokannan avulla
2. **React-asiakassovellus** (Vite-kehityspalvelin portissa 3000), joka näyttää ostoslistan ja lähettää API-kutsuja palvelimelle

Aiemmassa demossa otettiin käyttöön CORS-middleware, joka sallii yhteydenotot vain osoitteesta `http://localhost:3000`. Tämä on kuitenkin rajoitettu suojakeino, sillä se toimii vain selainsovelluksissa. Postmanilla tai muilla työkaluilla palvelimeen voi yhä yhdistää vapaasti.

## 2 Autorisoinnin tarve

### 2.1 CORS:n rajoitteet

CORS (Cross-Origin Resource Sharing) on selaimen turvallisuusominaisuus, joka rajoittaa verkkosivujen tekemiä pyyntöjä eri alkuperään (origin). Kun React-sovellus portissa 3000 yrittää tehdä pyynnön palvelimelle portissa 3007, selain tarkistaa CORS-säännöt.

Ongelmana on, että CORS-tarkistuksen tekee selain, ei palvelin. Tämä tarkoittaa:

- Postman-sovellus ei välitä CORS-säännöistä ja pystyy tekemään pyyntöjä vapaasti
- Komentorivityökalut kuten curl ohittavat CORS:n kokonaan
- Kuka tahansa voi lukea palvelimen tarjoamat tiedot ilman rajoituksia

### 2.2 Autorisointi ratkaisuna

Autorisointi tarkoittaa valtuuttamista - tarkistetaan, että pyynnön tekijällä on oikeus käyttää palvelimen resursseja. Tässä demossa toteutetaan yksinkertainen token-pohjainen autorisointi JWT:n (Json Web Token) avulla.

JWT on avoimen standardi tapa toteuttaa autorisointi verkkosovellusten välillä. Se toimii seuraavasti:

1. Palvelimella on salainen avain (secret key)
2. Tällä avaimella luodaan ja allekirjoitetaan token
3. Asiakas lähettää tokenin mukana jokaisessa pyynnössä
4. Palvelin tarkistaa tokenin ja joko hyväksyy tai hylkää pyynnön

## 3 JWT:n perusteet

### 3.1 Mikä on JWT?

Json Web Token on merkkijono, joka koostuu kolmesta osasta:

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3NDIyMDMzNDh9.0OqTw4sohQE6UdVF8nRAAiMOwNK95mSwPOCbdgLjmgo
```

Osat erotetaan toisistaan pisteellä (`.`) ja ne ovat:

1. **Header** - sisältää tiedon käytetystä salausalgoritmista
2. **Payload** - sisältää varsinaisen datan (esim. käyttäjätiedot, voimassaoloaika)
3. **Signature** - digitaalinen allekirjoitus, joka varmistaa tokenin aitouden

JWT:n keskeinen idea on, että vain salaisen avaimen haltija voi luoda oikeita tokeneita, mutta kuka tahansa voi lukea tokenin sisällön. Allekirjoitus varmistaa, että tokenia ei ole muokattu.

### 3.2 JWT:n asentaminen

JWT:n käyttö Node.js-sovelluksessa vaatii `jsonwebtoken`-kirjaston. Asennetaan se palvelinsovellukseen:

```bash
npm install jsonwebtoken
npm install --save-dev @types/jsonwebtoken
```

## 4 Tokenin luominen

Ennen kuin JWT:tä voidaan käyttää autorisoinnissa, tarvitaan työkalu tokenin luomiseen. Luodaan tätä varten yksinkertainen apuohjelma.

### 4.1 luoJWT.js -tiedosto

Luodaan palvelinsovelluksen juureen tiedosto `luoJWT.js`. Huomaa, että tiedosto on JavaScript-muodossa (ei TypeScript), jotta sen voi suorittaa suoraan Node:lla ilman käännöstä.

#### luoJWT.js
```javascript
let token = require("jsonwebtoken").sign({}, "SalausLause_25");

console.log(token);
```

Tiedoston toiminta:

1. Tuodaan `jsonwebtoken`-kirjaston `sign`-metodi require-komennolla
2. Kutsutaan `sign`-metodia kahdella argumentilla:
   - Tyhjä objekti `{}` (payload-osuus, joka voi sisältää mitä tahansa dataa)
   - Merkkijono `"SalausLause_25"` (salainen avain, jolla token allekirjoitetaan)
3. Tulostetaan luotu token konsoliin

### 4.2 Tokenin generoiminen

Suoritetaan ohjelma Node:lla terminaalissa:

```bash
node luoJWT.js
```

Ohjelma tulostaa pitkän merkkijonon, joka on JWT-token. Esimerkiksi:

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3NDIyMDMzNDh9.0OqTw4sohQE6UdVF8nRAAiMOwNK95mSwPOCbdgLjmgo
```

Tämä token kopioidaan talteen - sitä tarvitaan asiakassovelluksessa myöhemmin.

**Tärkeä huomio salauksesta:** Salainen avain `"SalausLause_25"` on esimerkki. Oikeassa tuotantosovelluksessa käytettäisiin:
- Paljon monimutkaisempaa ja pidempää avainta
- Ympäristömuuttujaa (environment variable), ei koodiin kovakoodattua arvoa
- Eri avaimia kehitys- ja tuotantoympäristöissä

## 5 Autorisoinnin toteutus palvelimella

Nyt kun JWT-token on luotu, palvelimelle toteutetaan middleware-funktio, joka tarkistaa jokaisen pyynnön yhteydessä, että mukana tulee oikea token.

### 5.1 JWT-middleware index.ts-tiedostossa

Palvelimen juuritiedostoon `index.ts` tehdään seuraavat muutokset:

```typescript
import express from 'express';
import path from 'path';
import apiOstoksetRouter from './routes/apiOstokset';
import virhekasittelija from './errors/virhekasittelija';
import jwt from 'jsonwebtoken'; // Tuodaan jsonwebtoken-kirjasto
import cors from 'cors';

const app : express.Application = express();

const portti : number = Number(process.env.PORT) || 3007;

app.use(cors({origin : "http://localhost:3000"}));

// JWT-autorisoinnin middleware
app.use((req : express.Request, res : express.Response, next : express.NextFunction) => {

    try {
        // Poimitaan Authorization-headerista token
        let token : string = req.headers.authorization!.split(" ")[1];

        // Varmennetaan token salaisen avaimen avulla
        jwt.verify(token, "SalausLause_25");

        // Jos token on oikea, päästetään pyyntö eteenpäin
        next();

    } catch (e: any) {
        // Jos token puuttuu tai on väärä, palautetaan 401 Unauthorized
        res.status(401).json({ viesti : "Virheellinen token"});
    }

});

app.use(express.static(path.resolve(__dirname, "public")));

app.use("/api/ostokset", apiOstoksetRouter);

app.use(virhekasittelija);

app.use((req : express.Request, res : express.Response, next : express.NextFunction) => {

    if (!res.headersSent) {
        res.status(404).json({ viesti : "Virheellinen reitti"});
    }

    next();
});

app.listen(portti, () => {

    console.log(`Palvelin käynnistyi porttiin : ${portti}`);    

});
```

### 5.2 Middleware-funktion toiminta

Käydään läpi, mitä JWT-middleware tekee:

1. **Token poimiminen:**
   ```typescript
   let token : string = req.headers.authorization!.split(" ")[1];
   ```
   - Pyynnön `Authorization`-headerista luetaan arvo
   - Header on muotoa: `"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."`
   - `split(" ")` jakaa merkkijonon välilyönnistä taulukkoon `["Bearer", "token..."]`
   - Indeksillä `[1]` poimitaan varsinainen token ilman "Bearer"-etuliitettä
   - Huutomerkki `!` kertoo TypeScriptille, että header ei ole undefined

2. **Tokenin varmentaminen:**
   ```typescript
   jwt.verify(token, "SalausLause_25");
   ```
   - `verify`-metodi tarkistaa, että token on luotu samalla salaisella avaimella
   - Jos token on väärä tai virheellinen, metodi palauttaa virheen
   - Jos token on oikea, suoritus jatkuu normaalisti

3. **Virheenkäsittely:**
   ```typescript
   catch (e: any) {
       res.status(401).json({});
   }
   ```
   - Jos tokenin poimiminen tai varmentaminen epäonnistuu, mennään catch-lohkoon
   - Palautetaan HTTP 401 (Unauthorized) -statuskoodi tyhjällä JSON-objektilla
   - Pyyntö loppuu tähän, eikä pääse eteenpäin reittikäsittelijöille

**Middleware:n sijainti on kriittinen:** JWT-tarkistus on sijoitettu CORS-asetuksen jälkeen, mutta ennen reittikäsittelijöitä (`apiOstoksetRouter`). Näin jokainen palvelimelle tuleva pyyntö käy automaattisesti läpi autorisoinnin tarkistuksen.

## 6 Asiakassovelluksen päivittäminen

Kun palvelin vaatii JWT-tokenin, myös asiakassovellusta täytyy päivittää lähettämään token jokaisessa API-kutsussa.

### 6.1 Authorization-headerin lisääminen

React-sovelluksen `App.tsx`-tiedostossa `apiKutsu`-funktiota muokataan seuraavasti:

```typescript
const apiKutsu = async (metodi?: string, ostos?: Ostos, id?: number): Promise<void> => {
    setApiData({
      ...apiData,
      haettu: false,
    });

    let url = id ? `http://localhost:3007/api/ostokset/${id}` : `http://localhost:3007/api/ostokset`;

    let asetukset: fetchAsetukset = {
      method: metodi || "GET",
      headers: {
        Authorization:
          "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3NDIyMDMzNDh9.0OqTw4sohQE6UdVF8nRAAiMOwNK95mSwPOCbdgLjmgo",
      },
    };

    if (metodi === "POST") {
      asetukset = {
        ...asetukset,
        headers: {
          ...asetukset.headers,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(ostos),
      };
    }

    try {
      const yhteys = await fetch(url, asetukset);

      if (yhteys.status === 200) {
        setApiData({
          ...apiData,
          ostokset: await yhteys.json(),
          haettu: true,
        });
      } else {
        let virheteksti: string = "";

        switch (yhteys.status) {
          case 400:
            virheteksti = "Virhe pyynnön tiedoissa";
            break;
          case 401:
            virheteksti = "Virheellinen token";
            break;
          default:
            virheteksti = "Palvelimella tapahtui odottamaton virhe";
            break;
        }

        setApiData({
          ...apiData,
          virhe: virheteksti,
          haettu: true,
        });
      }
    } catch (e: any) {
      setApiData({
        ...apiData,
        virhe: "Palvelimeen ei saada yhteyttä",
        haettu: true,
      });
    }
};
```

### 6.2 Muutos ylempään koodiin

**Authorization-header:**
```typescript
headers: {
  Authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```
- Jokaiseen pyyntöön lisätään `Authorization`-header
- Arvona on "Bearer " + aiemmin luotu JWT-token
- "Bearer" on HTTP-standardin mukainen etuliite token-autentikoinnille

**POST-pyynnön erityishuomio:**
```typescript
if (metodi === "POST") {
  asetukset = {
    ...asetukset,
    headers: {
      ...asetukset.headers,  // Spreadaus säilyttää Authorization-headerin
      "Content-Type": "application/json",
    },
    body: JSON.stringify(ostos),
  };
}
```
- POST-pyynnössä täytyy säilyttää Authorization-header
- Käytetään spread-operaattoria (`...asetukset.headers`) kopioimaan olemassa olevat headerit
- Lisätään sen päälle Content-Type uutta dataa varten

**Virheenkäsittelyn laajennus:**
```typescript
case 401:
  virheteksti = "Virheellinen token";
  break;
```
- Lisätään käsittely HTTP 401 -statuskoodille
- Jos palvelin hylkää pyynnön väärän tokenin takia, käyttäjälle näytetään selkeä virheilmoitus

## 7 Sovelluksen testaaminen

### 7.1 Testaus oikealla tokenilla

Käynnistetään molemmat palvelimet:
1. Express-palvelin (terminaali 1): `npm start`
2. Vite-kehityspalvelin (terminaali 2, client-kansiossa): `npm run dev`

Kun React-sovellus avataan selaimessa (`http://localhost:3000`), ostoslista latautuu normaalisti. Pyynnöt menevät läpi, koska Authorization-headerissa on oikea token.

### 7.2 Testaus Postmanilla

Kokeillaan nyt tehdä pyyntö Postmanilla ilman tokenia:

**GET http://localhost:3007/api/ostokset**
- Vastaus: `401 Unauthorized` ja tyhjä JSON-objekti `{}`
- Palvelin hylkää pyynnön, koska Authorization-headeria ei ole

![](postman-test-without-token.png)

Lisätään Postmaniin Authorization-header:
1. Valitaan "Headers"-välilehti
2. Lisätään uusi header:
   - Key: `Authorization`
   - Value: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (koko token)

Nyt pyyntö menee läpi ja ostokset palautuvat normaalisti.

![](postman-test-with-token.png)

### 7.3 Testaus väärällä tokenilla

Muokataan asiakassovelluksessa tokenia:
```typescript
Authorization: "Bearer väärätoken123"
```

Kun sovellus päivitetään, konsoliin ilmestyy virhe ja käyttöliittymään renderöityy: "Virheellinen token".

## 8 Turvallisuuden arviointi

### 8.1 Tämän toteutuksen ongelmat

**Kriittinen tietoturvariski:** Tässä demossa JWT-token on kovakoodattu suoraan asiakassovelluksen lähdekoodiin. Tämä on vakava turvallisuusongelma:

1. **Token on julkinen:** Kuka tahansa voi avata selaimen kehitystyökalut, tarkastella verkkopyyntöjä ja nähdä tokenin
2. **Ei vanhentumisaikaa:** Token on voimassa ikuisesti
3. **Ei käyttäjäkohtaisuutta:** Kaikki käyttävät samaa tokenia

Oikeassa sovelluksessa tokenia **ei koskaan** tallennettaisi asiakassovelluksen koodiin.

### 8.2 Parempi lähestymistapa (tulevassa demossa)

Turvallisempi toteutus sisältäisi:

1. **Kirjautuminen:** Käyttäjä syöttää käyttäjätunnuksen ja salasanan
2. **Token luodaan palvelimella:** Onnistuneen kirjautumisen jälkeen palvelin luo tokenin ja lähettää sen asiakkaalle
<!-- 3. **Vanhentumisaika:** Token on voimassa esim. 1-24 tuntia
4. **Payload sisältää dataa:** Tokenissa on tieto käyttäjästä (esim. käyttäjä-ID)
5. **Token tallennetaan turvallisesti:** Esim. selaimen sessionStorageen, ei koodiin -->

Seuraavassa demossa toteutetaan juuri tällainen turvallisempi lähestymistapa.

### 8.3 Mitä tässä demossa opittiin?

Vaikka toteutus ei ole tuotantovalmis, se opettaa JWT:n peruskonseptit:

- Miten JWT-token luodaan ja varmennetaan
- Miten middleware-funktio tarkistaa jokaisen pyynnön
- Miten asiakassovellus lähettää tokenin Authorization-headerissa
- Miksi pelkkä CORS ei riitä autentikointiin

## 9 Lopuksi

Tämä demo havainnollisti JWT-pohjaisen autorisoinnin perusteet. Toteutettiin yksinkertainen järjestelmä, jossa:

1. Palvelin vaatii jokaiselta pyynnöltä JWT-tokenin
2. Token luodaan salaisen avaimen avulla
3. Palvelin varmentaa tokenin ennen pyynnön käsittelyä
4. Asiakassovellus lähettää tokenin Authorization-headerissa

Tärkeintä on ymmärtää JWT:n toimintaperiaate ja se, miksi token-pohjainen autorisointi on CORS-asetuksia vankempi turvallisuuskeino. CORS rajoittaa vain selaimia, mutta JWT-autorisointi toimii kaikkien asiakkaiden kanssa - myös Postmanin ja komentorivityökalujen.

Demossa käytetty toteutus sisältää tietoturvariskin (token asiakassovelluksen koodissa), mutta se tämä oli tarkoituksellinen valinta havainnollistamaan JWT:n perustekniikoita. Seuraavassa demossa siirrytään turvallisempaan toteutukseen, jossa token luodaan ohjelmallisesti kirjautumisen yhteydessä.

- **Autentikointi (kuka olet)**
- **Autorisointi (mihin sinulla on oikeus)**

Nämä ovat eri asioita, ja molemmat ovat tärkeitä turvallisen verkkopalvelun rakentamisessa.