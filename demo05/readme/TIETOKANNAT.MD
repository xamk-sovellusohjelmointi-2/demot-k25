# Tietopaketti tietokannoista

### [<-- Takaisin](../README.md)

## Mikä on tietokanta?

Tietokannalla tarkoitetaan järjestelmällistä joukkoa dataa, jossa tietokanta voi sisältää monenlaista informaatiota, kuten tekstiä, lukuja, päivämääriä, kuvia, videoita ym. Ohjelmoinnissa tietokannasta puhuttaessa tarkoitetaan yleensä järjestelmää, johon tietoja tallennetaan. Yksittäinen tekstitiedosto voi olla tietokanta, mutta useimmiten tietokannalla tarkoitetaan jonkinlaisella hallintaohjelmistolla ylläpidettyä järjestelmää, jossa voi olla useita tietokantoja.

Tietokannassa tieto on järjestetty tauluihin, jotka kuvaavat jonkinlaista tietoa, kuten esim. käyttäjää, tilausta, teknistä tapahtumaa jne. Tietokannat tekevät tiedon tallentamisesta ja hallinnasta helppoa, tehokasta ja skaalautuvaa. Tietokanta ja erityisesti tietokannan taulut määrittävät säännöt, jotka ohjaavat hallittavan datan rakennetta.

Tietokantoja käytetään kaikkialla ja siksi niiden osaaminen on todella tärkeä osa sovelluskehittäjän taitoja.

## Tietokannan osat

Tietokanta koostuu muutamista tärkeistä komponenteista, joilla dataa hallitaan.

Tietokanta sisältää **dataa**, josta tietokannan esittämä informaatio koostuu. Yksittäinen datapiste, kuten teksti, luku tai kuva ei itsessään vielä tässä kontekstissa ole informaatiota, vaan datalla tarkoitetaan jotain yksittäistä tiedon osaa tietokannassa. Tietokannat kuvaavat kuitenkin informaatiota tai tietoa jostakin tietystä käsitteestä, kuten käyttäjästä, tilauksesta, pankkitilistä, osoitelistasta jne. jossa yksittäinen tiedon osa, kuten tilauksen tekijä, on yksittäinen datapiste.

Tietokannan muodostamiseen käytetään **skeemaa** (engl. schema), joka kuvaa tietokannan rakennetta. Skeemassa määritetään se, mitä **tauluja** (tables) tietokannassa on, miten ne rakentuvat ja mitä **tietoa** (data) ne sisältävät. Taulut rakentuvat **sarakkeista** (columns), jotka kuvaavat taulun yksittäisen tietueen tai rivin eri tietoja (data). Datalla on aina joku **tyyppi** (data type).

![](./img/skeema.jpg)

Tietokantoja voidaan hallita **hakulauseiden** (queries) avulla ohjelmallisesti joko kokonaisilla työpöytäsovelluksilla tai nettikäyttöliittymillä, komentokehotteella kirjoitetuilla komennoilla tai sitten suoraan lähettämällä tietokannan hakulauseita tietokantaan (esim. sovelluksen backend). Esimerkkejä tietokantojen hallintajärjestelmistä, joita käytetään työpöytäsovelluksen kautta on MySQL, MongoDB, Oracle, Microsoft SQL Server, PostgreSQL, Maria DB jne.

## Kaksi yleistä tietokantatyyppiä

Tietokantaratkaisuja on monenlaisia ja tietokantoja on toteutettu eri tekniikoilla. Kuitenkin kaksi todella yleistä tietokantatyyppiä, joita aloittelevat sovelluskehittäjät yleensä kohtaavat ovat relaatiotietokannat ja NoSQL-tietokannat.

**Relaatiotietokannat** (relational databases) ovat yleensä se ensimmäinen esimerkki tietokannasta, joka uusille kehittäjille tulee tutuksi. Tälläkin opintojaksolla toteutetaan relaatiotietokantoja SQLite:llä. Relaatiotietokanta koostuu juuri tauluista, joissa on rivejä ja kolumneja. Rivit kuvaavat yksittäisiä tietueita (entry), jotka sisältävät eri tietoja, jotka määritellään sarakkeissa.

NoSQL-tietokannat ovat toinen hyvin yleinen tietokantamalli, jota käytetään erityisesti reaaliaikaisissa sovelluksissa, kuten robottien ja IoT-laitteiden ohjauksessa. NoSQL-tietokannoilla hallitaan dataa samalla tavalla kuin relaatiotietokannassa, mutta tiedon esitystapoja on useita erilaisia. Tieto voi pohjautua dokumentteihin, avain-arvo-pareihin, verkkoihin jne. Dokumenttipohjainen NoSQL-tietokanta on hyvin yleinen. Siinä taulujen sijasta tieto tallennetaan ja arkistoidaan tekstidokumenteissa, joiden formaatti on yleensä JSON tai XML.

## Lisää relaatiotietokannan käsitteitä

#### PRIMARY KEY

Primary Key on tietokannan taulussa oleva sarake, joka erittelee tietokannan tietueet toisistaan uniikilla arvolla, joka ei voi olla tyhjä. Primary Key voi olla tyypiltään UUID, kokonaisluku (INT) tai merkkijono (STRING). Yleensä haettaessa jotain tiettyä tietoa taulusta SQL-lauseella, tehdään haku esimerikiksi Primary Key -sarakkeeseen perustuen. Jos taas haetaan jotain tiettyä arvoa vastaavia tietueita taulusta, niin voidaan käyttää jonkin muun sarakkeen tietoa hakulauseessa.

#### FOREIGN KEY

Foreign Key -arvolla viitataan jonkin toisen taulun Primary Key -arvoon. Näin voidaan yhdistää taulujen tietoja toisiinsa. Otetaan esimerkiksi tilanne jossa yrityksen tietojärjestelmässä on tietokannassa taulu `työntekijät`, jossa yksi sarakkeista on `osasto_id` ja on toinen taulu `osastot`, jossa jokaisella osastolla on oma `id`. Työntekijän osasto voidaan merkitä osaksi tietoja `ostasto_id`-sarakkeessa, johon tehdään viittaus `osastot`-taulun vastaavaan tietueeseen osaston `id`-sarakkeen perusteella.

![](./img/PK_FK_esimerkki.jpg)


### [<-- Takaisin](../README.md)