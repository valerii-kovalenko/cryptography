export class DiffieHellman {
    p: number;
    q: number;

    constructor(p: number, q: number) {
        this.p = p;
        this.q = q;
        log('Public numbers', {p, q});
    }

    public run(a: number, b: number) {
        log('Secret numbers:', {a, b});
        // Alice's round
        const A = DiffieHellman.powMod(this.q, a, this.p);
        log('Alice part: ', {A});

        // Bob's round
        const B = DiffieHellman.powMod(this.q, b, this.p);
        log('Bob part: ', {B});

        const BobsKey = DiffieHellman.powMod(A, b, this.p);
        const AliceKey = DiffieHellman.powMod(B, a, this.p);

        log('keys:', {AliceKey, BobsKey})
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
}

export class ElGamal {
    public static run() {
        const p = ElGamal.generatePrimeNumber(9, 100)
        const g = ElGamal.generateG(p);
        const x = ElGamal.generateRandomNumber(2, p - 1); // secret key
        const y = ElGamal.powMod(g, x, p);

        log('public keys: ', {p, g, y});
        log('private key: ', {x});

        // encrypt
        const mIn = 5;
        const k = ElGamal.generateRandomNumber(2, p - 1); // session key
        log('session key: ', {k});

        const a = ElGamal.powMod(g, k, p);
        const b = (Math.pow(y, k) * mIn) % p;
        log('cipher: ', {a, b});

        // decrypt
        const mOut = b * Math.pow(a, p - 1 - x) % p;
        log('messages:', {mIn, mOut});
    }

    public static generatePrimeNumber(min: number, max: number): number {
        while (true) {
            let g = ElGamal.generateRandomNumber(min, max);
            if (ElGamal.isPrime(g, 100)) {
                return g;
            }
        }
    }

    public static isPrimitiveRoot(g: number, p: number) {
        for (let i = 1; i < p - 1; i++) {
            if (ElGamal.powMod(g, i, p) === 1) {
                return false;
            }
        }

        return true;
    }

    public static generateG(p: number): number {
        while (true) {
            let g = ElGamal.generateRandomNumber(2, p);
            if (ElGamal.isPrimitiveRoot(g, p)) {
                return g
            }
        }
    }

    public static isPrime(n: number, k: number) {
        if (n <= 1 || n == 4) return false;
        if (n <= 3) return true;

        // Find r such that n = 2^d * r + 1 for some r >= 1
        let d = n - 1;
        while (d % 2 == 0) {
            d /= 2;
        }

        let probability: number | boolean = 0;
        for (let i = 0; i < k; i++) {
            probability = ElGamal.millerRabin(d, n);
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

        let x = ElGamal.powMod(a, d, n)

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
}

export function log(message: string, value: any): void {
    console.log(`----- ${message} -----`);
    console.log(value);
    console.log('\n');
}


const diffieHellman = new DiffieHellman(23, 5);
diffieHellman.run(6, 15);

ElGamal.run();


