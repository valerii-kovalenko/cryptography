export class Matrix {
    private rowKey = 'крипто';
    private columnKey = 'шифр';
    private isDebugEnabled = true;

    private readonly inputPhrase: string;

    constructor(inputPhrase: string) {
        this.inputPhrase = inputPhrase;
    }

    public run(): void {
        console.log('ENCRYPT');
        const encryptedText = this.encrypt();
        console.log('Encryption result: ', encryptedText);

        console.log('\nDECRYPT');
        const decryptedText = this.decrypt(encryptedText);
        console.log('Decryption result: ', decryptedText);
    }

    public encrypt(): string {
        const m = this.buildMatrix();
        this.debug('original matrix', m);

        const rowKey = this.rowKey.split('');
        const columnKey = this.columnKey.split('');

        const matrixReorderedByColumn = this.transformWithRowKey(m, rowKey, [...rowKey].sort());
        this.debug('matrixReorderedByColumn', matrixReorderedByColumn);

        const matrixReorderedByColumnAndRow = this.transformWithColumnKey(matrixReorderedByColumn, columnKey, [...columnKey].sort());
        this.debug('matrixReorderedByColumnAndRow', matrixReorderedByColumnAndRow);

        return this.readMatrixByColumns(matrixReorderedByColumnAndRow);
    }

    public decrypt(encryptedText: string): string {
        const m = this.fillMatrix(encryptedText);
        this.debug('original matrix', m);

        const rowKey = this.rowKey.split('');
        const columnKey = this.columnKey.split('');

        const matrixReorderedByRow = this.transformWithColumnKey(m, [...columnKey].sort(), columnKey);
        this.debug('matrixReorderedByRow', matrixReorderedByRow);

        const matrixReorderedByColumnAndRow = this.transformWithRowKey(matrixReorderedByRow, [...rowKey].sort(), rowKey);
        this.debug('matrixReorderedByColumnAndRow', matrixReorderedByColumnAndRow);

        return this.readMatrixByRows(matrixReorderedByColumnAndRow);
    }

    private buildMatrix(): Array<Array<string>> {
        const columnsLen = this.rowKey.length;
        const rowsLen = this.columnKey.length;

        const matrix = this.initEmptyMatrix();
        // const trimmedPhrase = this.inputPhrase.replace(/ /g,'');
        const trimmedPhrase = this.inputPhrase;
        for (let i = 0; i < rowsLen; i++) {
            for (let j = 0; j < columnsLen; j++) {
                if (trimmedPhrase[i * columnsLen + j]) {
                    matrix[i][j] = trimmedPhrase[i * columnsLen + j];
                }
            }
        }
        return matrix;
    }

    private fillMatrix(text: string): Array<Array<string>> {
        const columnsLen = this.rowKey.length;
        const rowsLen = this.columnKey.length;

        const matrix = this.initEmptyMatrix();

        const trimmedPhrase: Array<string> = [];
        text.split('').map((symbol, index) => {
            if ((index === 0) || ((index + 1) % (rowsLen + 1) !== 0)) {
                trimmedPhrase.push(symbol)
            }
        });

        for (let i = 0; i < columnsLen; i++) {
            for (let j = 0; j < rowsLen; j++) {
                if (trimmedPhrase[i * rowsLen + j]) {
                    matrix[j][i] = trimmedPhrase[i * rowsLen + j].toString();
                }
            }
        }

        return matrix;
    }

    private initEmptyMatrix(): Array<Array<string>> {
        const matrix = [];
        const columnsLen = this.rowKey.length;
        const rowsLen = this.columnKey.length;

        for (let i = 0; i < rowsLen; i++) {
            const row = [];
            for (let j = 0; j < columnsLen; j++) {
                row.push(' ');
            }
            matrix.push(row);
        }
        return matrix;
    }

    private transformWithRowKey(matrix: Array<Array<string>>, originKey: Array<string>, newKey: Array<string>): Array<Array<string>> {
        const matrixTransformed = this.initEmptyMatrix();
        originKey.map((originVal, originKeyIndex) => {
            const newKeyIndex = newKey.findIndex((val) => val === originVal);
            for (let i = 0; i < this.columnKey.length; i++) {
                matrixTransformed[i][newKeyIndex] = matrix[i][originKeyIndex];
            }
            return;
        });

        return matrixTransformed;
    }

    private transformWithColumnKey(matrix: Array<Array<string>>, originKey: Array<string>, newKey: Array<string>): Array<Array<string>> {
        const matrixTransformed = this.initEmptyMatrix();
        originKey.map((originVal, originKeyIndex) => {
            const newKeyIndex = newKey.findIndex((val) => val === originVal);
            for (let i = 0; i < this.rowKey.length; i++) {
                matrixTransformed[newKeyIndex][i] = matrix[originKeyIndex][i];
            }
            return;
        });

        return matrixTransformed;
    }

    private readMatrixByColumns(matrix: Array<Array<string>>): string {
        const resultArr = [];
        for (let i = 0; i < this.rowKey.length; i++) {
            for (let j = 0; j < this.columnKey.length; j++) {
                resultArr.push(matrix[j][i]);
            }
            resultArr.push(' ');
        }

        return resultArr.join('');
    }

    private readMatrixByRows(matrix: Array<Array<string>>): string {
        let resultArr: Array<string> = [];
        for(let i = 0; i < matrix.length; i++) {
            resultArr = resultArr.concat(matrix[i]);
        }

        return resultArr.join('');
    }

    private debug(message: string, value: any):void {
        if (this.isDebugEnabled) {
            console.log(`----- ${message} -----`);
            console.log(value);
            console.log('\n');
        }
    }
}

const algorithm = new Matrix('програмне забезпечення');
algorithm.run();
