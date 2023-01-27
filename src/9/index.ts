export class Sha1 {

    public static encrypt(s: string) {
        return Sha1.hexEncode(Sha1.rstrSha1(Sha1.utf8Encode(s)));
    }

    public static rstrSha1(s: string) {
        return Sha1.binb2rstr(Sha1.binbSha1(Sha1.rstr2binb(s), s.length * 8));
    }


    public static binbSha1(x: number[], len: number) {
        /* append padding */
        x[len >> 5] |= 0x80 << (24 - len % 32);
        x[((len + 64 >> 9) << 4) + 15] = len;

        const w = Array(80);
        let a = 1732584193;
        let b = -271733879;
        let c = -1732584194;
        let d = 271733878;
        let e = -1009589776;

        for (let i = 0; i < x.length; i += 16) {
            let old_a = a;
            let old_b = b;
            let old_c = c;
            let old_d = d;
            let old_e = e;

            for (let j = 0; j < 80; j++) {
                if (j < 16) w[j] = x[i + j];
                else w[j] = Sha1.bitwiseRotate(w[j - 3] ^ w[j - 8] ^ w[j - 14] ^ w[j - 16], 1);

                const t = Sha1.safeAdd(Sha1.safeAdd(Sha1.bitwiseRotate(a, 5), Sha1.ft(j, b, c, d)), Sha1.safeAdd(Sha1.safeAdd(e, w[j]), Sha1.kt(j)));
                e = d;
                d = c;
                c = Sha1.bitwiseRotate(b, 30);
                b = a;
                a = t;
            }

            a = Sha1.safeAdd(a, old_a);
            b = Sha1.safeAdd(b, old_b);
            c = Sha1.safeAdd(c, old_c);
            d = Sha1.safeAdd(d, old_d);
            e = Sha1.safeAdd(e, old_e);
        }

        return [a, b, c, d, e];
    }

    public static ft(t: number, b: number, c: number, d: number) {
        if (t < 20) return (b & c) | ((~b) & d);
        if (t < 40) return b ^ c ^ d;
        if (t < 60) return (b & c) | (b & d) | (c & d);

        return b ^ c ^ d;
    }

    public static kt(t: number) {
        return (t < 20) ? 1518500249 : (t < 40) ? 1859775393 :
            (t < 60) ? -1894007588 : -899497514;
    }

    public static safeAdd(x: number, y: number) {
        const lsw = (x & 0xFFFF) + (y & 0xFFFF);
        const msw = (x >> 16) + (y >> 16) + (lsw >> 16);
        return (msw << 16) | (lsw & 0xFFFF);
    }

    public static bitwiseRotate(num: number, cnt: number) {
        return (num << cnt) | (num >>> (32 - cnt));
    }

    public static hexEncode(input: string) {
        const hex_tab = '0123456789abcdef';
        let output = '';

        for (let i = 0; i < input.length; i++) {
            let x = input.charCodeAt(i);
            output += hex_tab.charAt((x >>> 4) & 0x0F) + hex_tab.charAt(x & 0x0F);
        }

        return output;
    }


    /*
     * Encode a string as utf-8.
     */
    public static utf8Encode(input: string) {
        let output = '';
        let i = -1;
        let x, y;

        while (++i < input.length) {
            /* Decode utf-16 surrogate pairs */
            x = input.charCodeAt(i);
            y = i + 1 < input.length ? input.charCodeAt(i + 1) : 0;
            if (0xD800 <= x && x <= 0xDBFF && 0xDC00 <= y && y <= 0xDFFF) {
                x = 0x10000 + ((x & 0x03FF) << 10) + (y & 0x03FF);
                i++;
            }

            /* Encode output as utf-8 */
            if (x <= 0x7F)
                output += String.fromCharCode(x);
            else if (x <= 0x7FF)
                output += String.fromCharCode(0xC0 | ((x >>> 6) & 0x1F),
                    0x80 | (x & 0x3F));
            else if (x <= 0xFFFF)
                output += String.fromCharCode(0xE0 | ((x >>> 12) & 0x0F),
                    0x80 | ((x >>> 6) & 0x3F),
                    0x80 | (x & 0x3F));
            else if (x <= 0x1FFFFF)
                output += String.fromCharCode(0xF0 | ((x >>> 18) & 0x07),
                    0x80 | ((x >>> 12) & 0x3F),
                    0x80 | ((x >>> 6) & 0x3F),
                    0x80 | (x & 0x3F));
        }

        return output;
    }

    public static binb2rstr(input: number[]) {
        let output = '';
        for (let i = 0; i < input.length * 32; i += 8)
            output += String.fromCharCode((input[i >> 5] >>> (24 - i % 32)) & 0xFF);

        return output;
    }

    public static rstr2binb(input: string) {
        var output = Array(input.length >> 2);
        for (let i = 0; i < output.length; i++)
            output[i] = 0;
        for (let i = 0; i < input.length * 8; i += 8)
            output[i >> 5] |= (input.charCodeAt(i / 8) & 0xFF) << (24 - i % 32);
        return output;
    }

}

export function log(message: string, value: any): void {
    console.log(`----- ${message} -----`);
    console.log(value);
    console.log('\n');
}

log('Encrypt \'public text\'', Sha1.encrypt('public text'));
log('Encrypt \'11235813\'', Sha1.encrypt('11235813'));
log('Encrypt \'Happy New 2023!\'', Sha1.encrypt('Happy New 2023!'));

