
export class Gf {
    public static mul02(a: number){
        const highBit = a & 0x80;
        const shift = (a << 1) & 0xff;
        return highBit === 0 ? shift : shift ^ 0x1b
    }

    public static mul03(a: number) {
        return Gf.mul02(a) ^ a;
    }

}

export function log(message: string, value: any):void {
    console.log(`----- ${message} -----`);
    console.log(value);
    console.log('\n');
}

log('mul02(0xd4))', Gf.mul02(0xd4).toString(16).toUpperCase());
log('mul03(0xbf))', Gf.mul03(0xbf).toString(16).toUpperCase());

