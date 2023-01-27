export type Alphabet = {[key: string]: string};
export class PolybiusSquare {
    private dictionaryAlphabets:  Alphabet = {
        'а':'11', 'б':'12', 'в':'13', 'г':'14', 'д':'15', 'е':'16',
        'є':'21', 'ж':'22', 'з':'23', 'и':'24', 'і':'25', 'й':'26',
        'к':'31', 'л':'32', 'м':'33', 'н':'34', 'о':'35', 'п':'36',
        'р':'41', 'с':'42', 'т':'43', 'у':'44', 'ф':'45', 'х':'46',
        'ц':'51', 'ч':'52', 'ш':'53', 'ь':'54', 'ю':'55', 'я':'56'
    };

    public encrypt(text: string): string {
        let horCoordinates = [] as Array<string>;
        let verCoordinates = [] as Array<string>;

        text.split('').forEach(char => {
            const coord = this.dictionaryAlphabets[char];
            horCoordinates.push(coord.split('')[0]);
            verCoordinates.push(coord.split('')[1]);
        });
        const combined = horCoordinates.concat(verCoordinates);

        const coordinates = [] as Array<string>;
        for (let i = 0; i < text.length; i++) {
            coordinates.push(combined[i * 2] + combined[(i * 2) + 1]);
        }

        const flippedDictionary = PolybiusSquare.objectFlip(this.dictionaryAlphabets);
        log('Encrypted coordinates', coordinates);

        return coordinates.map((coord) => {
            return flippedDictionary[coord];
        }).join('');
    }

    public decrypt(text: string): string {
        let horCoordinates = [] as Array<string>;
        let verCoordinates = [] as Array<string>;

        const combined = [] as Array<string>;
        text.split('').forEach(char => {
            const coord = this.dictionaryAlphabets[char];
            combined.push(coord.split('')[0]);
            combined.push(coord.split('')[1]);
        });

        const coordinates = [] as Array<string>;
        for (let i = 0; i < text.length; i++) {
            coordinates.push(combined[i] + combined[(i + text.length)]);
        }

        const flippedDictionary = PolybiusSquare.objectFlip(this.dictionaryAlphabets);
        log('Decrypted coordinates', coordinates);

        return coordinates.map((coord) => {
            return flippedDictionary[coord];
        }).join('');
    }

    static objectFlip(obj: Alphabet): Alphabet {
        const res = {} as Alphabet;
        Object.keys(obj).forEach((key:string) => {
            res[obj[key]] = key;
        });
        return res;
    }
}

export function log(message: string, value: any): void {
    console.log(`----- ${message} -----`);
    console.log(value);
    console.log('\n');
}

const polybiusSquare = new PolybiusSquare();
const text = 'заміна';

const encrypted = polybiusSquare.encrypt(text);
log(`encrypted ${text}`, encrypted);

const decrypted = polybiusSquare.decrypt(encrypted);
log(`decrypted ${encrypted}`, decrypted);
