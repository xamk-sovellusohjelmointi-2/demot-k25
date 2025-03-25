# Demo 8: Käyttäjähallinta

Demossa 8 jatketaan aiemmista demoista tuttua ostoslistaa ja tällä kertaa mukaan otetaan käyttäjän autentikointi. Autentikointi tarkoittaa käyttäjän henkilöllisyyden todentamista – eli varmistamista, että käyttäjä todella on se, joka väittää olevansa. Autorisointi puolestaan määrittelee, mitä toimintoja todennettu käyttäjä saa suorittaa.

Autentikointia ja autorisointia voisi verrata konserttitapahtumaan osallistumiseen. Näytät tapahtumapaikan ovella järjestyksenvalvojalle pääsylippusi (käyttäjän autentikointi) ja saat hyväksyttyä pääsylippua vastaan rannekkeen (autorisointi), jonka avulla voit kulkea tapahtumapaikalle ja ulos sieltä vapaasti. Kulkulupa on voimassa sen ajan, mille olet hankkinut pääsylipun. Samalla tavalla autorisointi voidaan myöntää rajatuksi ajaksi esimerkiksi sessioon perustuen.

Autorisointia voidaan myös ajatella pidemmälle. Tapahtumapaikalla voi olla eri alueita, kuten VIP-alue, backstage, normaali tapahtuma-alue. Rannekkeesi (autorisointi) tyyppi kertoo, minne olet oikeutettu menemään (palvelimen eri reitit). Henkilökuntaan kuuluvalla (admin) voi olla oikeudet kaikkialle.

Edellisessä demossa 7 käytiin autorisointia tarkemmin, eli mihin käyttäjällä on pääsy. Tässä demossa keskitytään enemmän siihen, että kuka pääsee ja minne. Autentikoinnilla varmistetaan käyttäjän oikeudet ja niiden laajuus ja autorisoinnilla annetaan varsinainen avain (JWT token) rajoitettuihin resursseihin.

Demossa 8 ostoslistanäkymä on autorisoinnilla rajoitettu näkymä, jonne vain kirjautuneet käyttäjät pääsevät. Sovelluksessa on erikseen kirjautumisnäkymä, jolle ei ole autorisointia, eli sinne kenellä tahansa on pääsy. Käyttäjätunnuksilla kirjautumisen jälkeen (autentikointi), käyttäjällä on oikeus päästä ostoslistan näkymään (autorisointi).

## Sisällys

