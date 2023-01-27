export class ModularArithmetic {
    public static gcd(a: number, b: number): number {
        while (b) {
            [a, b] = [b, a % b];
        }

        return a;
    }

    public static gcdex (a: number, b: number): any {
        if (a == 0) {
            return {d: b, x: 0, y: 1}
        }
        const res = ModularArithmetic.gcdex(b%a, a);
        let d = res.d;
        let x1 = res.x;
        let y1 = res.y;

        let x = y1 - Math.floor(b/a) * x1
        let y = x1;

        return {d,x,y}
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

    public static inverse_element_2(a: number, n: number) {
        if (ModularArithmetic.gcd(a, n) != 1) {
            throw 'Incorrect input';
        }

        for (let x = 1; x < n; x++) {
            if (((a % n) * (x % n)) % n == 1) {
                return x;
            }
        }
    }

    public static phi(m: number) {
        let result = m;
        for (let i = 2; i * i <= m; ++i) {
            if (m % i == 0) {
                while (m % i == 0) {
                    m /= i;
                }
                result -= result / i;
            }
        }

        if (m > 1) {
            result -= result / m;
        }

        return result;
    }

}

export function log(message: string, value: any):void {
    console.log(`----- ${message} -----`);
    console.log(value);
    console.log('\n');
}

log('gcdex a: 612, b: 342', ModularArithmetic.gcdex(612, 342));
log('inverse_element a: 5, b: 18', ModularArithmetic.inverseElement(5, 18));
log('m: 18', ModularArithmetic.phi( 18));
log('inverse_element2 a: 5, b: 18', ModularArithmetic.inverse_element_2(5, 18));
