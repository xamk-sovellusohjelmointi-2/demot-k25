# Demo 8 - Läpikulku: Käyttäjänhallinta ja autentikointi

Demossa 8 jatketaan demon 7 sovelluksen kehittämistä lisäämällä järjestelmään käyttäjänhallinta ja autentikointi. Edellisessä demossa toteutettiin JWT-pohjainen autorisointi, jossa token kovakoodattiin asiakassovelluksen lähdekoodiin. Tämä ei ole turvallinen käytäntö, vaan token tulisi luoda dynaamisesti onnistuneen kirjautumisen perusteella.

Demossa toteutetaan:
- Käyttäjätaulu Prisma-tietokantaan
- Kirjautumisrajapinta palvelimelle
- Kirjautumisnäkymä asiakassovellukseen
- React Router -pohjainen reititys asiakassovellukseen eri näkymien välillä
- LocalStorage-pohjainen session hallinta käyttäjän kirjautumiselle

## 1 Autentikointi vs. Autorisointi

Ennen kuin siirrytään koodiin, on tärkeä ymmärtää kahden käsitteen ero:

**Autentikointi** (Authentication) tarkoittaa käyttäjän tunnistamista. Kun käyttäjä kirjautuu järjestelmään käyttäjätunnuksella ja salasanalla, palvelin varmistaa, että käyttäjä on se, kuka väittää olevansa.

**Autorisointi** (Authorization) tarkoittaa käyttöoikeuksien hallintaa. Kun käyttäjä on tunnistettu, määritetään mihin resursseihin hänellä on oikeus päästä käsiksi.

Edellisessä demossa toteutettiin autorisointi JWT-tokenilla, mutta token luotiin manuaalisesti. Tässä demossa toteutetaan autentikointi, joka luo tokenin automaattisesti onnistuneen kirjautumisen yhteydessä. Näin autentikointi ja autorisointi yhdistyvät toimivaksi kokonaisuudeksi.

## 2 Tietokannan laajentaminen

### 2.1 Käyttäjätaulun lisääminen

Käyttäjänhallinta vaatii tietokantataulun, johon tallennetaan käyttäjien tiedot. Laajennetaan `schema.prisma` -tiedostoa lisäämällä uusi `Kayttaja`-malli:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = "file:./data.db"
}

model Ostos {
  id       Int     @id @default(autoincrement())
  tuote    String
  poimittu Boolean @default(false)
}

model Kayttaja {
  id             Int    @id @default(autoincrement())
  kayttajatunnus String
  salasana       String
}
```

`Kayttaja`-malli sisältää kolme kenttää:
- `id`: Automaattisesti kasvava yksilöivä tunniste
- `kayttajatunnus`: Käyttäjän kirjautumistunnus
- `salasana`: Hashattu salasana (ei koskaan tallenneta selkokielisenä!)

### 2.2 Tietokannan päivittäminen

Kun schema on päivitetty, otetaan muutokset käyttöön tietokantaan. Tähän on kaksi tapaa:

**Kehitysvaiheessa (käytämme tätä demoissa):**
```bash
npx prisma db push
npx prisma generate
```

`db push` työntää skeeman suoraan tietokantaan ilman migraatiohistoriaa. Tämä on nopea ja yksinkertainen tapa kehitysvaiheessa.

**Tuotantokäytössä (suositeltu tapa):**
```bash
npx prisma migrate dev --name lisaa-kayttaja
```

Tämä luo migraatiotiedoston, joka dokumentoi muutokset. Tuotantokäytössä tämä on parempi tapa, koska se mahdollistaa muutosten seuraamisen ja tarvittaessa niiden perumisen.

Käytämme demoissa `db push` -komentoa.

Tämän jälkeen lisätään testikäyttäjä tietokantaan. Salasana pitää hashata ennen tallentamista. Voidaan käyttää Node.js:n `crypto`-kirjaston SHA-256 hashia. Tehdään pieni apuskripti salasanan hashaamiseen:

```javascript
// luoSalasana.js
let hash = require("crypto").createHash("SHA256").update("passu123").digest("hex");

console.log(hash);
```

Suoritetaan: `node luoSalasana.js`, joka tulostaa hashatun salasanan. Lisätään käyttäjä tietokantaan Prisma Studiolla. Avaa uusi terminaali palvelimen juureen ja suorita komento:

```bash
npx prisma studio
```

Avaa Prisma Studio selaimessa ja luo Kayttaja-tauluun uusi käyttäjä käyttäjätunnuksella "juuseri" ja salasana generoidulla hashilla.

## 3 Palvelimen muutokset

### 3.1 Kirjautumisrajapinnan luominen

Luodaan palvelimelle uusi rajapintatiedosto `/routes/apiAuth.ts` käyttäjien autentikointia varten:

```typescript
import express from 'express';
import { PrismaClient } from '@prisma/client';
import { Virhe } from '../errors/virhekasittelija';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const apiAuthRouter : express.Router = express.Router();
const prisma : PrismaClient = new PrismaClient();

apiAuthRouter.use(express.json());

apiAuthRouter.post("/login", async (req : express.Request, res : express.Response, next : express.NextFunction) : Promise<void> => {

    try {
        // Haetaan ensimmäine käyttäjä tietokannasta tunnuksen perusteella
        const kayttaja = await prisma.kayttaja.findFirst({
            where : {
                kayttajatunnus : req.body.kayttajatunnus
            }
        });

        // Tarkistetaan löytyikö käyttäjä
        if (req.body.kayttajatunnus === kayttaja?.kayttajatunnus) {

            // Hashataan kirjautumisen yhteydessä annettu salasana
            let hash = crypto.createHash("SHA256").update(req.body.salasana).digest("hex");

            // Verrataan hashia tietokannassa olevaan käyttäjä-tietueen salasanaan, joka on valmiiksi hashattu aiemmassa vaiheessa
            if (hash === kayttaja?.salasana) {

                // Luodaan JWT-token onnistuneesta kirjautumisesta
                let token = jwt.sign({}, "ToinenSalausLause_25");

                res.json({ token : token })

            } else {
                next(new Virhe(401, "Virheellinen käyttäjätunnus tai salasana"));
            }

        } else {
            next(new Virhe(401, "Virheellinen käyttäjätunnus tai salasana"));
        }

    } catch {
        next(new Virhe());
    }

});

export default apiAuthRouter;
```

**Kirjautumislogiikka:**

Kirjautumisen toiminnallisuus yhdistetään myöhemmin asiakassovellukseen luotavaan kirjautumisnäkymään. Palvelimella on varsinainen kirjautumisen logiikka, jonka kulku on tiivistettynä alla.

1. Haetaan käyttäjä tietokannasta pyynnön bodyn käyttäjätunnuksen perusteella
2. Jos käyttäjä löytyy, hashataan pyynnössä tullut salasana samalla algoritmilla (SHA-256)
3. Verrataan hashattua salasanaa tietokannan hashiin
4. Jos hashit täsmäävät eli salasana on sama, jolla käyttäjä luotiin, luodaan JWT-token ja palautetaan se asiakkaalle
5. Jos jotain menee pieleen, palautetaan 401 Unauthorized -virhe

Huomaa että virheviestit ovat tarkoituksella epämääräisiä ("Virheellinen käyttäjätunnus tai salasana"). Ei paljasteta onko käyttäjätunnus vai salasana väärä.

### 3.2 Palvelimen pääkoodi

Päivitetään `index.ts` ottamaan käyttöön uusi autentikaatiorajapinta ja eriyttämään token-tarkistus omaksi funktiokseen:

```typescript
import express from 'express';
import path from 'path';
import apiOstoksetRouter from './routes/apiOstokset';
import apiAuthRouter from './routes/apiAuth';
import virhekasittelija from './errors/virhekasittelija';
import jwt from 'jsonwebtoken';
import cors from 'cors';

const app : express.Application = express();
const portti : number = Number(process.env.PORT) || 3008;

// Token-tarkistus omana funktiona
const checkToken = (req : express.Request, res : express.Response, next : express.NextFunction) => {
    try {
        let token : string = req.headers.authorization!.split(" ")[1];
        jwt.verify(token, "ToinenSalausLause_25");
        next();
    } catch (e: any) {
        res.status(401).json({});
    }
}

app.use(cors({origin: "http://localhost:3000"}));
app.use(express.static(path.resolve(__dirname, "public")));

// Autentikaatiorajapinta - ei vaadi tokenia
app.use("/api/auth", apiAuthRouter);

// Ostoslistarajapinta - vaatii tokenin
app.use("/api/ostokset", checkToken, apiOstoksetRouter);

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

**Keskeiset muutokset:**

1. JWT-tarkistus erotetaan omaksi `checkToken`-funktiokseen. Tämä mahdollistaa sen, että voidaan määrittää mitkä reitit vaativat tokenin ja mitkä eivät.

2. `/api/auth` -reitti **ei vaadi** tokenia, koska muuten käyttäjä ei voisi kirjautua sisään (kirjautumiseen ei voi vaatia tokenia, kun tokenia ei vielä ole).

3. `/api/ostokset` -reitti **vaatii** tokenin, koska ostoslistan käsittely on vain kirjautuneille käyttäjille.

Tämä on tärkeä muutos verrattuna demon 7 toteutukseen. Aiemmin token-tarkistus oli middlewarena kaikille reiteille heti CORS:n jälkeen, mikä esti kaikki pyynnöt ilman tokenia.

## 4 Asiakassovelluksen muutokset

### 4.1 React Router käyttöönotto

Asiakassovellus tarvitsee nyt kaksi erillistä näkymää: kirjautumisnäkymän ja ostoslistan. Tähän käytetään React Routeria. Asennetaan tarvittava kirjasto **asiakassovellukseen** (eli `client`-kansion terminaaliin):

```bash
npm install react-router-dom
```

Päivitetään `main.tsx` ottamaan React Router käyttöön:

```typescript
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { BrowserRouter } from 'react-router-dom';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
```

`BrowserRouter`-komponentti mahdollistaa selaimen URL-pohjaisen reitityksen React-sovelluksessa.

### 4.2 App.tsx refaktorointi

`App.tsx` muuttuu reitityksen hallintakomponentiksi, joka sisältää myös token-tilan hallinnan:

```typescript
import React, { useState } from 'react';
import { Container, Typography } from '@mui/material';
import { Route, Routes } from 'react-router-dom';
import Ostoslista from './components/Ostoslista';
import Login from './components/Login';

const App : React.FC = () : React.ReactElement => {

  const [token, setToken] = useState<string>(String(localStorage.getItem("token")));

  return (
    <Container>
      
      <Typography variant="h5">Demo 8: Käyttäjähallinta</Typography>

      <Typography variant="h6" sx={{marginBottom : 2, marginTop : 2}}>Ostoslista</Typography>

      <Routes>
        <Route path="/" element={<Ostoslista token={token}/>}/>
        <Route path="/login" element={<Login setToken={setToken} />}/>
      </Routes>

    </Container>
  );
}

export default App;
```

**Keskeiset toiminnot:**

1. Token-tila alustetaan localStorage:sta. Jos käyttäjä on aiemmin kirjautunut, token säilyy selaimen muistissa.

2. `Routes`-komponentti määrittää sovelluksen reitit:
   - `/` - Ostoslista-näkymä (vaatii tokenin)
   - `/login` - Kirjautumisnäkymä

3. Token välitetään Ostoslista-komponentille propseina, ja `setToken`-funktio välitetään Login-komponentille, jotta se voi päivittää tokenin kirjautumisen yhteydessä.

### 4.3 Login-komponentin luominen

Luodaan uusi kansio `/components` ja sen alle `Login.tsx`:

```typescript
import React, { Dispatch, SetStateAction, useRef } from "react";
import { Backdrop, Box, Button, Paper, Stack, TextField, Typography} from "@mui/material";
import { useNavigate, NavigateFunction } from 'react-router-dom';

interface Props {
    setToken : Dispatch<SetStateAction<string>>
}

const Login: React.FC<Props> = (props : Props) : React.ReactElement => {

    const navigate : NavigateFunction = useNavigate();
    const lomakeRef = useRef<HTMLFormElement>(null);

    const kirjaudu = async (e : React.FormEvent) : Promise<void> => {
        
        e.preventDefault();

        if (lomakeRef.current?.kayttajatunnus.value) {
            if (lomakeRef.current?.salasana.value) {

                // Yhteyden muodostaminen palvelimen auth-rajapintaan login-reittikäsittelijään
                const yhteys = await fetch("http://localhost:3008/api/auth/login", {
                    method : "POST",
                    headers : {
                        'Content-Type' : 'application/json'
                    },
                    body : JSON.stringify({
                        kayttajatunnus : lomakeRef.current?.kayttajatunnus.value,
                        salasana : lomakeRef.current?.salasana.value
                    })
                });

                // Jos kirjautuminen onnistuu, palauttaa palvelin tokenin autorisointia varten ja tallentaa sen selaimen muistiin
                if (yhteys.status === 200) {

                    let {token} = await yhteys.json();

                    props.setToken(token);
                    localStorage.setItem("token", token);
                    navigate("/");

                }
            } 
        } 
    };

    // Kirjautumisnäkymän muotoilu
    return (
        <Backdrop open={true}>
            <Paper sx={{padding : 2}}>
                <Box
                    component="form"
                    onSubmit={kirjaudu}
                    ref={lomakeRef}
                    style={{
                        width: 300,
                        backgroundColor : "#fff",
                        padding : 20
                    }}
                >
                    <Stack spacing={2}>
                        <Typography variant="h6">Kirjaudu sisään</Typography>
                        <TextField 
                            label="Käyttäjätunnus" 
                            name="kayttajatunnus"
                        />
                        <TextField 
                            label="Salasana"
                            name="salasana"
                            type="password" 
                        />
                        <Button 
                            type="submit" 
                            variant="contained" 
                            size="large"
                        >
                            Kirjaudu
                        </Button>
                        <Typography>
                            (Kirjaudu testitunnuksilla: käyttäjä:juuseri, salasana:passu123)
                        </Typography>
                    </Stack>
                </Box>
            </Paper>
        </Backdrop>
    );
};

export default Login;
```

**Kirjautumisnäkymän logiikka:**

1. Lomake lähettää käyttäjätunnuksen ja salasanan palvelimen `/api/auth/login` -rajapintaan
2. Jos kirjautuminen onnistuu (status 200), palvelin palauttaa JWT-tokenin
3. Token tallennetaan sekä komponentin tilan että localStorage:n kautta
4. `useNavigate`-hookilla ohjataan käyttäjä takaisin ostoslistanäkymään (`/`)

MUI:n `Backdrop`-komponentti luo modaalityyppisen kirjautumisnäkymän, joka on aina näkyvissä kunnes kirjautuminen onnistuu.

### 4.4 Ostoslista-komponentin luominen

Aikaisemmin `App.tsx`:ssä ollut ostoslistan logiikka siirretään omaksi komponentiksi `/components/Ostoslista.tsx`. Logiikka pysyy pitkälti samana, mutta nyt se saa tokenin propsina ja käyttää sitä API-kutsuissa:

```typescript
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Backdrop, Button, CircularProgress, IconButton, List, ListItem, ListItemText, Stack, TextField} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import {useNavigate, NavigateFunction} from 'react-router-dom';

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

interface fetchAsetukset {
  method : string
  headers? : any
  body? : string
}

interface Props {
  token : string
}

const Ostoslista : React.FC<Props> = (props : Props) : React.ReactElement => {

  const navigate : NavigateFunction = useNavigate();
  const lomakeRef = useRef<HTMLFormElement>(null);

  const [apiData, setApiData] = useState<ApiData>({
                                                    ostokset : [],
                                                    virhe : "",
                                                    haettu : false
                                                  });

  const poistaTuote = (ostos : Ostos) => {
    apiKutsu("DELETE", undefined, ostos.id);
  }

  const lisaaTuote = (e: React.FormEvent) => {
    e.preventDefault();
    apiKutsu("POST", {
      id : 0,
      tuote : lomakeRef.current?.uusiTuote.value,
      poimittu : false
    });
  }

  const apiKutsu = async (metodi? : string, ostos? : Ostos, id? : number) : Promise<void> => {

    setApiData({
      ...apiData,
      haettu : false
    });

    let url = (id) ? `http://localhost:3008/api/ostokset/${id}` : `http://localhost:3008/api/ostokset`;

    let asetukset : fetchAsetukset = { 
      method : metodi || "GET",
      headers : {
        'Authorization' : `Bearer ${props.token}` // Token propseista
      }
    };

    if (metodi === "POST") {
      asetukset = {
        ...asetukset,
        headers : {
          ...asetukset.headers,
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

        let virheteksti :string = "";

        switch (yhteys.status) {
          case 400 : virheteksti = "Virhe pyynnön tiedoissa"; break;
          case 401 : navigate("/login"); break; // Ohjataan kirjautumaan
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

  useEffect(() => {
    apiKutsu();
  }, []);

  return (
    <>
      {(Boolean(apiData.virhe))
        ? <Alert severity="error">{apiData.virhe}</Alert>
        : (apiData.haettu) 
          ? <Stack
              component="form"
              onSubmit={lisaaTuote}
              ref={lomakeRef}
              spacing={2}>
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
    </>
  );
}

export default Ostoslista;
```

**Keskeiset muutokset demoon 7 verrattuna:**

1. Token ei ole enää kovakoodattu vaan tulee propseista
2. Virheenkäsittelyssä 401-tilanne ohjaa käyttäjän kirjautumissivulle

## 5 Sovelluksen testaaminen

### 5.1 Palvelimen käynnistys

Käynnistetään Express-palvelin omassa terminaalissa:

```bash
npm start
```

Palvelimen tulisi käynnistyä porttiin 3008.

### 5.2 Asiakassovelluksen käynnistys

Käynnistetään Vite-kehityspalvelin toisessa terminaalissa asiakassovelluksen kansiossa:

```bash
npm run dev
```

Kehityspalvelin käynnistyy porttiin 3000.

### 5.3 Kirjautumisen testaaminen

1. Avaa selain osoitteeseen `http://localhost:3000`
2. Sovellus ohjaa automaattisesti kirjautumisnäkymään, jos tokenin voimassaolo ei päde
3. Kirjaudu testitunnuksilla (käyttäjä: `juuseri`, salasana: `passu123`)
4. Onnistuneen kirjautumisen jälkeen sovellus ohjaa ostoslistanäkymään
5. Voit nyt lisätä ja poistaa tuotteita normaalisti

### 5.4 Session pysyvyyden testaaminen

1. Kirjaudu sisään
2. Päivitä selain (F5)
3. Huomaat, että pysyt kirjautuneena - token säilyy localStorage:ssa

### 5.5 Uloskirjautumisen simulointi

1. Avaa selaimen kehittäjätyökalut (F12)
2. Siirry Application/Storage -välilehdelle
3. Tyhjennä localStorage tai poista "token"-avain
4. Päivitä sivu - sinut ohjataan takaisin kirjautumissivulle

## 6 Yhteenveto ja tietoturvapohdintoja

Demossa 8 toteutettiin toimiva käyttäjänhallinta ja autentikointi REST API -sovellukseen. Yhdistämällä autentikointi (käyttäjän tunnistaminen) ja autorisointi (pääsyoikeudet) saatiin aikaan toimiva turvallisempi sovellus.

### Toteutuksen keskeiset komponentit:

**Palvelinpuoli:**
- Prisma-tietokantaan päivitettiin `Kayttaja`-taulu käyttäjätiedoille
- Palvelimelle luotiin kirjautumisrajapinta salasanan tarkistukseen
- JWT-tokenin luonti seuraa onnistuneesta kirjautumisesta
- Reitit eriyttävä middleware-rakenne (toiset reitit vaativat tokenin, toiset eivät)

**Asiakaspuoli:**
- React Router -pohjainen reititys näkymille
- LocalStorage-pohjainen session hallinta
- Modulaarinen komponenttirakenne (Login, Ostoslista)
- Automaattinen ohjaus kirjautumissivulle 401-virheessä

### Tietoturvanäkökulmat:

**Mitä tehtiin:**
- Salasana hashataan SHA-256 algoritmilla
- Token luodaan dynaamisesti, sitä ei enää kovakoodata asiakassovellukseen
- Virheviestit eivät paljasta onko käyttäjätunnus vai salasana väärä
- CORS rajaa selainyhteydet tiettyyn originiin


### Seuraavat askeleet:

Tämä demo tarjoaa perustan käyttäjänhallinnalle ja autentikoinnille. Sovellusta voisi tästä laajentaa esimerkiksi:

- Käyttäjärooleilla (admin, user)
- Salasanan vaihtotoiminnolla
- Rekisteröitymistoiminnolla
- "Muista minut" -toiminnolla
- Kaksivaiheiset autentikoinnilla (2FA)

Näitä asioita ei kuitenkaan käytä opintojakson demoissa, vaan ovat vain pohdittavaa tulevaisuudelle. 

Käydyissä kahdeksassa demossa olemme aloittaneet palvelinohjelmoinnin perusteista ja siirtyneet vaihe vaiheelta REST API -periaatteita käyttävän Web Service -tyylisen palvelinsovelluksen toteutukseen, joka lopulta yhdistettiin Reactilla toteutettuun erilliseen asiakassovellukseen. Opintojakson demot ovat havainnollistaneet hyvin tyypillisen perus työnkulun fullstack-sovellusten kehittämisessä. Monet modernit frameworkit eli kehykset tarjoavat monet palvelinsovelluksen ominaisuudet suoraan osana sovelluksen perustamista ja tällä opintojaksolla opiskeltiinkin paljon perusteellisemmin palvelinsovellusten toimintaa ja rakennetta.

Demojen pohjalta sinulla tulisi olla hyvät lähtökohdat toteuttaa verkkosovelluksia sekä niiden taustajärjestelmiä.