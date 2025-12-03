# Demo 6 - Läpikulku: Asiakassovelluksen toteutus

Demossa 6 toteutetaan graafinen käyttöliittymä aiemmissa demoissa (demo 3-5) kehitetylle ostoslista-palvelinsovellukselle. Tähän asti ostoslista-palvelinsovellusta on testattu Postman-sovelluksella, mutta nyt tähän rinnalle rakennetaan varsinainen asiakassovellus, jota käyttäjä voi käyttää selaimessa. Demossa käytettäviä tekniikoita ovat:

- **Vite** - Moderni kehitystyökalu React-sovelluksille
- **React + TypeScript** - Asiakassovelluksen käyttöliittymä
- **MUI (Material-UI)** - Valmiit käyttöliittymäkomponentit React-sovelluksille
- **Fetch API** - Fetchiä käytetään HTTP-pyyntöjen tekemiseen palvelimelle, eli tällä korvataan itse tehdyt Postman-kutsut
- **CORS** - Selamien turvallisuusasetusten hallinta palvelimen ja asiakkaan välillä. Työkalu, joka tarvitaan moderneissa selaimissa.

Tämän demon läpikulku havainnollistaa, miten palvelin ja asiakassovellus toimivat yhdessä ja miten ne kommunikoivat keskenään REST API -rajapinnan kautta.

## 1 Lähtötilanne ja sovelluskokoonpanon arkkitehtuuri

### 1.1 Miksi erillinen asiakassovellus?

Aiemmissa demoissa rakensimme toimivan REST API -palvelimen, joka käsittelee ostoksia tietokannassa. Palvelin tarjoaa rajapinnan (API), jonka kautta ostoksia voidaan hakea, lisätä, muokata ja poistaa. Postman-sovelluksella testasimme, että palvelin toimii oikein.

Oikeassa tilanteessa käyttäjät eivät käytä web service -tyyppisiä sovelluksia komentokehotteen tai Postmanin kautta, vaan tarvitaan esim. selaimen kautta käytettävä käyttöliittymä. Tätä varten demossa rakennetaan asiakassovellus (client application), joka:

1. Näyttää ostokset käyttöliittymässä listana
2. Tarjoaa lomakkeen uusien ostosten lisäämiseen
3. Mahdollistaa ostosten poistamisen
4. Kommunikoi palvelimen kanssa HTTP-pyyntöjen avulla

### 1.2 Kaksi erillistä sovellusta

Keskeistä on ymmärtää, että nyt rakennetaan **kaksi erillistä sovellusta**:

1. **Palvelinsovellus (backend)** - Express-palvelin portissa 3006, joka tarjoaa REST API:n
2. **Asiakassovellus (frontend)** - React-sovellus, joka kehitysvaiheessa pyörii Vite-kehityspalvelimella portissa 3000

Nämä ovat siis kaksi erillistä sovellusta, jotka kommunikoivat keskenään HTTP-pyyntöjen avulla. Asiakassovellus tekee pyyntöjä palvelimelle ja käsittelee saadut vastaukset näyttäen ne käyttäjälle.

## 2 Asiakassovelluksen alustaminen

### 2.1 Mikä on Vite?

[**Vite**](https://vite.dev/guide/, "https://vite.dev/guide/") on moderni kehitystyökalu JavaScript- ja TypeScript-sovelluksille. Se korvaa vanhempia työkaluja kuten Create React App:ia (CRA) ja tarjoaa:

- Nopean kehityspalvelimen
- TypeScript-tuen
- Yksinkertaisen konfiguraation

Vite hoitaa kaiken monimutkaisen pohjatyön ja ympäristön pystyttämisen, jota React + TypeScript -sovellukset vaativat. Kehittäjät voivat keskittyä koodin kirjoittamiseen.

### 2.2 Projektin luominen

Luodaan asiakassovellus palvelimen juureen oman kansionsa alle. Nimetään tämä kansio `client` ja avataan kansiolle oma terminaali palvelimen rinnalle. Voidaan joko avata terminaali palvelimen juuressa ja siirtyä `client`-kansion alle komennolla `cd client` tai avata terminaali suoraan `client`-kansioon (hiiren oikea kansion päällä > Open in Integrated Terminal). Avataan siis VS Codeen kaksi terminaalia "vierekkäin" palvelimelle ja asiakkaalle. Terminaaleja voi käynnistää vapaasti uusia ja kaikki näkyvät oikeassa laidassa listassa.

Kun terminaali on avattu `client`-kansion alle, voidaan Vite-kehitysympäristö asentaa seuraavalla komennolla:

```bash
npm create vite@latest . -- --template react-ts
```

- **npm create vite@latest** – Alustaa Vite-projektin viimeisimmällä versiolla
- **.** – Käyttää nykyistä sijaintia Vite-kehitysympäristön sijaintina ja nimenä
- **--** – Pakollinen ylimääräinen vipu Vite-projektien alustuksessa
- **--template react-ts** – Käyttää `react-ts` -pohjaa (React + TypeScript)

Viten uusimmalla versiolla kehitysympäristön pitäisi asentua ja lähteä käyntiin tällä samalla komennolla. Voit joutua hyväksymään jotain pakettien asentamisia, jos asennusohjelma sellaista kysyy terminaalissa.

### 2.3 MUI:n asentaminen

Asennetaan vielä **Material-UI (MUI)** -komponenttikirjasto valmiiden käyttöliittymäkomponenttien käyttöön:

```bash
npm install @mui/material @emotion/react @emotion/styled @mui/icons-material
```

MUI käyttää Roboto-fonttia, joka asennetaan:

```bash
npm install @fontsource/roboto
```

### 2.4 Kehityspalvelimen portin vaihtaminen

Vite käyttää oletuksena porttia 5173, mutta vaihdetaan se porttiin 3000 selkeyden vuoksi. Muokataan `vite.config.ts` -tiedostoa:

#### vite.config.ts
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000, // Vite-kehityspalvelin käyttää porttia 3000
  }
})
```

### 2.5 Projektin siivoaminen

Vite luo oletuspohjaan paljon esimerkkikoodia, jota emme tarvitse. Poistetaan turhat tiedostot ja siivotaan projekti:

1. Poista `src/assets`-kansio kokonaan
2. Poista `src/App.css` ja `src/index.css`
3. Tyhjennä `src/App.tsx` seuraavaan muotoon:

#### App.tsx (alku)
```typescript
import React from 'react';
import { Container, Typography } from '@mui/material';

const App : React.FC = () : React.ReactElement => {

  return (
    <Container>
      <Typography variant="h5">Demo 6: Asiakassovelluksen toteutus</Typography>
      <Typography variant="h6">Ostoslista</Typography>
    </Container>
  );
}

export default App;
```

4. Päivitä `src/main.tsx` tuomaan Roboto-fontit:

#### main.tsx
```typescript
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

### 2.6 Kehityspalvelimen käynnistäminen

Nyt kehityspalvelin on alustettu valmiiksi ohjelmointia varten ja sen voi käynnistää, jos se ei ole vielä käynnissä. Varmista, että olet `client`-terminaalissa ja suorita:

```bash
npm run dev
```

Palvelin käynnistyy osoitteeseen `http://localhost:3000`. Avaa selain ja testaa, että sovellus näkyy.

**HUOM!** Jatkossa sinulla on kaksi terminaalia auki VS Codessa:
- **Terminaali 1**: Express-palvelin (portti 3006) - aja palvelimen juuressa: `npm start`
- **Terminaali 2**: Vite-kehityspalvelin (portti 3000) - aja client-kansiossa: `npm run dev`

Molemmat palvelimet pitää olla käynnissä samanaikaisesti!

## 3 Asiakkaan ensimmäinen API-kutsu ja CORS-ongelma

### 3.1 Ostos-tietomalli ja ApiData-rajapinta

Ennen kuin voimme hakea ostoksia palvelimelta, määrittelemme TypeScript-rajapinnat (interfaces) kuvaamaan datan rakennetta. Lisätään `App.tsx`-tiedostoon:

```typescript
import React, { useEffect, useState } from 'react';
import { Alert, Backdrop, CircularProgress, Container, Typography } from '@mui/material';

interface Ostos {
  id : number
  tuote : string
  poimittu : boolean
}

interface ApiData {
  ostokset : Ostos[]
  virhe : string
  haettu : boolean
}

const App : React.FC = () : React.ReactElement => {
  // komponentin koodi...
}
```

**Mitä nämä interfacet tekevät?**

- `Ostos` kuvaa yksittäisen ostoksen rakenteen - sama kuin palvelimella
- `ApiData` kuvaa sovelluksen tilan, joka sisältää:
  - `ostokset`: Palvelimelta haetut ostokset
  - `virhe`: Mahdollinen virheviesti
  - `haettu`: Boolean, joka kertoo onko data haettu (latausanimaation hallintaan)

### 3.2 Tilan hallinta useState:lla

React-sovelluksissa käytetään **tilaa** (state) tallentamaan dataa, joka voi muuttua. Kun tila muuttuu, React renderöi komponentin uudelleen näyttäen päivitetyt tiedot. Lisätään `App`-komponenttiin tilan hallinta:

```typescript
const App : React.FC = () : React.ReactElement => {

  const [apiData, setApiData] = useState<ApiData>({
    ostokset : [],
    virhe : "",
    haettu : false
  });

  return (
    <Container>
      <Typography variant="h5">Demo 6: Asiakassovelluksen toteutus</Typography>
      <Typography variant="h6">Ostoslista</Typography>
      
      {(apiData.haettu) 
        ? <Typography>Ostokset: {apiData.ostokset}</Typography>
        : <Backdrop open={true}>
            <CircularProgress color='inherit'/>
          </Backdrop>
      }
    </Container>
  );
}
```

`useState`-hook luo tilamuuttujan `apiData` ja funktion `setApiData`, jolla tilaa voidaan päivittää. Aluksi ostokset-taulukko on tyhjä ja `haettu` on `false`, joten näytetään latausanimaatio.

### 3.3 API-kutsun tekeminen fetch:llä

Luodaan funktio `apiKutsu`, joka hakee ostokset palvelimelta. **Fetch API** on selainten natiivi työkalu HTTP-pyyntöjen tekemiseen:

```typescript
const App : React.FC = () : React.ReactElement => {

  const [apiData, setApiData] = useState<ApiData>({
    ostokset : [],
    virhe : "",
    haettu : false
  });

  const apiKutsu = async () : Promise<void> => {

    try {
      const yhteys = await fetch("http://localhost:3006/api/ostokset");

      if (yhteys.status === 200) {
        setApiData({
          ...apiData,
          ostokset : await yhteys.json(),
          haettu : true
        });
      } else {
        setApiData({
          ...apiData,
          virhe : "Palvelimella tapahtui virhe",
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

  // return (...);
}
```

**Mitä tässä tapahtuu?**

1. `fetch()` tekee HTTP GET -pyynnön annettuun URL-osoitteeseen
2. `await` odottaa, että pyyntö valmistuu (fetch on asynkroninen operaatio)
3. Tarkistetaan vastauksen status-koodi (200 = OK)
4. Jos onnistui, parsitaan JSON-data ja päivitetään tila
5. Jos epäonnistui, asetetaan virheilmoitus
6. Try-catch napaa verkkovirheet (esim. palvelin ei vastaa)

### 3.4 Automaattinen haku useEffect:llä

Ostokset tulisi hakea automaattisesti sovelluksen latautuessa. tähän käytetään **useEffect**-hookia:

```typescript
const App : React.FC = () : React.ReactElement => {

  const [apiData, setApiData] = useState<ApiData>({...});

  const apiKutsu = async () : Promise<void> => {...}

  useEffect(() => {
    apiKutsu();
  }, []); // Tyhjä taulukko = suoritetaan vain kerran komponentin latautuessa

  return (...);
}
```

`useEffect` suorittaa annetun funktion komponentin ensimmäisen renderöinnin jälkeen. Tyhjä riippuvuustaulukko `[]` tarkoittaa, että efekti ajetaan vain kerran.

### 3.5 CORS-virhe - mitä tapahtuu?

Käynnistä molemmat palvelimet ja avaa selain osoitteeseen `http://localhost:3000`. Avaa selaimen kehittäjätyökalut (F12) ja katso Console-välilehteä. Näet todennäköisesti seuraavanlaisen kaltaisen virheilmoituksen:

```
Access to fetch at 'http://localhost:3006/api/ostokset' from origin 
'http://localhost:3000' has been blocked by CORS policy: No 
'Access-Control-Allow-Origin' header is present on the requested resource.
```

**Mikä on CORS ja miksi se estää pyynnön?**

## 4 CORS-politiikka ja sen korjaaminen

### 4.1 Mikä on CORS?

[**CORS (Cross-Origin Resource Sharing)**](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS, "https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS") on selainten turvallisuusmekanismi, joka estää verkkosivuja tekemästä pyyntöjä eri alkuperään (origin) kuin mistä sivu itse on ladattu.

**Alkuperä (origin)** koostuu kolmesta osasta:
- Protokolla (http/https)
- Domain (localhost)
- Portti (3000 tai 3006)

Meidän tapauksessamme:
- **Asiakassovelluksen alkuperä**: `http://localhost:3000`
- **Palvelimen alkuperä**: `http://localhost:3006`

Koska portit eroavat, selain tulkitsee nämä **eri alkuperiksi** ja estää pyynnön oletuksena. CORS varmistaa, että **vain hyväksytyt sivustot voivat tehdä pyyntöjä** palvelimelle.

### 4.2 CORS:in käyttöönotto Express-palvelimella

Korjataan ongelma asentamalla `cors`-middleware palvelimelle. Palvelimen juuressa aja:

```bash
npm install cors
npm install --save-dev @types/cors
```

Lisätään CORS palvelimen `index.ts`-tiedostoon:

#### index.ts
```typescript
import express from 'express';
import path from 'path';
import apiOstoksetRouter from './routes/apiOstokset';
import virhekasittelija from './errors/virhekasittelija';
import cors from 'cors'; // Tuodaan cors-middleware

const app : express.Application = express();

const portti : number = Number(process.env.PORT) || 3006;

// Otetaan CORS käyttöön ja sallitaan pyynnöt vain osoitteesta http://localhost:3000
app.use(cors({origin : "http://localhost:3000"}));

// Valinnainen: hidasta palvelimen vastauksia sekunnilla testaustarkoituksessa (liittyy toteutettavaan latausanimaatioon)
app.use((req : express.Request, res : express.Response, next : express.NextFunction) => {
    setTimeout(() => next(), 1000);
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
    console.log(`Palvelin käynnistyi osoitteeseen: http://localhost:${portti}`);    
});
```

**Mitä `cors({origin: "http://localhost:3000"})` tekee?**

- Lisää palvelimen vastauksiin `Access-Control-Allow-Origin: http://localhost:3000` -headerin
- Kertoo selaimelle, että pyynnöt osoitteesta `http://localhost:3000` ovat sallittuja
- Muista alkuperistä tulevat pyynnöt estetään edelleen

**HUOM!** Tuotannossa origin pitää vaihtaa oikeaan domain-nimeen, esim. `https://minun-ostoslista.fi`.

### 4.3 Testaus - CORS toimii!

Käynnistä palvelin uudelleen ja päivitä selain. Nyt Console-välilehdellä ei pitäisi näkyä CORS-virhettä, ja latausanimaatio vaihtuu tekstiksi, joka näyttää ostosten taulukon.

## 5 Asiakassovelluksen viimeistely

### 5.1 Ostosten listaus MUI-komponenteilla

Päivitetään `App.tsx` näyttämään ostokset listana MUI:n `List`-komponentilla:

```typescript
const App : React.FC = () : React.ReactElement => {

  const [apiData, setApiData] = useState<ApiData>({
    ostokset : [],
    virhe : "",
    haettu : false
  });

  const apiKutsu = async () : Promise<void> => {
    // ... aiempi koodi
  }

  useEffect(() => {
    apiKutsu();
  }, []);

  return (
    <Container>
      
      <Typography variant="h5">Demo 6: Asiakassovelluksen toteutus</Typography>
      <Typography variant="h6" sx={{marginBottom : 2, marginTop : 2}}>Ostoslista</Typography>

      {(Boolean(apiData.virhe))
        ? <Alert severity="error">{apiData.virhe}</Alert>
        : (apiData.haettu) 
          ? <List>
              {apiData.ostokset.map((ostos : Ostos, idx : number) => {
                return <ListItem key={idx}>
                        <ListItemText primary={ostos.tuote} />
                      </ListItem>                    
              })}
            </List>
          : <Backdrop open={true}>
              <CircularProgress color='inherit'/>
            </Backdrop>
      }

    </Container>
  );
}
```

Muista tuoda tarvittavat komponentit:
```typescript
import { Alert, Backdrop, CircularProgress, Container, List, ListItem, ListItemText, Typography } from '@mui/material';
```

**Logiikka:**
1. Jos `apiData.virhe` on asetettu → näytä virheviesti
2. Muuten jos `apiData.haettu` on true → näytä ostoslista
3. Muuten → näytä latausanimaatio

`map()`-funktio käy läpi jokaisen ostoksen ja luo jokaiselle `ListItem`-komponentin.

### 5.2 Täydennetään API-kutsun funktio myös muille CRUD-pyynnöille

Laajennetaan `apiKutsu`-funktiota niin, että se osaa käsitellä eri HTTP-metodeja (GET, POST, DELETE) ja eri URL-osoitteita:

```typescript
const apiKutsu = async (metodi? : string, ostos? : Ostos, id? : number) : Promise<void> => {

  // Asetetaan haettu false, jotta latausanimaatio näkyy
  setApiData({
    ...apiData,
    haettu : false
  });

  // Muodostetaan URL: jos id annettu, lisätään se polkuun
  let url = (id) 
    ? `http://localhost:3006/api/ostokset/${id}` 
    : `http://localhost:3006/api/ostokset`;

  // Perusasetukset fetch-kutsulle
  let asetukset : any = { 
    method : metodi || "GET" // Jos metodia ei anneta, käytetään GET
  };

  // Jos metodi on POST, lisätään body ja headerit
  if (metodi === "POST") {
    asetukset = {
      ...asetukset,
      headers : {
        'Content-Type' : 'application/json'
      },
      body : JSON.stringify(ostos)
    }
  }
  
  try {
    const yhteys = await fetch(url, asetukset);

    if (yhteys.status === 200) {
      setApiData({
        ...apiData,
        ostokset : await yhteys.json(),
        haettu : true
      });
    } else {
      let virheteksti : string = "";

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

Nyt `apiKutsu`-funktiota voidaan käyttää monipuolisesti:
- `apiKutsu()` → GET /api/ostokset (hae kaikki)
- `apiKutsu("DELETE", undefined, 5)` → DELETE /api/ostokset/5 (poista id 5)
- `apiKutsu("POST", uusiOstos)` → POST /api/ostokset (lisää uusi)

### 5.3 Ostoksen poistaminen

Lisätään poistotoiminto. Ensin luodaan funktio, joka kutsuu `apiKutsu`:a DELETE-metodilla:

```typescript
const poistaTuote = (ostos : Ostos) => {
  apiKutsu("DELETE", undefined, ostos.id);
}
```

Sitten lisätään jokaiseen `ListItem`:iin poistonappi:

```typescript
import { Alert, Backdrop, Button, CircularProgress, Container, IconButton, List, ListItem, ListItemText, Stack, TextField, Typography } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

// ... komponentissa:

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
            <ListItemText primary={ostos.tuote} />
          </ListItem>                    
  })}
</List>
```

`secondaryAction`-ominaisuus lisää `ListItem`-elementin oikeaan reunaan komponentin, mikä on tässä tapauksessa roskakorikuvakkeellinen painike (IconButton).

### 5.4 Ostoksen lisääminen lomakkeella

Luodaan lomake uuden ostoksen lisäämiseen. `useRef`-hookia käytetään viittaamaan lomakkeen kenttiin:

```typescript
import React, { useEffect, useRef, useState } from 'react';

const App : React.FC = () : React.ReactElement => {

  const lomakeRef = useRef<any>(null); // Viite lomakkeen kenttiin

  const [apiData, setApiData] = useState<ApiData>({...});

  const lisaaTuote = (e: React.FormEvent) => {
    e.preventDefault(); // Estetään lomakkeen oletustoiminta (sivun uudelleenlataus)

    apiKutsu("POST", {
      id : 0, // ID generoidaan palvelimella
      tuote : lomakeRef.current?.uusiTuote.value,
      poimittu : false
    });
  }

  // ... muut funktiot

  return (
    <Container>
      
      <Typography variant="h5">Demo 6: Asiakassovelluksen toteutus</Typography>
      <Typography variant="h6" sx={{marginBottom : 2, marginTop : 2}}>Ostoslista</Typography>

      {(Boolean(apiData.virhe))
        ? <Alert severity="error">{apiData.virhe}</Alert>
        : (apiData.haettu) 
          ? <Stack
              component="form"
              onSubmit={lisaaTuote}
              ref={lomakeRef}
              spacing={2}>
              
              <List>
                {/* ... ostosten listaus */}
              </List>

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

            </Stack>
          : <Backdrop open={true}>
              <CircularProgress color='inherit'/>
            </Backdrop>
      }

    </Container>
  );
}
```

**Miten lomake toimii?**

1. `<Stack component="form">` - MUI:n Stack-komponentti toimii HTML-lomakkeena
2. `ref={lomakeRef}` - Luodaan viittaus lomakkeeseen
3. `onSubmit={lisaaTuote}` - Kun lomake lähetetään (Enter tai nappi), kutsutaan `lisaaTuote`-funktiota
4. `lomakeRef.current?.uusiTuote.value` - Haetaan "uusiTuote"-kentän arvo
5. `e.preventDefault()` - Estetään lomakkeen oletustoiminta (joka lataisi sivun uudelleen)

## 6 Sovelluksen testaaminen

### 6.1 Oletustoiminta

Varmista, että molemmat palvelimet ovat käynnissä:
- **Terminaali 1** (palvelimen juuri): `npm run dev` → Express-palvelin portissa 3006
- **Terminaali 2** (client-kansio): `npm run dev` → Vite-palvelin portissa 3000

Avaa selain osoitteeseen `http://localhost:3000` ja testaa:

1. **Ostosten lataus** - Sovellus näyttää tietokannassa olevat ostokset
2. **Latausanimaatio** - Kun teet toiminnon, näkyy hetken latausanimaatio (1 sekunnin viive palvelimella)
3. **Ostoksen lisääminen** - Kirjoita tuote tekstikenttään ja paina nappia
4. **Ostoksen poistaminen** - Klikkaa roskakorikuvaketta

### 6.2 Virheiden käsittely

Testaa myös virheiden käsittelyä:

1. **Palvelin sammutettu** - Sammuta Express-palvelin. Sovelluksen pitäisi näyttää: "Palvelimeen ei saada yhteyttä"
2. **Tyhjä lomake** - Yritä lisätä tyhjä tuote. Palvelin palauttaa virheen 400: "Virheellinen pyynnön body"

## 7 Lopuksi

Tässä demossa rakennettiin full stack -sovellus, joka koostuu:

1. **Palvelinsovelluksesta (Express + Prisma)** - Käsittelee dataa ja tarjoaa REST API:n
2. **Asiakassovelluksesta (React + TypeScript + MUI)** - Tarjoaa käyttöliittymän selaimessa
3. **CORS-konfiguraatiosta** - Mahdollistaa turvallisen kommunikoinnin eri alkuperien välillä

Alamme viimein lähestyä palvelin- ja asiakassovellusten perusteiden loppua. Tämä oli vain yksi merkki web service -tyyppisen sovelluksen toteuttamisesta yhdistettynä graafiseen asiakassovellukseen. Seuraavissa demoissa perehdytään kehittyneempiin keskeisiin fullstack-sovellusten tekniikoihin, kuten turvallisuuteen ja käyttäjänhallintaan.

Demon keskeiset käsitteet:
- **Vite** - Moderni React-projektin kehitystyökalu
- **Fetch API** - HTTP-pyyntöjen tekeminen selaimesta
- **CORS** - Selainturvallisuuden hallinta
- **React Hooks** - useState, useEffect, useRef
- **MUI** - Valmis komponenttikirjasto käyttöliittymille
