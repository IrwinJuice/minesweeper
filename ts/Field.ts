import {Cell} from './Cell.js';

export class Field {
    readonly rows: number;
    readonly columns: number;
    readonly mines: number;
    readonly cellsStore: Array<Cell[]> = []; // generated cells
    private isStarted                  = false; // is game started
    private flags;


    constructor(rows: number, columns: number, mines: number) {
        this.columns = columns;
        this.rows    = rows;
        this.mines   = mines;
        this.flags   = mines; // flags are decreasing during the game
    }

    /**
     * Method generate started cells and push it into cellsStore
     *
     * @return Field
     * */
    generateCells(): Field {
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
            this.cellsStore.push(arr);
        }
        return this;
    }

    /**
     * Method represents how the field displays */
    render(): Field {
        const scoreBlock  = document.querySelector('.score-block')! as HTMLDivElement;
        const score  = document.getElementById('score')! as HTMLElement;
        const winner  = document.getElementById('winner')! as HTMLElement;
        const notMines = this.rows * this.columns - this.mines;
        const field: HTMLElement = document.getElementById('field')!;
        let openedCells = 0;

        if (this.isStarted) {
            // Show score block
            scoreBlock.style.visibility = 'visible';
            score.innerText = `${this.flags}`;
        } else {
            // Hid score block
            scoreBlock.style.visibility = 'hidden';
            score.innerText = '';
            winner.style.visibility = 'hidden';
        }
        // clean field
        field.innerHTML          = '';

        for (let i = 0; i < this.rows; i++) {
            let row       = document.createElement('div') as HTMLDivElement;
            row.className = 'row';
            field.appendChild(row);
            for (let k = 0; k < this.columns; k++) {
                let cell: Cell        = this.cellsStore[i][k];
                let cellElement       = document.createElement('div') as HTMLDivElement;
                cellElement.className = 'cell';
                // We need data-row & data-column for understand which cell was click
                cellElement.setAttribute('data-row', cell.row.toString());
                cellElement.setAttribute('data-column', cell.col.toString());
                cellElement.addEventListener('click', (event) => this.sweep(event));
                cellElement.addEventListener('contextmenu', (event) => {
                    this.setFlag(event);
                    event.preventDefault();
                });
                if (cell.isOpen) {
                    cellElement.className = 'cell cell--open'
                    openedCells = openedCells + 1;
                    if (cell.isMine) {
                        cellElement.className = 'cell cell--open cell--mine'
                    } else {
                        if (cell.neighborMineCount) {
                            cellElement.innerHTML = `<span>${cell.neighborMineCount}</span>`
                        } else {
                            cellElement.innerHTML = '';
                        }
                    }
                } else {
                    if (cell.hasFlag) {
                        cellElement.className = 'cell cell--flag'
                    }
                }
                row.appendChild(cellElement);
            }
        }


        // show winner cup
        if (openedCells === notMines && this.flags === 0) {
            const htmlElement = document.getElementById('winner')!;
            htmlElement.style.visibility = 'visible';
        }
        return this;
    }
/**
 * Method represents cell's behavior after OPEN click
 * */
    sweep(event: Event) {
        const target   = event.currentTarget as HTMLDivElement;
        const row      = target.getAttribute("data-row")!;
        const column   = target.getAttribute("data-column")!;
        let cell: Cell = this.cellsStore[+row][+column];

        if (this.isStarted) {
            if (!cell.isOpen) {
                if (cell.isMine) {
                    this.onLose();
                    this.render();
                } else {
                    cell.isOpen = true;
                    if (cell.neighborMineCount === 0) {
                        this.markAsOpenIfMineCountNull(cell);
                        this.render();
                    } else {
                        target.setAttribute('data-row', cell.row.toString());
                        target.setAttribute('data-column', cell.col.toString());
                        this.render();
                    }
                }
            }
        } else {
            cell.isMine            = false;
            cell.isOpen            = true;
            cell.neighborMineCount = 0;

            this.setMines(cell);
            this.setNeighbors();
            this.markAsOpenIfMineCountNull(cell);

            this.isStarted = true;
            this.render()
        }
    }
    /**
     * Method represents cell's behavior after FLAG click
     * */
    setFlag(event: Event) {

        if (this.isStarted) {

            const target   = event.currentTarget as HTMLDivElement;
            const row      = target.getAttribute("data-row")!;
            const column   = target.getAttribute("data-column")!;
            let cell: Cell = this.cellsStore[+row][+column];

            if (!cell.isOpen) {
                cell.hasFlag = !cell.hasFlag;
                if (cell.hasFlag) {
                    this.decreaseScore();
                    target.className = 'cell cell--flag';
                } else {
                    this.increaseScore();
                    target.className = 'cell';
                }
            }
        }
    }

    /**
     * Cell's neighbors counter
     * */
    private setNeighbors() {
        for (let i = 0; i < this.rows; i++) {
            for (let k = 0; k < this.columns; k++) {
                let cell = this.cellsStore[i][k];
                if (cell.isMine) continue;
                cell.neighborMineCount = this.getNeighbors(cell)
                                             .map(c => c.isMine)
                                             .filter(c => c).length;
            }
        }
    }
    /**
     * Open all empty cells and neighbors which belongs to first opened empty cell
     * */
    private markAsOpenIfMineCountNull(cell: Cell) { // cell.neighborMineCount === 0
        const neighbors: Cell[] = this.getNeighbors(cell); // get all cell's neighbors
        for (let i = 0; i < neighbors.length; i++) { // loop per each neighbors
            if (!neighbors[i].isOpen) { // if neighbor does not open
                neighbors[i].isOpen = true; // open neighbor
                if (neighbors[i].neighborMineCount === 0) {
                    this.markAsOpenIfMineCountNull(neighbors[i]); // if neighbor.neighborMineCount === 0 recursion
                }
            }
        }
    }

    /**
     * Generate mines
     * */
    private setMines(startCell: Cell): Field {
        const neighbors = this.getNeighbors(startCell);

        for (let mineCounter = 0; mineCounter < this.mines; mineCounter++) {
            const randomRow = Math.floor(Math.random() * this.rows);
            const randomCol = Math.floor(Math.random() * this.columns);

            let cell = this.cellsStore[randomRow][randomCol]; // get random cell
            // if random cell is not startCell and neighbors don't contain random cell
            if ((cell.col !== startCell.col && cell.row !== startCell.row) && neighbors.indexOf(cell) === -1) {
                if (!cell.isMine) {
                    cell.isMine = true; // if random cell is not a mine set it as mine
                } else {
                    mineCounter--; // if not decrease mineCounter
                }
            } else {
                mineCounter--; // if not decrease mineCounter
            }
        }
        return this;
    }

    /**
     * Method opens all fields if user opened cell with mine
     * */
    private onLose() {
        for (let i = 0; i < this.rows; i++) {
            for (let k = 0; k < this.columns; k++) {
                this.cellsStore[i][k].isOpen = true;
            }
        }
    }

    /**
     * Method find cell's neighbors coordinate
     * @return {Cell}[] with cell's neighbors coordinate */
    private getNeighbors(cell: Cell): Cell[] {
        const i = cell.row;
        const k = cell.col;
        if (i === 0) {
            if (k === 0) {
                const cellEast      = this.cellsStore[i][k + 1];
                const cellEastSouth = this.cellsStore[i + 1][k + 1];
                const cellSouth     = this.cellsStore[i + 1][k];
                return [cellEast, cellEastSouth, cellSouth];
            } else if (k === this.columns - 1) {
                const cellWest      = this.cellsStore[i][k - 1];
                const cellWestSouth = this.cellsStore[i + 1][k - 1];
                const cellSouth     = this.cellsStore[i + 1][k];
                return [cellWest, cellWestSouth, cellSouth];
            } else {
                const cellEast      = this.cellsStore[i][k + 1];
                const cellEastSouth = this.cellsStore[i + 1][k + 1];
                const cellWest      = this.cellsStore[i][k - 1];
                const cellWestSouth = this.cellsStore[i + 1][k - 1];
                const cellSouth     = this.cellsStore[i + 1][k];
                return [cellEast, cellEastSouth, cellWest, cellWestSouth, cellSouth];
            }
        } else if (i === this.rows - 1) {
            if (k === 0) {
                const cellEast      = this.cellsStore[i][k + 1];
                const cellEastNorth = this.cellsStore[i - 1][k + 1];
                const cellNorth     = this.cellsStore[i - 1][k];
                return [cellEast, cellEastNorth, cellNorth];

            } else if (k === this.columns - 1) {
                const cellWest      = this.cellsStore[i][k - 1];
                const cellWestNorth = this.cellsStore[i - 1][k - 1];
                const cellNorth     = this.cellsStore[i - 1][k];
                return [cellWest, cellWestNorth, cellNorth];
            } else {
                const cellEast      = this.cellsStore[i][k + 1];
                const cellEastNorth = this.cellsStore[i - 1][k + 1];
                const cellWest      = this.cellsStore[i][k - 1];
                const cellWestNorth = this.cellsStore[i - 1][k - 1];
                const cellNorth     = this.cellsStore[i - 1][k];
                return [cellEast, cellEastNorth, cellWest, cellWestNorth, cellNorth];
            }
        } else {
            if (k === 0) {
                const cellEast      = this.cellsStore[i][k + 1];
                const cellEastNorth = this.cellsStore[i - 1][k + 1];
                const cellNorth     = this.cellsStore[i - 1][k];
                const cellSouth     = this.cellsStore[i + 1][k];
                const cellEastSouth = this.cellsStore[i + 1][k + 1];

                return [cellEast, cellEastNorth, cellNorth, cellSouth, cellEastSouth];

            } else if (k === this.columns - 1) {
                const cellWest      = this.cellsStore[i][k - 1];
                const cellWestNorth = this.cellsStore[i - 1][k - 1];
                const cellNorth     = this.cellsStore[i - 1][k];
                const cellSouth     = this.cellsStore[i + 1][k];
                const cellWestSouth = this.cellsStore[i + 1][k - 1];

                return [cellWest, cellWestNorth, cellNorth, cellSouth, cellWestSouth];
            } else {
                const cellEast      = this.cellsStore[i][k + 1];
                const cellWest      = this.cellsStore[i][k - 1];
                const cellNorth     = this.cellsStore[i - 1][k];
                const cellSouth     = this.cellsStore[i + 1][k];
                const cellEastNorth = this.cellsStore[i - 1][k + 1];
                const cellWestNorth = this.cellsStore[i - 1][k - 1];
                const cellWestSouth = this.cellsStore[i + 1][k - 1];
                const cellEastSouth = this.cellsStore[i + 1][k + 1];

                return [
                    cellEast, cellEastNorth, cellWest,
                    cellWestNorth, cellNorth, cellSouth,
                    cellWestSouth, cellEastSouth
                ];
            }
        }
    }

    private increaseScore() {
        const score = document.getElementById('score')!;
        this.flags = this.flags + 1;
        score.innerText = `${ this.flags }`;
    }

    private decreaseScore() {
        const score = document.getElementById('score')!;
        this.flags = this.flags - 1;
        score.innerText = `${ this.flags}`;
    }

    // for test
    showMines () {

        const field: HTMLElement = document.getElementById('field')!;
        field.innerHTML          = '';


        for (let i = 0; i < this.rows; i++) {
            let row       = document.createElement('div') as HTMLDivElement;
            row.className = 'row'
            field.appendChild(row);
            for (let k = 0; k < this.columns; k++) {
                let cell: Cell        = this.cellsStore[i][k];
                let cellElement       = document.createElement('div') as HTMLDivElement;
                cellElement.className = 'cell';

                if (cell.isMine) {
                    cellElement.className = 'cell cell--open cell--mine'
                }
                row.appendChild(cellElement);
            }
        }

        return this;
    }
}