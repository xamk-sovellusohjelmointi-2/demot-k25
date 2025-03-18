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

Ostoslistan tulostaminen on rakennettu ehdolliseksi, sillä sovelluksen toiminnassa voi tulla virheitä. Tähän liittyy myös demossa 4 määritellyn virhekäsittelijän hyödyntäminen. Demossa on toteutettu React-sovelluksen tilaa seuraava `apiData`-tilamuuttuja, joka sisältää muun muassa kentän mahdollisille virheille. Tätä hyödynnetään ostoslistan näkymän tulostuksessa:

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

### 1.2 Ostosten tulostaminen listaan

