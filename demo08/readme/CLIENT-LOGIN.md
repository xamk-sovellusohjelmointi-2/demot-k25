# Kirjautuminen asiakassovelluksessa ja pyynnön lähettäminen palvelimelle

### [<-- Takaisin](../README.md)

Kun palvelin on konfiguroitu ottamaan vastaan kirjautumispyyntöjä omaan rajapintaansa, voidaan katsoa, miten kirjautuminen toteutetaan asiakassovelluksen päässä. Tässä ei toiminnallisesti tapahdu mitään kovinkaan erikoista verrattuna sovelluksen aiempiin pyyntöihin.

Suurin ero edelliseen demoon on se, että nyt ostoslistan näkymälle ja kirjautumiselle on luotu omat komponentit, joihin pääsyä hallitaan palvelimelta saatavalla tokenilla. Token oli se avain, joka määrittää, oliko käyttäjällä pääsy johonkin tiettyyn resurssiin.

## 1. App-komponentti toimii sovelluksen oletusnäkymänä, joka hallitsee reiteillä tulostettavaa sisältöä.

Asiakassovellus on muuttunut jonkin verran edellisestä demosta. [App-komponentti](../client/src/App.tsx) ei enää sisällä ostoslistan näkymää ja tilalle on tuotu [react-router-dom](https://reactrouter.com/start/data/installation) -paketin reititys.

```tsx
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
```

Tämän lisäksi sovellus käyttää tilamuuttujaa `token` hallitsemaan käyttäjän pääsyä eri reitteihin. Sovelluksen reitit määritellään `<Routes>...</Routes>` -tagien välille ja yksittäinen reitti `<Route />`-tagilla. Reitti sisältää tiedon polusta ja elementistä, eli mikä komponentti polkua hakemalla renderöidään. 

1. Huomioi, miten `<Ostoslista />`-komponenttiin on määritetty ominaisuus (prop) `token`, joka ottaa vastaan yllä määritetyn `token`-tilamuuttujan arvon, joka on merkkijono, joka haetaan selaimen paikallisesta muistista. Tästä kohta lisää, mutta ostoslista siis tarvitsee oikean tokenin voidakseen tulostua käyttäjälle.
2. Huomioi myös, miten `<Login />`-komponenttiin on määritetty samalla tavalla oma props, joka asettaa `token`-tilamuuttujan.

Yllä ajatus on siis siinä, että ostoslistanäkymään ei päästä, ellei tokenia ole ensin määritetty. Token määritetään osana käyttäjän onnistunutta kirjautumista `/login`-reitissä (`http://localhost:3000/login`).

## 2. Ostoslistanäkymää hallitaan tokenilla

Ostoslistan näkymä sisältää aiemmista demoista tutut rakenteet ja metodit. Täällä myös tehdään varsinaiset API-kutsut palvelimelle ostosten lisäämiseen, poistamiseen ja hakemiseen.

Autorisoinnin tokenia käytetään samoin kuin aiemmassa demossa, mutta nyt token saadaan reittejä hallitsevalta ylemmältä tasolta, eli App-komponentilta propsina. Tällöin Ostoslista-komponenttiin on päivitettävä TypeScript-tyypit vastaamaan propsien vastaanottamista. Koska React-komponentit ovat toiminnaltaan funktioita, props otetaan vastaan funktion parametrina.

Tällä tavalla komponentille voidaan määrittää ominaisuuksia, jotka on asetettava komponenttia kutsuttaessa jossain muualla. Olemme määrittäneet komponentille uuden ominaisuuden tai propsin nimeltä token, joka vastaanottaa merkkijonon.

##### Tokenin vastaanottaminen propsina

```tsx
interface Props {
  token : string
}

const Ostoslista : React.FC<Props> = (props : Props) : React.ReactElement => {...}
```

Nyt ominaisuutena saatavaa tokenia voidaan hyödyntää pyynnön otsikkotiedoissa autorisoinnin arvona.

```tsx
let asetukset : fetchAsetukset = { 
      method : metodi || "GET",
      headers : {
        'Authorization' : `Bearer ${props.token}`
      }
    };
```

## 3. Kirjautumisen komponentti asettaa tokenin arvon

Aivan kuten ostoslistan komponentissa, myös kirjautumisen komponenttiin Login on määritetty props. Tällä kertaa merkkijonon sijasta propsin tyyppi on eräänlainen tilan asettaja `Dispatch<SetStateAction<string>>`:

```tsx
interface Props {
    setToken : Dispatch<SetStateAction<string>>
}

const Login: React.FC<Props> = (props : Props) : React.ReactElement => {...}
```

Login-komponentti sisältää funktion kirjautumiselle, jota kutsutaan lomakkeesta "Kirjaudu"-painikkeella. Kirjautumisen metodissa käsitellään lomaketietoja samoin, kuin ostoksen lisäämisesä. Ensiksi tarkistetaan, onko käyttäjä oikeasti kirjoittanut jotain kirjautumisnäkymän kenttiin:

```tsx
const kirjaudu = async (e : React.FormEvent) : Promise<void> => {
        
        e.preventDefault();

        if (lomakeRef.current?.kayttajatunnus.value) {

            if (lomakeRef.current?.salasana.value) {...}
        }
}
```

Jos käyttäjätunnus ja salasana on annettu, tehdään seuraavaksi fetch-pyyntö palvelimella kirjautumisen reittiin:

```tsx
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
```

- Metodina käytetään POST
- Lähetettävä sisältö on rakenteeltaan JSON-dataa
- Pyynnön bodysta poimitaan käyttäjän kirjoittamat arvot

Pyynnön tiedot lähtevät palvelimelle `/login` -osoitteeseen, jossa tiedot tarkistetaan:

```tsx
if (req.body.kayttajatunnus === kayttaja?.kayttajatunnus) {

  let hash = crypto.createHash("SHA256").update(req.body.salasana).digest("hex");

  if (hash === kayttaja?.salasana) {

      let token = jwt.sign({}, "ToinenSalausLause_25");

      res.json({ token : token })
```

Käyttäjän lähettämästa salasanasta luodaan hash-arvo, jota verrataan tietokannasta haettuun käyttäjän salasanan hash-arvoon. Jos tiedot täsmäävät, voidaan generoida uusi token pohjautuen avaimeen ToinenSalausLause_25, joka lähetetään json-muotoisena vastauksena takaisin asiakkaalle.

Asiakassovellus odottaa vastausta ja jos yhteyden status oli 200, eli kaikki onnistui, asetetaan asiakassovelluksen `token`-tilamuuttujan arvoksi palvelimelta saatu token, joka tallennetaan selaimen muistiin. Lopuksi navigoidaan takaisin asiakassovelluksen juureen, eli ostoslistanäkymään.

```tsx
if (yhteys.status === 200) {

    let {token} = await yhteys.json();

    props.setToken(token);

    localStorage.setItem("token", token);

    navigate("/");

}
```

## 4. Uudelleenohjaus asiakassovelluksessa

Nyt edellisessä koodinpätkässä esiteltiin uusi `navigate()`-metodi. Tätä voidaan käyttää asiakassovelluksessa uudelleenohjaamaan käyttäjä toiseen komponenttiin esimerkiksi näin osana jonkin funktion suorittamista. Jos kirjautuminen on onnistunut ja käyttäjä on saanut hyväksyttävän tokenin palvelimelta, silloin käyttäjä varmasti haluaa siirtyä viimein tarkastelemaan ostoslistan sisältöä. Ostoslista oli suojattu tokenilla, eli käyttäjä ei päässyt sinne aiemmin. Tässä voidaan tehdä käyttäjälle palvelus, eli siirtää hänet suoraan seuraavaan näkymään `navigate()`-metodilla.

Navigate otetaan käyttöön react-router-dom -paketista:

```tsx
import { useNavigate, NavigateFunction } from 'react-router-dom';
```

Navigoinnille määritetään oma metodi, joka vain kutsuu `useNavigate()`-hookia.

```tsx
const navigate : NavigateFunction = useNavigate();
```

Nyt, kun käyttäjä halutaan siirtää johonkin toiseen reittiin asiakassovelluksessa, voidaan vain kutsua metodia `navigate()`, jonka parametrina annetaan haluttu reitti:

```tsx
navigate("/");
```

## 5. Muistetaan varmistaa, että React -sovellus on määritetty käyttämään routeria main.tsx -tiedostossa

Toki vielä tärkeänä asiana pitää varmistaa, että koko React Router -ominaisuus on ylipäätänsä otettu käyttöön. Router otetaan käyttöön sovelluksen ylimmällä tasolla, eli jo ennen App-komponentin määrittelyä.

```tsx
import { BrowserRouter } from 'react-router-dom';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
```

BrowseRouter-komponenttia käytetään määrittämään alue, jossa reititystä käytetään React-sovelluksessa. Koska koko sovellus käyttää reititystä, on helpoin ottaa React Router käyttöön main.tsx -tiedostossa, ympäröimällä App-komponentti sen tageilla. Tämä johtaa siihen, että reititystä voi ylipäätänsä käyttää App:ssa:

```tsx
<Routes>
  <Route path="/" element={<Ostoslista token={token}/>}/>
  <Route path="/login" element={<Login setToken={setToken} />}/>
</Routes>
```

## 6. Lopuksi

Tässä siis esiteltiin käyttäjän kirjautuminen ja autentikointi asiakassovelluksen ja palvelimen välillä. Käyttäjä tekee kirjautumistoimenpiteen asiakassovellukseen, josta tiedot lähetetään palvelimelle fetch-pyyntönä oikeaan reittiin. Palvelimella pyynnön bodyssa lähetetyt tiedot otetaan vastaan ja niitä verrataan esimerkiksi tietokannassa oleviin käyttäjätietoihin. Vastauksena hyväksyttyyn kirjautumiseen palvelin lähettää käyttäjälle vastauksessa tokenin, joka tallennetaan selaimen muistiin ja näin jokaisen seuraavan pyynnön yhteydessä token lähetetään automaattisesti, jolloin käyttäjän ei jatkuvasti tarvitse autentikoida itseään suojattuihin palvelimen reitteihin.

Samalla esiteltiin, miten reititys otetaan käyttöön React-sovelluksessa. React Router on erittäin yleinen ja suosittu reititin React-komponenttien välille. Jotta palvelimella suojatut näkymät voidaan tulostaa asiakkaalle, pitää token välittää Ostoslista-komponenttiin ja tämä onnistuu propsien avulla, jotka määritetään osaksi komponentin koodia. Props itsessään on taikasana, jonka sisälle interfacessa määritellään eri ominaisuudet, jotka voidaan nyt nimetä ja määrittää itse. Esimerkiksi tässä demossa käytettiin omaa propsia "token". Propsien välillä välitetään tietoa komponenttien välillä.

### [<-- Takaisin](../README.md)