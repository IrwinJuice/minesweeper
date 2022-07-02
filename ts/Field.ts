import {Cell} from './Cell';

export class Field {
    private readonly rows: number;
    private readonly columns: number;
    private readonly mines: number;

    constructor(rows: number, columns: number, mines: number) {
        this.columns = columns;
        this.rows = rows;
        this.mines = mines;
    }

    cellsGenerator(): Array<Cell[]> {
        const cells: Array<Cell[]> = [];
        for (let i = 0; i < this.rows; i++) {
            const arr: Cell[] = [];
            for (let k = 0; k < this.columns; k++) {
                const cell: Cell = {
                    col: k,
                    hasFlag: false,
                    isMine: false,
                    isOpen: false,
                    neighborMineCount: 0,
                    row: i
                };
                arr.push(cell);
            }
            cells.push(arr);
        }
        return cells;
    }

}