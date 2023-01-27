export class Rsa {

    public static generatePrimeNumber(min: number, max: number): number {
        while (true) {
            let g = Rsa.generateRandomNumber(min, max);
            if (Rsa.isPrime(g, 100)) {
                return g
            }
        }
    }
    public static isPrime(n: number, k = 8) {
        if (n <= 1 || n == 4) return false;
        if (n <= 3) return true;

        let d = n - 1;
        while (d % 2 == 0) {
            d /= 2;
        }

        let probability: number | boolean = 0;
        for (let i = 0; i < k; i++) {
            probability = Rsa.millerRabin(d, n);
            if (!probability) {
                return false;
            }
        }

        return true;
    }

    public static generateRandomNumber(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    public static millerRabin(d: number, n: number): number | boolean {
        // random number in [2..n-2]
        let a = 2 + Math.floor(Math.random() * (n - 2)) % (n - 4);

        let x = Rsa.powMod(a, d, n)

        if (x == 1 || x == n - 1) {
            return Math.pow(4, -a);
        }

        while (d != n - 1) {
            x = (x * x) % n;
            d *= 2;

            if (x == 1) {
                return false;
            }

            if (x == n - 1) {
                return true;
            }

        }

        return false;
    }

    public static powMod(x: number, y: number, p: number) {
        let res = 1;

        x = x % p;
        while (y > 0) {
            if (y & 1) {
                res = (res * x) % p;
            }

            y = y >> 1; // y = y/2
            x = (x * x) % p;
        }

        return res;
    }

    public static gcd(a: number, b: number): number {
        while (b) {
            [a, b] = [b, a % b];
        }

        return a;
    }

    public static inverseElement(a: number, n: number) {
        a = (a % n + n) % n;

        if (!a || n < 2) {
            throw 'Incorrect input';
        }

        let b = n;
        let s: { a: number, b: number }[] = []

        while (b) {
            [a, b] = [b, a % b];

            s.push({a, b})
        }

        if (a !== 1) {
            throw 'Incorrect input';
        }

        let [x, y] = [1, 0];

        for (let i = s.length - 2; i >= 0; --i) {
            [x, y] = [y, x - y * Math.floor(s[i].a / s[i].b)];
        }

        return (y % n + n) % n;
    }

}

export function log(message: string, value: any):void {
    console.log(`----- ${message} -----`);
    console.log(value);
    console.log('\n');
}

export function testMillerRabin() {
    log('is prime 73 ', Rsa.isPrime(73));
    log('is prime 1963', Rsa.isPrime(1963));
}

export function testRsa() {
    const p = Rsa.generatePrimeNumber(99, 9_999);
    const q = Rsa.generatePrimeNumber(99, 9_999);
    log('keys: ', {p, q})

    const phi = (p - 1) * (q - 1);

    let e;
    for(e = 2; e <= phi - 1; e++){
        if(Rsa.gcd(e, phi) == 1){
            break;
        }
    }
    log('e:', e);

    const n = p * q;
    const privateKey = Rsa.inverseElement(e, phi);
    log('privateKey', privateKey);

    const msg = 2023;

    // encrypt
    const encryptedMsg = Rsa.powMod(msg, e, n);
    log(`The encryption of: ${msg}`, encryptedMsg);

    // decrypt
    const decryptedMsg = Rsa.powMod(encryptedMsg, privateKey, n);
    log(`The decryption of: ${encryptedMsg}`, decryptedMsg);
}

testMillerRabin();
testRsa();




