# Material UI -kertaus

### [<-- Takaisin](../README.md)

Ostoslistasovellus käyttää Material UI -käyttöliittymäkomponentteja toteutuksessa. MUI:n käyttö on opiskeltu jo edellisellä Sovellusohjelmoinnin toteutuksella, mutta tässä vielä kertauksena kirjastona asentaminen ja komponenttien käyttäminen tiivistetysti.

Material UI asennetaan osaksi React-projektia NPM:llä. Tällä hetkellä kirjaston asentamiseen tarvitaan seuraavat komennot:

#### Oletusasennus
`npm install @mui/material @emotion/react @emotion/styled`

#### Roboto-fontti
`npm install @fontsource/roboto`

Fontin importaus main.tsx -tiedostoon:

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
// Roboto -fontti
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

#### MUI:n ikonit

`npm install @mui/icons-material`

## MUI-komponenttien käyttäminen

[Jokainen komponentti](https://mui.com/material-ui/all-components/ "https://mui.com/material-ui/all-components/") sisältää oman dokumentaation siitä, miten komponenttia tulee käyttää ja mitä ominaisuuksia niillä on. Alla esiteltynä Button-komponentin käyttö yksinkertaisilla tyylivalinnoilla:

```tsx
<Button
    variant="contained"
    size="large"
    onClick={() => { alert("Painettu!"); }}
>Paina tästä</Button>
```