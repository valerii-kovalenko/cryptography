export type CipherType = 'encrypt' | 'decrypt';
export type BinaryLike = number[] | Uint8Array

export interface CipherOptions {
    type: CipherType;
    key: BinaryLike;
}

export class Helper {
    static readUInt32BE(bytes: BinaryLike, off: number) {
        const res = (bytes[0 + off] << 24) |
            (bytes[1 + off] << 16) |
            (bytes[2 + off] << 8) |
            bytes[3 + off];

        return res >>> 0;
    }

    static writeUInt32BE(bytes: BinaryLike, value: number, off: number) {
        bytes[0 + off] = value >>> 24;
        bytes[1 + off] = (value >>> 16) & 0xff;
        bytes[2 + off] = (value >>> 8) & 0xff;
        bytes[3 + off] = value & 0xff;
    }


    static ip(inL: number, inR: number, out: BinaryLike, off: number) {
        let outL = 0;
        let outR = 0;

        for (let i = 6; i >= 0; i -= 2) {
            for (let j = 0; j <= 24; j += 8) {
                outL <<= 1;
                outL |= (inR >>> (j + i)) & 1;
            }
            for (let j = 0; j <= 24; j += 8) {
                outL <<= 1;
                outL |= (inL >>> (j + i)) & 1;
            }
        }

        for (let i = 6; i >= 0; i -= 2) {
            for (let j = 1; j <= 25; j += 8) {
                outR <<= 1;
                outR |= (inR >>> (j + i)) & 1;
            }
            for (let j = 1; j <= 25; j += 8) {
                outR <<= 1;
                outR |= (inL >>> (j + i)) & 1;
            }
        }

        out[off] = outL >>> 0;
        out[off + 1] = outR >>> 0;
    }

    static rip(inL: number, inR: number, out: BinaryLike, off: number) {
        let outL = 0;
        let outR = 0;

        for (let i = 0; i < 4; i++) {
            for (let j = 24; j >= 0; j -= 8) {
                outL <<= 1;
                outL |= (inR >>> (j + i)) & 1;
                outL <<= 1;
                outL |= (inL >>> (j + i)) & 1;
            }
        }
        for (let i = 4; i < 8; i++) {
            for (let j = 24; j >= 0; j -= 8) {
                outR <<= 1;
                outR |= (inR >>> (j + i)) & 1;
                outR <<= 1;
                outR |= (inL >>> (j + i)) & 1;
            }
        }

        out[off] = outL >>> 0;
        out[off + 1] = outR >>> 0;
    }


    static pc1(inL: number, inR: number, out: BinaryLike, off: number) {
        let outL = 0;
        let outR = 0;

        // 7, 15, 23, 31, 39, 47, 55, 63
        // 6, 14, 22, 30, 39, 47, 55, 63
        // 5, 13, 21, 29, 39, 47, 55, 63
        // 4, 12, 20, 28
        let i = 7
        for (; i >= 5; i--) {
            for (let j = 0; j <= 24; j += 8) {
                outL <<= 1;
                outL |= (inR >> (j + i)) & 1;
            }
            for (let j = 0; j <= 24; j += 8) {
                outL <<= 1;
                outL |= (inL >> (j + i)) & 1;
            }
        }
        for (let j = 0; j <= 24; j += 8) {
            outL <<= 1;
            outL |= (inR >> (j + i)) & 1;
        }

        // 1, 9, 17, 25, 33, 41, 49, 57
        // 2, 10, 18, 26, 34, 42, 50, 58
        // 3, 11, 19, 27, 35, 43, 51, 59
        // 36, 44, 52, 60
        i = 1
        for (; i <= 3; i++) {
            for (let j = 0; j <= 24; j += 8) {
                outR <<= 1;
                outR |= (inR >> (j + i)) & 1;
            }
            for (let j = 0; j <= 24; j += 8) {
                outR <<= 1;
                outR |= (inL >> (j + i)) & 1;
            }
        }
        for (let j = 0; j <= 24; j += 8) {
            outR <<= 1;
            outR |= (inL >> (j + i)) & 1;
        }

        out[off] = outL >>> 0;
        out[off + 1] = outR >>> 0;
    }


    static r28shl(num: number, shift: number) {
        return ((num << shift) & 0xfffffff) | (num >>> (28 - shift));
    }

    static pc2table = [
        // inL => outL
        14, 11, 17, 4, 27, 23, 25, 0,
        13, 22, 7, 18, 5, 9, 16, 24,
        2, 20, 12, 21, 1, 8, 15, 26,

        // inR => outR
        15, 4, 25, 19, 9, 1, 26, 16,
        5, 11, 23, 8, 12, 7, 17, 0,
        22, 3, 10, 14, 6, 20, 27, 24
    ];

    static pc2(inL: number, inR: number, out: BinaryLike, off: number) {
        let outL = 0;
        let outR = 0;

        const len = Helper.pc2table.length >>> 1;
        for (let i = 0; i < len; i++) {
            outL <<= 1;
            outL |= (inL >>> Helper.pc2table[i]) & 0x1;
        }
        for (let i = len; i < Helper.pc2table.length; i++) {
            outR <<= 1;
            outR |= (inR >>> Helper.pc2table[i]) & 0x1;
        }

        out[off] = outL >>> 0;
        out[off + 1] = outR >>> 0;
    }


    static expand(r: number, out: BinaryLike, off: number) {
        let outL = ((r & 1) << 5) | (r >>> 27);
        let outR = 0;

        for (let i = 23; i >= 15; i -= 4) {
            outL <<= 6;
            outL |= (r >>> i) & 0x3f;
        }
        for (let i = 11; i >= 3; i -= 4) {
            outR |= (r >>> i) & 0x3f;
            outR <<= 6;
        }
        outR |= ((r & 0x1f) << 1) | (r >>> 31);

        out[off] = outL >>> 0;
        out[off + 1] = outR >>> 0;
    }


    static sTable = [
        14, 0, 4, 15, 13, 7, 1, 4, 2, 14, 15, 2, 11, 13, 8, 1,
        3, 10, 10, 6, 6, 12, 12, 11, 5, 9, 9, 5, 0, 3, 7, 8,
        4, 15, 1, 12, 14, 8, 8, 2, 13, 4, 6, 9, 2, 1, 11, 7,
        15, 5, 12, 11, 9, 3, 7, 14, 3, 10, 10, 0, 5, 6, 0, 13,

        15, 3, 1, 13, 8, 4, 14, 7, 6, 15, 11, 2, 3, 8, 4, 14,
        9, 12, 7, 0, 2, 1, 13, 10, 12, 6, 0, 9, 5, 11, 10, 5,
        0, 13, 14, 8, 7, 10, 11, 1, 10, 3, 4, 15, 13, 4, 1, 2,
        5, 11, 8, 6, 12, 7, 6, 12, 9, 0, 3, 5, 2, 14, 15, 9,

        10, 13, 0, 7, 9, 0, 14, 9, 6, 3, 3, 4, 15, 6, 5, 10,
        1, 2, 13, 8, 12, 5, 7, 14, 11, 12, 4, 11, 2, 15, 8, 1,
        13, 1, 6, 10, 4, 13, 9, 0, 8, 6, 15, 9, 3, 8, 0, 7,
        11, 4, 1, 15, 2, 14, 12, 3, 5, 11, 10, 5, 14, 2, 7, 12,

        7, 13, 13, 8, 14, 11, 3, 5, 0, 6, 6, 15, 9, 0, 10, 3,
        1, 4, 2, 7, 8, 2, 5, 12, 11, 1, 12, 10, 4, 14, 15, 9,
        10, 3, 6, 15, 9, 0, 0, 6, 12, 10, 11, 1, 7, 13, 13, 8,
        15, 9, 1, 4, 3, 5, 14, 11, 5, 12, 2, 7, 8, 2, 4, 14,

        2, 14, 12, 11, 4, 2, 1, 12, 7, 4, 10, 7, 11, 13, 6, 1,
        8, 5, 5, 0, 3, 15, 15, 10, 13, 3, 0, 9, 14, 8, 9, 6,
        4, 11, 2, 8, 1, 12, 11, 7, 10, 1, 13, 14, 7, 2, 8, 13,
        15, 6, 9, 15, 12, 0, 5, 9, 6, 10, 3, 4, 0, 5, 14, 3,

        12, 10, 1, 15, 10, 4, 15, 2, 9, 7, 2, 12, 6, 9, 8, 5,
        0, 6, 13, 1, 3, 13, 4, 14, 14, 0, 7, 11, 5, 3, 11, 8,
        9, 4, 14, 3, 15, 2, 5, 12, 2, 9, 8, 5, 12, 15, 3, 10,
        7, 11, 0, 14, 4, 1, 10, 7, 1, 6, 13, 0, 11, 8, 6, 13,

        4, 13, 11, 0, 2, 11, 14, 7, 15, 4, 0, 9, 8, 1, 13, 10,
        3, 14, 12, 3, 9, 5, 7, 12, 5, 2, 10, 15, 6, 8, 1, 6,
        1, 6, 4, 11, 11, 13, 13, 8, 12, 1, 3, 4, 7, 10, 14, 7,
        10, 9, 15, 5, 6, 0, 8, 15, 0, 14, 5, 2, 9, 3, 2, 12,

        13, 1, 2, 15, 8, 13, 4, 8, 6, 10, 15, 3, 11, 7, 1, 4,
        10, 12, 9, 5, 3, 6, 14, 11, 5, 0, 0, 14, 12, 9, 7, 2,
        7, 2, 11, 1, 4, 14, 1, 7, 9, 4, 12, 10, 14, 8, 2, 13,
        0, 15, 6, 12, 10, 9, 13, 0, 15, 3, 3, 5, 5, 6, 8, 11
    ];

    static substitute(inL: number, inR: number) {
        let out = 0;
        for (let i = 0; i < 4; i++) {
            let b = (inL >>> (18 - i * 6)) & 0x3f;
            let sb = Helper.sTable[i * 0x40 + b];

            out <<= 4;
            out |= sb;
        }
        for (let i = 0; i < 4; i++) {
            let b = (inR >>> (18 - i * 6)) & 0x3f;
            let sb = Helper.sTable[4 * 0x40 + i * 0x40 + b];

            out <<= 4;
            out |= sb;
        }

        return out >>> 0;
    }

    static permuteTable = [
        16, 25, 12, 11, 3, 20, 4, 15, 31, 17, 9, 6, 27, 14, 1, 22,
        30, 24, 8, 18, 0, 5, 29, 23, 13, 19, 2, 26, 10, 21, 28, 7
    ];

    static permute(num: number) {
        let out = 0;
        for (let i = 0; i < Helper.permuteTable.length; i++) {
            out <<= 1;
            out |= (num >>> Helper.permuteTable[i]) & 0x1;
        }
        return out >>> 0;
    }

    static log(message: string, value: any): void {
        console.log(`----- ${message} -----`);
        console.log(value);
        console.log('\n');
    }
}

class DESState {
    tmp = new Array(2);
    keys = new Array(0);
}

export class DES {
    protected type?: CipherType;
    protected blockSize = 8;
    protected buffer = new Array(this.blockSize);
    protected bufferOff = 0;

    protected _desState: DESState;

    private static SHIFT_TABLE: number[] = [
        1, 1, 2, 2, 2, 2, 2, 2,
        1, 2, 2, 2, 2, 2, 2, 1
    ];

    constructor(protected options: CipherOptions) {
        this.type = this.options.type;

        const state = new DESState();
        this._desState = state;

        this.deriveKeys(state, options.key);
    }

    static create(options: CipherOptions) {
        return new DES(options);
    }

    deriveKeys(state: DESState, key: BinaryLike) {
        state.keys = Array(16 * 2);

        let kL = Helper.readUInt32BE(key, 0);
        let kR = Helper.readUInt32BE(key, 4);

        Helper.pc1(kL, kR, state.tmp, 0);
        kL = state.tmp[0];
        kR = state.tmp[1];
        for (let i = 0; i < state.keys.length; i += 2) {
            let shift = DES.SHIFT_TABLE[i >>> 1];

            kL = Helper.r28shl(kL, shift);
            kR = Helper.r28shl(kR, shift);

            Helper.pc2(kL, kR, state.keys, i);
        }
    }

    protected _update(inp: BinaryLike, inOff: number, out: BinaryLike, outOff: number) {
        const state = this._desState;

        let l = Helper.readUInt32BE(inp, inOff);
        let r = Helper.readUInt32BE(inp, inOff + 4);

        // Initial Permutation
        Helper.ip(l, r, state.tmp, 0);
        l = state.tmp[0];
        r = state.tmp[1];

        if (this.type === 'encrypt')
            this._encrypt(state, l, r, state.tmp, 0);
        else
            this._decrypt(state, l, r, state.tmp, 0);

        l = state.tmp[0];
        r = state.tmp[1];

        Helper.writeUInt32BE(out, l, outOff);
        Helper.writeUInt32BE(out, r, outOff + 4);
    }

    protected pad(buffer: BinaryLike, off: number) {
        let value = buffer.length - off;
        for (let i = off; i < buffer.length; i++)
            buffer[i] = value;

        return true;
    }

    protected unpad(buffer: BinaryLike) {
        let pad = buffer[buffer.length - 1];

        return buffer.slice(0, buffer.length - pad);
    }

    protected _encrypt(state: DESState, lStart: number, rStart: number, out: BinaryLike, off: number) {
        let l = lStart;
        let r = rStart;

        // Apply f() x16 times
        for (let i = 0; i < state.keys.length; i += 2) {
            let keyL = state.keys[i];
            let keyR = state.keys[i + 1];

            // f(r, k)
            Helper.expand(r, state.tmp, 0);

            keyL ^= state.tmp[0];
            keyR ^= state.tmp[1];
            const s = Helper.substitute(keyL, keyR);
            const f = Helper.permute(s);

            let t = r;
            r = (l ^ f) >>> 0;
            l = t;
        }

        // Reverse Initial Permutation
        Helper.rip(r, l, out, off);
    }

    protected _decrypt(state: DESState, lStart: number, rStart: number, out: BinaryLike, off: number) {
        let l = rStart;
        let r = lStart;

        // Apply f() x16 times
        for (let i = state.keys.length - 2; i >= 0; i -= 2) {
            let keyL = state.keys[i];
            let keyR = state.keys[i + 1];

            // f(r, k)
            Helper.expand(l, state.tmp, 0);

            keyL ^= state.tmp[0];
            keyR ^= state.tmp[1];
            let s = Helper.substitute(keyL, keyR);
            let f = Helper.permute(s);

            let t = l;
            l = (r ^ f) >>> 0;
            r = t;
        }

        // Reverse Initial Permutation
        Helper.rip(l, r, out, off);
    }

    update(data: BinaryLike): number[] {
        if (data.length === 0) {
            return [];
        }

        return (this.type === 'decrypt') ? this.updateDecrypt(data) : this.updateEncrypt(data);
    }

    protected _buffer(data: BinaryLike, off: number) {
        // Append data to buffer
        const min = Math.min(this.buffer.length - this.bufferOff, data.length - off);
        for (let i = 0; i < min; i++)
            this.buffer[this.bufferOff + i] = data[off + i];
        this.bufferOff += min;

        // Shift next
        return min;
    }

    protected flushBuffer(out: BinaryLike, off: number) {
        this._update(this.buffer, 0, out, off);
        this.bufferOff = 0;
        return this.blockSize;
    }

    protected updateEncrypt(data: BinaryLike) {
        let inputOff = 0;
        let outputOff = 0;

        const count = ((this.bufferOff + data.length) / this.blockSize) | 0;
        const out = new Array(count * this.blockSize);

        if (this.bufferOff !== 0) {
            inputOff += this._buffer(data, inputOff);

            if (this.bufferOff === this.buffer.length)
                outputOff += this.flushBuffer(out, outputOff);
        }

        // Write blocks
        const max = data.length - ((data.length - inputOff) % this.blockSize);
        for (; inputOff < max; inputOff += this.blockSize) {
            this._update(data, inputOff, out, outputOff);
            outputOff += this.blockSize;
        }

        // Queue rest
        for (; inputOff < data.length; inputOff++, this.bufferOff++)
            this.buffer[this.bufferOff] = data[inputOff];

        return out;
    }

    protected updateDecrypt(data: BinaryLike) {
        let inputOff = 0;
        let outputOff = 0;

        let count = Math.ceil((this.bufferOff + data.length) / this.blockSize) - 1;
        const out = new Array(count * this.blockSize);

        for (; count > 0; count--) {
            inputOff += this._buffer(data, inputOff);
            outputOff += this.flushBuffer(out, outputOff);
        }

        // Buffer rest of the input
        inputOff += this._buffer(data, inputOff);

        return out;
    }

    final(buffer?: BinaryLike) {
        let first: number[] = [];
        if (buffer)
            first = this.update(buffer);

        let last;
        if (this.type === 'encrypt')
            last = this.finalEncrypt();
        else
            last = this.finalDecrypt();

        if (first)
            return new Array([...first, ...last]);
        else
            return last;
    }

    protected finalEncrypt(): number[] {
        if (!this.pad(this.buffer, this.bufferOff))
            return [];

        const out = new Array(this.blockSize);
        this._update(this.buffer, 0, out, 0);
        return out;
    }

    protected finalDecrypt() {
        if (this.bufferOff !== this.blockSize) {
            throw new Error('Not enough data to decrypt');
        }

        const out = new Array(this.blockSize);
        this.flushBuffer(out, 0);

        return this.unpad(out);
    }

}

export function run() {
    const input = 'inputDES' // 64 bit

    const key = [0x13, 0x34, 0x57, 0x79, 0x9B, 0xBC, 0xDF, 0xF1];
    const enc = DES.create({
        type: 'encrypt',
        key
    });
    const decoder = new TextDecoder();
    const encoder = new TextEncoder();

    const out = new Uint8Array([...enc.update(encoder.encode(input)), ...enc.final()]);

    const dec = DES.create({
        type: 'decrypt',
        key,
    });
    const decryptText = dec.update(out);

    Helper.log('decode text:', decoder.decode(new Uint8Array(decryptText)))
}

run();

