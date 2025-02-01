import express from 'express';
import path from 'path';

const app : express.Application = express();

const portti : number = Number(process.env.PORT) || 3001;

app.use(express.static(path.resolve(__dirname, "public")));


/*
Alla olevaa koodia (juureen tehdyn get-pyynnön käsittelijä) ei tarvita, koska Express-sovelluksen sisääntulopiste tai "entry point" on määritelty public-kansiossa olevalla index.html -tiedostolla.

Index-tiedosto on varattu Express-sovelluksissa automaattisena vastauksena silloin, kun sovellus avataan juuritasolla. Jos staattisten tiedostojen kansiota ja index-tiedostoa ei käytä, pitää sovelluksen juureen tehtävän pyynnön käsittelijä silloin määritellä erikseen.

app.get("/", (req : express.Request, res : express.Response) : void => {
    res.send("<h1>Heippa maailma, Henri kävi täällä!</h1>");
});
*/

app.get("/heippa", (req: express.Request, res : express.Response) : void => {

    let nimi : string = "";

    if (typeof req.query.nimi === "string") {
        nimi = req.query.nimi;
    } else {
        nimi = "tuntematon";
    }

    res.send(`<h1>Heippa, ${nimi}!</h1>`);

});

app.get("/moikka", (req: express.Request, res : express.Response) : void => {

    res.send("<h1>Moikka!</h1>");

});

app.listen(portti, () => {

    console.log(`Palvelin käynnistyi osoitteeseen: http://localhost:${portti}`);    

});