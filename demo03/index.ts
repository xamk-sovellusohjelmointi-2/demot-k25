import express from 'express';
import path from 'path';
import apiOstoksetRouter from './routes/apiOstokset';

const app : express.Application = express();

const portti : number = Number(process.env.PORT) || 3003;

app.use(express.static(path.resolve(__dirname, "public")));

app.use("/api/ostokset", apiOstoksetRouter);

app.listen(portti, () : void => {

    console.log(`Palvelin käynnistyi osoitteeseen: http://localhost:${portti}`);    

});