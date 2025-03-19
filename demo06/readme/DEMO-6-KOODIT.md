# Asiakassovelluksen yhdistäminen palvelinsovellukseen

Verrattuna edelliseen demoon, palvelimen puolella ei oikeastaan ole tapahtunut suuria muutoksia. Isoin muutos liittyy juurikin palvelimen CORS-asetusten määrittelyyn, jolla asiakassovellus portista 3000 voi ottaa yhteyden palvelimelle.

```ts
import cors from 'cors';

const app : express.Application = express();
const portti : number = Number(process.env.PORT) || 3006;

app.use(cors({origin : "http://localhost:3000"})); // CORS-asetuksen määrittely

// Sovellukseen koodattu odotus
app.use((req : express.Request, res : express.Response, next : express.NextFunction) => {
    setTimeout(() => next(), 1000);
});

// Muut reitit ja määrittelyt

app.listen(portti, () => {
    console.log(`Palvelin käynnistyi osoitteeseen: http://localhost:${portti}`);    
});
```

Yllä olevassa koodissa on määritelty CORS-sääntöjen käyttö sekä keinotekoinen timeout havainnollistamaan sitä, että asiakas todellakin saa kaiken sisällön palvelimelta. Voit kokeilla, mitä tapahtuu poistamalla jomman kumman middlewareista (`app.use()`).

# Asiakassovelluksen koodit

Loput sovelluksen uudesta toiminnasta perustuu asiakassovelluksen määrittelyyn. Sovelluksen toteutuksen voisi jakaa kolmeen pääosaan:

1) Käyttöliittymän määritys
2) Sovelluksen tilan ja ostoslistan tietojen hallinta
3) API-kutsujen määrittäminen ja toteutus palvelimelle

## 1. Käyttöliittymä

Sovellukseen on toteutettu yksinkertainen näkymä, jossa on seuraavat elementit:

- Pääotsikko (Demo 6...)
- Alaotsikko (Ostoslista)
- Lista ostoksista
  - Toteutettu MUI:n Stack-komponentilla, jonka alla lista, tekstikenttä ja painike ovat
  - Yksi ostos sisältää:
    - ListItem ostoksen asettelulle ja luokittelulle listassa
    - IconButton poisto-painikkeelle
    - Listaelementin teksti näyttämään ostoksen tuotenimi
- Ostoksen kirjoittamisen tekstikenttä
- Uuden ostoksen lisäämisen painike

MUI:n elementtejä ei käydä tässä tarkemmin läpi, sillä näitä on jo opiskeltu Sovellusohjelmointi 1 -opintojaksolla. Katsotaan tässä läpi vain, miten komponentteja käytetään ostoslistan tulostamiseen ja hallintaan.

### 1.1 Ostoslista-näkymän hallinta

Ostoslistan tulostaminen on rakennettu ehdolliseksi, sillä sovelluksen toiminnassa voi tulla virheitä. Tähän liittyy myös demossa 4 määritellyn virhekäsittelijän hyödyntäminen. Demossa on toteutettu React-sovelluksen tilaa seuraava `apiData`-tilamuuttuja, joka sisältää tietoja haetuista ostoksista ja merkkijonon mahdollisille virheille. Tätä `virhe`-tietoa hyödynnetään ostoslistan näkymän tulostuksessa:

```tsx
{(Boolean(apiData.virhe))
        ? <Alert severity="error">{apiData.virhe}</Alert>
        : (apiData.haettu) 
          ? <Stack
              component="form"
              onSubmit={lisaaTuote}
              ref={lomakeRef}
              spacing={2}>
              <List>
```

Heti otsikkojen alla tehdään tarkistus, palauttaako `apiData.virhe` arvon `true`. Tarkistus perustuu siihen, että virhe on tietotyypiltään merkkijono ja kun tälle tehdään muunto booleaniksi, palautuu true, mikäli merkkijono sisältää tekstiä. Pelkkä tyhjä merkkijono ("") palauttaa false. Toisin sanoen, jos `apiData.virhe` sisältää virheilmoituksen, tulostetaan ternary-operaattorin ensimmäinen (`?`) osa, joka tulostaa MUI Alertin, jossa kerrotaan, mikä virhe on.

Mikäli taas virhettä ei ole kirjattu `apiData`-tilamuuttujaan, voidaan seuraavaksi siirtyä `:`-osaan, jossa tarkistetaan, onko `apiData.haettu` arvo `true`. Tätä tietoa käytetään vain apuna siinä, jos tietokantahaussa menee huomattava aika. Tätä itseasiassa simuloidaan juurikin palvelimen puolella pakotetussa timeout-määrityksessä. Latauksen aikaisesta animaatiosta kohta lisää. Eli jos `apiData.haettu`-tieto on `true`, voidaan aloittaa ostoslistan tulostaminen alkaen Stack-komponentista.

Jos haku ei toisaalta vielä ole valmis, näytetään latausanimaatio:

```tsx
{(Boolean(apiData.virhe))
        ? <Alert severity="error">{apiData.virhe}</Alert>
        : (apiData.haettu)
            {/* Jos data oli jo haettu... */}
          ? <Stack
              component="form"
              onSubmit={lisaaTuote}
              ref={lomakeRef}
              spacing={2}>

              {/* Ostoslista rakentuu tänne väliin */}
            </Stack>

            {/* Jos dataa ei ole vielä haettu. Latausanimaatio toteutettu Backdropin ja CircularProgressin avulla*/}
          : <Backdrop open={true}>
              <CircularProgress color='inherit'/>
            </Backdrop>
      }
```

Latausanimaatio on toteutettu Backdropilla, joka luo sovelluksen näkymän päälle läpikuultavan tumman taustan ja CircularProgress on näytöllä pyörivä latausanimaatio, joilla näytetään käyttäjälle, että tietokantaa ladataan vielä.

### 1.2 Ostosten tulostaminen listaan

Ostosten tulostaminen listaan tapahtuu aiemmista demoista tuttuun tapaan mappaamalla ostosten array, joka tässä löytyy osana `apiData`-tilamuuttujan tietoja.

ListItem toimii MUI:ssa yksittäisen listaelementin kehyksenä. Tässä listaelementti koostuu IconButtonista (roskakori) ja ListItemTextistä (ostoksen tuotenimi).

```tsx
<List>
                {apiData.ostokset.map((ostos : Ostos, idx : number) => {
                  return <ListItem 
                            key={idx}
                            secondaryAction={
                              <IconButton 
                                edge="end"
                                onClick={() => { poistaTuote(ostos) }}
                              >
                                <DeleteIcon />
                              </IconButton>
                            }  
                          >
                          <ListItemText 
                            primary={ostos.tuote}
                          />
                        </ListItem>                    
                })}
               
              </List>
```

### 1.3 Ostoksen lisääminen

Ostosten lisäämiselle on lopuksi varattu tekstikenttä ja painike. Joihinkin aiempiin toteutuksiin verrattuna nyt tekstiä ei tallenneta `onChange`-tapahtumalla tilamuuttujaan, vaan koska koko ostoslistan Stack-elementti on määritetty lomakkeeksi, tekstikentän sisältö vain lähetetään submit-buttonilla suoraan. Käydään lomakkeen lähetyksen toimintaa lisää kohta.

```tsx
<TextField 
                name="uusiTuote"
                fullWidth={true}
                placeholder="Kirjoita tähän uusi tuote..."
              /> 

              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth={true}
              >Lisää tuote ostoslistaan</Button>
```

## 2. Sovelluksen tilan ja ostoslistan tietojen hallinta

Sovelluksen logiikka on toteutettu siten, että `apiData`-tilamuuttuja hallitsee sovelluksen toiminnan kannalta oleellisia tietoja:
- `ostokset : []`: Lista tietokannasta haetuista ostoksista
- `virhe : ""`: Mahdolliset virheet tekstinä, joita voi ilmaantua sovelluksen toiminnassa
- `haettu : false`: Ohjausehto ostoslistan/latausnäkymän hallinnalle

Uusien tietojen lisääminen tapahtuu lähettämällä (submit) ostoslistan lomake tätä kutsuvalle metodille.

Kommunikaatiota taustajärjestelmään (ja samalla tietokannan hallintaa) ohjataan `apiKutsu`-metodilla, jossa muodostetaan oikeanlainen REST API -pyyntö `apiOstokset`-rajapintaan otsikkotiedoilla (header).

### 2.1 API-kutsun alustus

Sama `apiKutsu`-hoitaa kaikkien mahdollisten REST API -pyyntöjen käsittelyn.

```tsx
const apiKutsu = async (metodi? : string, ostos? : Ostos, id? : number) : Promise<void> => {

    setApiData({
      ...apiData,
      haettu : false
    });

    let url = (id) ? `http://localhost:3006/api/ostokset/${id}` : `http://localhost:3006/api/ostokset`;

    let asetukset : any = { 
      method : metodi || "GET"
    };
```

Metodi saa parametreinaan tarvittavat otsikkotiedot, joita eri pyynnöissä voidaan tarvita. Metodin ensimmäisenä toimenpiteenä `apiData` alustetaan määrittämällä `haettu`-tieto arvoon `false`, jolloin käyttöliittymässä oleva latausanimaatio näkyy.

Tämän jälkeen esitellään ja määritetään HTTP-osoitteen muuttuja, johon pyyntö tehdään. Tässä osoite on kovakoodattu palvelimelle oikeaan reittiin `apiOstokset`-routen alle. URL-osoitteen sisältö muodostetaan ehdollisesti ternary-operaattorilla siten, että jos hakuosoitteeseen on annettu reittiparametrina jokin ostoksen id, tehdään API-kutsu johonkin tiettyyn ostokseen. Jos id:tä ei ole, tehdään API-kutsu koko ostoslistaan.

Lopuksi vielä esitellään `asetukset`-muuttuja, joka sisältää tehtävän HTTP-kutsun ostikkotiedot, kuten esimerkiksi pyynnön metodin (GET, POST, PUT, DELETE). Metodi saadaan suoraan `apiKutsu`-metodin parametrina tai jos sellaista ei ole annettu (vaihtoehtoinen parametri), asetetaan oletuksena metodiksi "GET".

### 2.2 POST-metodin määrittely

Jos `apiKutsu`:n yhteydessä on annettu metodina "POST", suoritetaan tässä siihen liittyvät pyynnön tietojen (header & body) määrittelyt.

```tsx
if (metodi === "POST") {
      asetukset = {
        ...asetukset,
        headers : {
          'Content-Type' : 'application/json'
        },
        body : JSON.stringify(ostos)
      }
    }
```

`asetukset`-muuttuja oli ylempänä alustettu aivan minimaalisilla tiedoilla, joita nyt päivitetään tarkemmiksi riippuen kutsun metodista. Tässä headereihin liitetään tieto lomakkeella lähetettävän tiedon tyypistä `Content-Type`, joka on json-muotoista dataa. Tämän jälkeen määritellään pyynnön body, jossa `apiKutsu`:un mahdollisena parametrina annettu ostos syötetään. Merkkijonona saatu ostos muutetaan JSON-muotoiseksi merkkijonoksi.

### 2.3 Yhteyden testaaminen ja fetch-pyynnön lähettäminen

Voit lukea [fetch-pyynnöstä](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API "https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API") lisää netistä. Käytännössä fetchiä voidaan käyttää asynkroonisesti lähettämään HTTP-pyyntö annettuun osoitteeseen annetuilla asetuksilla. Asetukset sisältävät pyynnön otsikkotiedot metodista, bodyn sisällön tyypistä jne. sekä varsinaisen pyynnön bodyn, joka on mahdollisesti lähetettävää dataa.

Koodiblokin alla selitetään eri osat.

```tsx
try {
      const yhteys = await fetch(url, asetukset);

      if (yhteys.status === 200) {
        setApiData({
          ...apiData,
          ostokset : await yhteys.json(),
          haettu : true
        });

      } else {
        let virheteksti :string = "";

        switch (yhteys.status) {
          case 400 : virheteksti = "Virhe pyynnön tiedoissa"; break;
          default : virheteksti = "Palvelimella tapahtui odottamaton virhe"; break;
        }

        setApiData({
          ...apiData,
          virhe : virheteksti,
          haettu : true
        });
      }
    } catch (e : any) {
      setApiData({
        ...apiData,
        virhe : "Palvelimeen ei saada yhteyttä",
        haettu : true
      });
    }
  }
```

- `try...catch`: Pyyntö tehdään palvelimelle "localhost:3006". Try-osassa yritetään lähettää pyyntö palvelimelle, joka vastaa joko onnistuneesti tai virheilmoituksella. Jos palvelin ei inahdakkaan, on todennäköisesti vika koko yhteydessä, jolloin suoritetaan catch-osa, jossa `apiData`:lle määritellään virhe "Palvelimeen ei saada yhteyttä"
- `const yhteys = await fetch(url, asetukset);`: Fetch-pyynnön muodostaminen ylempänä määritetyillä osoitteella ja asetuksilla. Fetch on asynkrooninen funktio, joka suoritetaan `await`-apukomennolla. `yhteys`-muuttujaan tallennetaan tieto pyynnön vastauksesta, joka sisältää muun muassa `status`-tiedon.
- `if (yhteys.status === 200) {...}`: Jos pyyntö oli onnistunut, eli vastauksen statuskoodi on 200, tiedetään, että vastauksen mukana on saatu myös dataa tietokannasta. Tässä palautuva data on JSON-muotoinen lista ostoksista, jotka tallennetaan `apiData`-tilamuuttujan `ostokset`-arrayhin. Tiedot haetaan vastauksen asynkroonisella `yhteys.json()`-metodilla, eli viitataan tehtyyn pyyntöön vastauksena saadun objektin sisältämään json-dataan.
- `if (yhteys.status === 200) {...} else {...}`: Jos yhteyden statuskoodina ei olekaan 200, eli jonkinlainen virhe ilmaantui, muodostetaan virhetekstin apumuuttuja ja tarkastetaan yhteyden statuskoodi switch...case -rakenteella. Jos koodi on 400, on pyynnön tiedoissa ollut virhe. Muussa tapauksessa ilmoitetaan "odottamattomasta virheestä". Tämän jälkeen `apiData`-tilamuuttujan `virhe`-arvo päivitetään virhetekstillä.

### 2.4 Kertaus API-kutsusta

Yllä käytiin läpi, miten asiakassovellus muodostaa palvelimelle lähetettävän HTTP-pyynnön, mistä tämä koostuu ja millaisia eri tilanteita pyynnön lähettämisessä ja vastauksen vastaanottamisessa voi ilmetä.

API-kutsu voi sisältää etukäteen määritellyn metodin, Ostos-objektin ja id:n. Nämä eivät ole kuitenkaan pakollisia tietoja. Pyynnön metodi vaikuttaa muun muassa siihen, mitä tietoja sen mukaan tarvitaan. Esimerkiksi tavalliseen GET-pyyntöön ei tarvita tietoja Ostos-objektista.

`apiData`-tilamuuttuja seuraa pyyntöjen ja vastausten mukana sovelluksen tietojen tilaa. Esimerkiksi jos sovelluksen toiminnassa esiintyy virheitä, näistä tallennetaan ilmoitus tilamuuttujaan tietoihin ja tämän mahdollisen tiedon avulla voidaan ohjelmallisesti hallita sovelluksen toimintaa. Esimerkiksi jos virheilmoitus on olemassa, tulostetaan käyttöliittymässä ostoslistan sijasta virheilmoitus Alert-komponentilla.

Lopuksi vielä määritetään useEffect-hook suorittamaan `apiKutsu` automaattisesti sovelluksen käynnistyessä. Näin saadaan sovelluksen ensimmäinen tila ja näkymä tulostettua:

```tsx
useEffect(() => {
    apiKutsu();
  }, []);
```

## 3. API-kutsut tarkemmin

Kohdassa 2 käytiin läpi, miten API-kutsu muodostetaan ja lähetetään palvelimelle. Katsotaan seuraavaksi, millaisia API-kutsuja asiakassovelluksesta voidaan lähettää. Tässä siis kerrotaan nyt, miten `apiKutsu`-metodia voidaan käyttää ennalta määritetyillä parametreilla.

### 3.1 Ostosten hakeminen - HTTP GET

`apiKutsu`-metodissa määritettiin oletuksena, että jos metodia kutsuttaessa ei erikseen anneta parametrina metodia, asetetaan muodostettavan pyynnön otsikkotiedoissa HTTP-metodiksi GET:

```tsx
let asetukset : any = { 
      method : metodi || "GET"
    };
```

Tämä tilanne on esimerkiksi sovelluksen käynnistyessä, kun ostokset haetaan ensimmäisen kerran. useEffect-hook suorittaa `apiKutsun` ilman mitään parametreja, jolloin pyyntö on GET ja osoite on `/api/ostokset`.

```tsx
useEffect(() => {
  apiKutsu();
}, []);
```

### 3.2 Ostoksen lisääminen ostoslistaan

Asiakassovelluksessa on määritetty erikseen metodi `lisaaTuote`, jonka avulla uusi ostos voidaan lähettää tietokantaan. Metodia kutsutaan automaattisesti, kun React-lomake on lähetetty (submit). `lisaaTuote` kutsuu `apiKutsu`-metodia ennalta määritellyillä tiedoilla:

#### lisaaTuote-metodi
```tsx
const lisaaTuote = (e: React.FormEvent) => {
    e.preventDefault();

    apiKutsu("POST", {
      id : 0,
      tuote : lomakeRef.current?.uusiTuote.value,
      poimittu : false
    });
  }
```

- `e.preventDefault()`: Estää lomakkeen lähettämistä oletusmenetelmällä. Tämä tehdään siksi, lomakkeen tietoja käytetään muodostamaan API-kutsun rakenne, eikä tiedoille haluta tehdä mitään oletuksena.
- `apiKutsu("POST"), {...}`: Tehdään API-kutsu POST-metodilla.
- `{id, tuote, poimittu}`: Lähetetään Ostos-objektin muotoinen data API-kutsun yhteydessä. Uutta ostosta varten oleellisin tieto on lomakkeen tekstikentässä ollut arvo tuotteen nimelle. Id muodostetaan tietokannan prisma.create -komennossa automaattisesti. Poimittu-tieto annetaan falsena, koska listaan lisättyä ostosta ei ole vielä ehditty poimia.

Lomakkeen lähettäminen ja tiedot tulevat listan alla olevista tekstikentästä ja painikkeesta:

```tsx
<TextField 
                name="uusiTuote"
                fullWidth={true}
                placeholder="Kirjoita tähän uusi tuote..."
              /> 

              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth={true}
              >Lisää tuote ostoslistaan</Button>
```

Tekstikentän arvo poimitaan POST-metodiin useRef-hookilla. Tavallisesti tämä hook liitettäisiin tekstikenttään, mutta koska nyt tietojen lähettäminen tapahtui lomakkeen muodossa, siirretään viittaus koko lomakkeen tietoihin, eli Stack-elementtiin, joka ympäröi ostosten listaa, tekstikenttää ja lisää-painiketta. Yksittäisen tekstikentän sijaan viitataan siis koko lomakkeeseen, koska sovelluksessa voisi hyvin olla kaksikin tekstikenttää eri tiedoille. Tällaisessa tapauksessa on paljon hyödyllisempi poimia lomakkeen kaikki tiedot yhdestä viittauksesta kuin luoda kaksi tai useampi eri useRef-viittaus yksittäisiin syötteisiin.

## 3.3 Ostoksen poistaminen listasta

Ostoksen poistaminen tapahtuu listaelementin yhteydessä olevasta roskakori-ikonista.

```tsx
return <ListItem 
    key={idx}
    secondaryAction={
      <IconButton 
        edge="end"
        onClick={() => { poistaTuote(ostos) }}
      >
        <DeleteIcon />
      </IconButton>
    }  
  >
  <ListItemText 
    primary={ostos.tuote}
  />
</ListItem>               
```

Listaelementti sisältää tiedon mapatun ostoksen indeksistä elementtien yksilöintiä varten. IconButton-komponentti määrittelee roskakori-ikonin, joka tulostetaan listan loppuun (end) ja tätä painamalla suoritetaan `poistaTuote`-metodi parametrinaan kyseinen mapattu ostos.

```tsx
const poistaTuote = (ostos : Ostos) => {
    apiKutsu("DELETE", undefined, ostos.id);
  }
```

Tuotteen poistaminen tapahtuu hyvin yksinkertaisesti. HTTP-metodiksi määritetään "DELETE", ostos määritellään tuntemattomaksi ja lopuksi annetaan id-parametrina ostoksesta saatava id. Undefined-määritys joudutaan tekemään, koska poistossa Ostos-olion viitaus tulee parametrina, mutta sitä ei varsinaisesti käytetä mihinkään muuhun kuin id:n poimimiseen, jotta oikea ostos poistetaan tietokannasta. `apiKutsu` kuitenkin ottaisi vastaan myös Ostos-objektin keskimmäisenä parametrina liittyen uuden ostoksen lisäämiseen. Tässä kuitenkaan tällä keskimmäisellä tiedolla ei haluta tehdä mitään, jolloin pitää vain kertoa sovellukselle, että tätä ei ole määritetty (vaikka tiedot ehkä oikeasti olisivatkin saatavilla).

## 4. Lopuksi

Tässä käytiin läpi asiakassovelluksen rakenne ja miten React-sovelluksen logiikka on saatu yhdistettyä Node-Express -palvelinsovellukseen. Tässä viimeistään havainnollistuu hyvin Web Service -sovellusten periaate. Palvelinsovellus on vain taustalla oleva järjestelmä, joka hoitaa kommunikaation käyttäjän ja jonkinlaisen kolmannen järjestelmän, kuten tietokannan kanssa. Asiakassovellus toimii ihmisystävällisenä käyttöliittymänä, joka muuttaa ihmisen ymmärtämät tiedot ja toiminnot palvelimen ymmärtämiksi API-kutsuiksi.

Kerrataan vielä tähän esimerikiksi uuden tuotteen lisääminen alusta loppuun, eli siitä, kun käyttäjä syöttää ostoksen asiakassovellukseen ja painaa "Lisää tuote ostoslistaan", aina tietokantaan tallentamiseen ja vastauksen palauttamiseen käyttäjälle.

### Kertaus asiakassovelluksen ja palvelimen yhteistoiminnasta kronologisessa järjestyksessä

Käyttäjä kirjoittaa tuotteen nimen tekstikenttään asiakassovelluksessa...

```tsx
<TextField 
  name="uusiTuote"
  fullWidth={true}
  placeholder="Kirjoita tähän uusi tuote..."
/> 
```

...joka on osa laajempaa lomaketta...

```tsx
? <Stack
  component="form"
  onSubmit={lisaaTuote}
  ref={lomakeRef}
  spacing={2}>
  <List>
```

Käyttäjä painaa lisää-painiketta...

```tsx
<Button
  type="submit"
  variant="contained"
  size="large"
  fullWidth={true}
>Lisää tuote ostoslistaan</Button>
```

...joka lähettää (submit) lomakkeen, eli suorittaa `lisaaTuote`-metodin:

```tsx
const lisaaTuote = (e: React.FormEvent) => {
  e.preventDefault();

  apiKutsu("POST", {
    id : 0,
    tuote : lomakeRef.current?.uusiTuote.value,
    poimittu : false
  });
}
```

`lisaaTuote` muodostaa HTTP POST kutsun sisältäen uuden Ostos-objektin tiedot, joista oleellisin on lomakkeen viittauksesta saatu `uusiTuote`-tekstikentän arvo. Kutsutaan metodia `apiKutsu` annetuilla asetuksilla...

```tsx
const apiKutsu = async (metodi? : string, ostos? : Ostos, id? : number) : Promise<void> => {

  let url = (id) ? `http://localhost:3006/api/ostokset/${id}` : `http://localhost:3006/api/ostokset`;

  if (metodi === "POST") {

    asetukset = {
      ...asetukset,
      headers : {
        'Content-Type' : 'application/json'
      },
      body : JSON.stringify(ostos)
    }

  }
}
```

...jossa jos pyynnön metodi on POST, lisätään otsikkotietoihin merkintä siitä, että bodyn sisältö on tyypiltään JSON-tietoa, joka sitten muodostetaan JSON-muotoiseksi merkkijonoksi. Lähetettävä tieto on siis ihan normaali string, mutta JSON.stringify automaattisesti osaa muotoilla sen siten, että merkkijona voidaan lukea myös JSON-datana (aaltosulkeet oikeissa paikoissa jne.).

`apiKutsu` yrittää tehdä pyynnön fetch-metodilla annetuilla asetuksilla ja urlilla:

```tsx
try {
  const yhteys = await fetch(url, asetukset);
}
```

Palvelimen puolella `apiOstokset` kuuntelee asiakassovelluksesta tulevia POST-pyyntöjä...

```ts
apiOstoksetRouter.post("/", async (req : express.Request, res : express.Response, next : express.NextFunction) => {
 
      if (req.body.tuote?.length > 0) {

        try {
            await prisma.ostos.create({
                data : {
                    tuote : req.body.tuote,
                    poimittu : Boolean(req.body.poimittu)
                }
            });
    
            res.json(await prisma.ostos.findMany());
    
        } catch (e : any) {
            next(new Virhe())
        }

    } else {
        next(new Virhe(400, "Virheellinen pyynnön body"));
    } 
});
```

... ja jos bodyssa tulevan Ostos-objektin tuote-kenttä sisältää tekstiä, suoritetaan `prisma.ostos.create`-komento, johon syötetään asiakassovelluksen pyynnön bodysta `tuote` ja `poimittu` -tiedot. Tämän jälkeen vastauksena lähetetään json-muodossa päivitetyn tietokannan kaikki haetut ostokset listan päivittämistä varten asiakassovelluksessa. Tässä vaiheessa, jos jokin virhe olisi tullut, esim. tuote-tekstikentässä ei olisi tietoa, palautettaisiin yhteys.status-tiedossa onnistuneen (200) yhteyden sijaan epäonnistunut (400) yhteyden tila.

Asiakassovelluksen puolella `apiKutsu` odottaa palvelimen vastausta (päivitetty ostokset-lista lisäyksen jälkeen) ja poimii vastauksena tulevan JSON-muotoisen listan ostoksista `apiData`-tilamuuttujan uudeksi arvoksi. Jos virhe olisi tullut, olisi asiakassovellukseen tulostettu ostoslistan sijasta virhe.

```tsx
      if (yhteys.status === 200) {

        setApiData({
          ...apiData,
          ostokset : await yhteys.json(),
          haettu : true
        });

      } else {

        let virheteksti :string = "";
```

Lopuksi `apiData`-tilamuuttujan päivitetyt ostokset tulostetaan uudelleen React-sovellukseen käyttäjän nähtäväksi:

```tsx
{apiData.ostokset.map((ostos : Ostos, idx : number) => {
  return <ListItem 
            key={idx}
            secondaryAction={
              <IconButton 
                edge="end"
                onClick={() => { poistaTuote(ostos) }}
              >
                <DeleteIcon />
              </IconButton>
            }  
          >
          <ListItemText 
            primary={ostos.tuote}
          />
        </ListItem>                    
})}
```