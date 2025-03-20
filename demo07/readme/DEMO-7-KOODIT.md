# Demo 7

### [<-- Takaisin](../README.md)

## 1. JWT:n käyttöönotto

JWT asennetaan Express-palvelimelle komennolla:

`npm install jsonwebtoken`

Sovellus on tässä määritetty käyttämään kaikissa reiteissä JWT:tä varmenteena. `app.use()`-metodin avulla voidaan määrittää, että JWT on automaattisesti käytössä kaikkialla. JWT:tä ei siis ole pakko sisällyttää osaksi sovelluksen kaikkia reittejä, mutta demossa näin tehdään.

```ts
app.use((req : express.Request, res : express.Response, next : express.NextFunction) => {

    try {

        let token : string = req.headers.authorization!.split(" ")[1];

        jwt.verify(token, "SalausLause_25");

        next();

    } catch (e: any) {
        res.status(401).json({});
    }

});
```

Yllä olevassa koodissa:

- `let token = req.headers.authorization.split(" ")[1]`: Otetaan vastaan asiakassovelluksen lähettämän pyynnön otsikkotiedoista `Authorization`-arvo. Authorization koostuu sanoista "Bearer" ja varsinaisesta tokenista. Tarvitsemme vain tokenin, joten halkaisemme merkkijonon välilyönnin kohdalta (`split(" ")`) ja poimimme syntyvästä arraysta jälkimmäisen osan `[1]`, joka on nyt varsinainen token.
    - Asiakassovelluksen puolella `apiKutsu`-metodia on päivitetty siten, että pyynnön asetuksiin (`asetukset`-muuttuja) määritetään header-tieto `Authorization` kovakoodatulla tokenilla (demoamistarkoituksessa). Alla oleva koodinpätkä on asiakassovelluksesta:
    ```tsx
    let asetukset: fetchAsetukset = {
      method: metodi || "GET",
      headers: {
        Authorization:
          "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3NDIyMDMzNDh9.0OqTw4sohQE6UdVF8nRAAiMOwNK95mSwPOCbdgLjmgo",
      },
    };
    ```
- `jwt.verify(token, "SalausLause_25")`: Seuraavaksi ohjelma ottaa ylempänä vastaanotetun tokenin ja käyttää JWT:tä vertaamaan sitä tässä selkokieliseksi kirjoitettuun salaiseen avaimeen "SalausLause_25". Mikäli tokenin ja salaisen avaimen tiedot täsmäävät, tiedetään, että token tulee sallitulta käyttäjältä/sovellukselta ja pyyntöön voidaan vastata. Muutoin pyyntöön vastataan statuskoodilla 401, joka kuvaa virhettä tokenin kanssa.

## 2. Tokenin muodostaminen

Osana palvelimen lähdekoodeja on `luoJWT.js`-tiedosto:

```js
let token = require("jsonwebtoken").sign({}, "SalausLause_25");

console.log(token);
```

Tällä demossa käytetty token on luotu erikseen omalla ohjelmalla. Tämä ei siis kuvasta normaalitilannetta, jossa palvelin automaattisesti generoi käyttäjälle tokenin kirjautumisen/sovellukseen yhdistämisen yhteydessä, mutta tässä tokenin ja avaimen luonti halutaan havainnollistaa. Olemme siis valinneet salaisen avaimen "SalausLause_25", josta generoidaan token `require("jsonwebtoken").sign({}, "SalausLause_25")`. Token tulostetaan komentokehotteeseen, josta se on poimittu asiakassovellukseen kovakoodatuksi otsikkotiedoksi (selitetty ylempänä).

Voit testata tokenin generointia suorittamalla komentokehotteessa komennon:

`node luoJWT.js`

Ohjelma tulostaa uuden tokenin ja voit korvata asiakassovelluksen vanhan tokenin uudella. Vaikka token ei ole aina sama samalla salaisella avaimella, sen allekirjoitus silti menee oikein tunnistuksen yhteydessä.

## 3. Muutokset asiakassovelluksen päässä

Tässä demossa ei loppujen lopuksi ole tapahtunut hirveästi mitään uutta verrattuna edelliseen demoon. Ainoana lisäominaisuutena on tullut JWT:n käyttö, joka koostui yllä olevista asioista. Asiakassovellus ei lopulta tee muuta kuin lähettää pyyntöjen yhteydessä nyt uuden otsikkotiedon `Authorization`, mutta tämähän ei ohjelman monimutkaisuutta juurikaan lisää. Nyt on vain muistettava, että jos jossain palvelimen reitissä on määritetty JWT-salaus, pitää siihen tehdyissä pyynnöissä lähettää oikea token.

Katsotaan vielä nopeasti suurimmat muutokset asiakassovelluksen `App.tsx`-koodeihin.

```tsx
const apiKutsu = async (metodi?: string, ostos?: Ostos, id?: number): Promise<void> => {
    setApiData({
      ...apiData,
      haettu: false,
    });

    let url = id ? `http://localhost:3007/api/ostokset/${id}` : `http://localhost:3007/api/ostokset`;
    console.log(url);

    let asetukset: fetchAsetukset = {
      method: metodi || "GET",
      headers: {
        Authorization:
          "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3NDIyMDMzNDh9.0OqTw4sohQE6UdVF8nRAAiMOwNK95mSwPOCbdgLjmgo",
      },
    };
```

Yllä on esitelty nimensä mukaisesti palvelimelle lähetettävän API-kutsun muodostava `apiKutsu`-metodi, jota jo edellisessä demossa katsottiin. Uutena asiana JWT-autorisointiin liittyen fetch-asetusten määrittelyssä on lisätty uusi tieto pyynnön otsikkoon: `Authorization`. Tämä sisältää tokenin, jota käytetään varmistamaan palvelimelle yhdistävän sovelluksen valtuudet. Jos Bearer token täsmää palvelimen puolella määritettyä salaista avainta (SalausLause_25), pyyntö on oikea ja se voidaan päästää läpi. Siinä se.

Toisena muutoksena oli päivitetty pyynnön vastauksissa virheisiin uusi virhe 401, eli virheellinen token:

```tsx
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
```

Yllä siis tehtiin tarkistus pyynnön vastaukselle. Jos pyyntö meni läpi ongelmitta ja vastaus tuli onnistuneena, koodi oli 200. Jos taas vastauksen status oli joku virheilmoitus, se näytetään alempana osana switch...case -rakennetta. Virheisiin on lisätty nyt tokeniin viittaava virhekoodi 401, joka määritettiin palvelimen puolella osaksi JWT-autorisointia:

```ts
app.use((req : express.Request, res : express.Response, next : express.NextFunction) => {

    try {

        let token : string = req.headers.authorization!.split(" ")[1];

        jwt.verify(token, "SalausLause_25");

        next();

    } catch (e: any) {
        res.status(401).json({}); // Virhe 401 vastauksena väärään tokeniin
    }

});
```

## 4. Lopuksi

Tässä esiteltiin JWT:n käyttöönotto kovakoodattuna. Seuraavassa demossa katsotaan, miten JWT-tokenia voidaan käyttää käyttäjän varmentamiseen osana sovelluksen toimintaa. Voit vielä kokeilla JWT:n toimintaa muuttamalla tokenista pari merkkiä ja testaamalla sovellusta. Sovelluksen pitäisi toimia niin, että asiakassovellus saa virheilmoituksen virheellisestä tokenista.
