### Tuonti ja Määrittelyt

```typescript
import { readFile, writeFile } from 'fs/promises';
import path from 'path';
```
- **import { readFile, writeFile } from 'fs/promises';**: Tuodaan `readFile` ja `writeFile` funktiot `fs/promises`-moduulista, jotka mahdollistavat tiedostojen lukemisen ja kirjoittamisen lupauksilla.
- **import path from 'path';**: Tuodaan `path`-moduuli, joka tarjoaa apuvälineitä tiedostopolkujen käsittelyyn.

```typescript
export interface Ostos {
    id: number;
    tuote: string;
    poimittu: boolean;
}
```
- **export interface Ostos**: Määritellään `Ostos`-rajapinta, joka kuvaa ostoksen rakenteen. Se sisältää kolme kenttää: `id` (numero), `tuote` (merkkijono) ja `poimittu` (boolean).

### Ostoslista-luokka

```typescript
class Ostoslista {
    private ostokset: Ostos[] = [];
    private tiedosto: string[] = [__dirname, "ostokset.json"];
```
- **class Ostoslista**: Määritellään `Ostoslista`-luokka.
- **private ostokset: Ostos[] = [];**: Luodaan yksityinen `ostokset`-taulukko, joka sisältää `Ostos`-tyyppisiä olioita.
- **private tiedosto: string[] = [__dirname, "ostokset.json"];**: Määritellään yksityinen `tiedosto`-taulukko, joka sisältää tiedoston polun osat.

### Konstruktori

```typescript
    constructor() {
        readFile(path.resolve(...this.tiedosto), "utf8")
            .then((data: string) => {
                this.ostokset = JSON.parse(data);
            })
            .catch((e: any) => {
                throw new Error(e);
            });
    }
```
- **constructor()**: Luokan konstruktori, joka suoritetaan luokan ilmentämisen yhteydessä.
- **readFile(path.resolve(...this.tiedosto), "utf8")**: Luetaan tiedosto `ostokset.json` ja palautetaan sen sisältö merkkijonona.
- **.then((data: string) => { this.ostokset = JSON.parse(data); })**: Parsitaan tiedoston sisältö JSON-muodosta ja tallennetaan se `ostokset`-taulukkoon.
- **.catch((e: any) => { throw new Error(e); })**: Käsitellään mahdolliset virheet ja heitetään uusi virhe.

### haeKaikki

```typescript
    public haeKaikki = (): Ostos[] => {
        try {
            return this.ostokset;
        } catch (e: any) {
            throw new Error(e);
        }
    }
```
- **public haeKaikki = (): Ostos[] => { ... }**: Julkinen metodi, joka palauttaa kaikki ostokset.
- **return this.ostokset;**: Palautetaan `ostokset`-taulukko.
- **catch (e: any) => { throw new Error(e); }**: Käsitellään mahdolliset virheet ja heitetään uusi virhe.

### haeYksi

```typescript
    public haeYksi = (id: number): Ostos | undefined => {
        try {
            return this.ostokset.find((ostos: Ostos) => ostos.id === id);
        } catch (e: any) {
            throw new Error(e);
        }
    }
```
- **public haeYksi = (id: number): Ostos | undefined => { ... }**: Julkinen metodi, joka palauttaa yhden ostoksen ID:n perusteella.
- **return this.ostokset.find((ostos: Ostos) => ostos.id === id);**: Etsitään ja palautetaan ostos, jonka `id` vastaa annettua ID:tä.
- **catch (e: any) => { throw new Error(e); }**: Käsitellään mahdolliset virheet ja heitetään uusi virhe.

### lisaa

```typescript
    public lisaa = async (uusiOstos: Ostos): Promise<void> => {
        try {
            this.ostokset = [
                ...this.ostokset,
                {
                    id: this.ostokset.sort((a: Ostos, b: Ostos) => a.id - b.id)[this.ostokset.length - 1].id + 1,
                    tuote: uusiOstos.tuote,
                    poimittu: uusiOstos.poimittu
                }
            ];
            await this.tallenna();
        } catch (e: any) {
            throw new Error(e);
        }
    }
```
- **public lisaa = async (uusiOstos: Ostos): Promise<void> => { ... }**: Julkinen asynkroninen metodi, joka lisää uuden ostoksen.
- **this.ostokset = [ ...this.ostokset, { ... } ];**: Lisätään uusi ostos `ostokset`-taulukkoon.
- **id: this.ostokset.sort((a: Ostos, b: Ostos) => a.id - b.id)[this.ostokset.length - 1].id + 1**: Määritetään uuden ostoksen ID suurimman olemassa olevan ID:n perusteella.
- **await this.tallenna();**: Tallennetaan muutokset tiedostoon.
- **catch (e: any) => { throw new Error(e); }**: Käsitellään mahdolliset virheet ja heitetään uusi virhe.

### muokkaa

```typescript
    public muokkaa = async (muokattuOstos: Ostos, id: number): Promise<void> => {
        try {
            this.ostokset = this.ostokset.filter((ostos: Ostos) => ostos.id !== id);
            this.ostokset = [
                ...this.ostokset,
                {
                    id: id,
                    tuote: muokattuOstos.tuote,
                    poimittu: muokattuOstos.poimittu
                }
            ].sort((a: Ostos, b: Ostos) => a.id - b.id);
            await this.tallenna();
        } catch (e: any) {
            throw new Error(e);
        }
    }
```
- **public muokkaa = async (muokattuOstos: Ostos, id: number): Promise<void> => { ... }**: Julkinen asynkroninen metodi, joka muokkaa olemassa olevaa ostosta.
- **this.ostokset = this.ostokset.filter((ostos: Ostos) => ostos.id !== id);**: Poistetaan vanha ostos `ostokset`-taulukosta.
- **this.ostokset = [ ...this.ostokset, { ... } ].sort((a: Ostos, b: Ostos) => a.id - b.id);**: Lisätään muokattu ostos ja järjestetään taulukko ID:n mukaan.
- **await this.tallenna();**: Tallennetaan muutokset tiedostoon.
- **catch (e: any) => { throw new Error(e); }**: Käsitellään mahdolliset virheet ja heitetään uusi virhe.

### poista

```typescript
    public poista = async (id: number): Promise<void> => {
        try {
            this.ostokset = this.ostokset.filter((ostos: Ostos) => ostos.id !== id);
            await this.tallenna();
        } catch (e: any) {
            throw new Error(e);
        }
    }
```
- **public poista = async (id: number): Promise<void> => { ... }**: Julkinen asynkroninen metodi, joka poistaa ostoksen ID:n perusteella.
- **this.ostokset = this.ostokset.filter((ostos: Ostos) => ostos.id !== id);**: Poistetaan ostos `ostokset`-taulukosta.
- **await this.tallenna();**: Tallennetaan muutokset tiedostoon.
- **catch (e: any) => { throw new Error(e); }**: Käsitellään mahdolliset virheet ja heitetään uusi virhe.

### tallenna

```typescript
    private tallenna = async (): Promise<void> => {
        try {
            await writeFile(path.resolve(...this.tiedosto), JSON.stringify(this.ostokset, null, 2), "utf8");
        } catch (e: any) {
            throw new Error();
        }
    }
```
- **private tallenna = async (): Promise<void> => { ... }**: Yksityinen asynkroninen metodi, joka tallentaa `ostokset`-taulukon tiedostoon.
- **await writeFile(path.resolve(...this.tiedosto), JSON.stringify(this.ostokset, null, 2), "utf8");**: Kirjoitetaan `ostokset`-taulukko JSON-muodossa tiedostoon `ostokset.json`.
- **catch (e: any) => { throw new Error(e); }**: Käsitellään mahdolliset virheet ja heitetään uusi virhe.