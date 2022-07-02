import {Cell} from './Cell';
import {Field} from './Field';


const field: HTMLElement = document.getElementById('field')!;
let isStarted            = false;

let cells: Array<Cell[]> = [];

let small: HTMLButtonElement;
let medium: HTMLButtonElement;
let large: HTMLButtonElement;

function bootstrap() {
    small = document.getElementById('small')! as HTMLButtonElement;
    medium = document.getElementById('medium')! as HTMLButtonElement;
    large = document.getElementById('large')! as HTMLButtonElement;

    small.addEventListener('click', () => playSmall());
    medium.addEventListener('click', () => playSmall()); // TODO
    large.addEventListener('click', () => playSmall()); // TODO
}

bootstrap();

/**
 * Field 9x9 - 10 mine
 * */
function playSmall() {
    const rows    = 9;
    const columns = 9;
    const mines = 10;

    new Field(rows, columns, mines);

    cells = cellsGen(rows, columns);
    fieldGen(rows, columns);
}

function fieldGen(rows: number, cols: number) {
    for (let i = 0; i < rows; i++) {
        let row       = document.createElement('div') as HTMLDivElement;
        row.className = 'row'
        field.appendChild(row);
        for (let k = 0; k < cols; k++) {
            let cell       = document.createElement('div') as HTMLDivElement;
            cell.className = 'cell';
            cell.setAttribute('data-cell', JSON.stringify(cells[i][k]));
            cell.addEventListener('click', (event) => sweep(event));
            row.appendChild(cell);
        }
    }

}

function cellsGen(rows: number, cols: number): Array<Cell[]> {
    const cells: Array<Cell[]> = [];
    for (let i = 0; i < rows; i++) {
        const arr: Cell[] = [];
        for (let k = 0; k < cols; k++) {
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

function getNeighbors(cell: Cell): Cell[] {
    const i = cell.row;
    const k = cell.col;
    if (i === 0) {
        if (k === 0) {
            const cellEast      = cells[i][k + 1];
            const cellEastSouth = cells[i + 1][k + 1];
            const cellSouth     = cells[i + 1][k];
            return [cellEast, cellEastSouth, cellSouth];
        } else if (k === columns - 1) {
            const cellWest      = cells[i][k - 1];
            const cellWestSouth = cells[i + 1][k - 1];
            const cellSouth     = cells[i + 1][k];
            return [cellWest, cellWestSouth, cellSouth];
        } else {
            const cellEast      = cells[i][k + 1];
            const cellEastSouth = cells[i + 1][k + 1];
            const cellWest      = cells[i][k - 1];
            const cellWestSouth = cells[i + 1][k - 1];
            const cellSouth     = cells[i + 1][k];
            return [cellEast, cellEastSouth, cellWest, cellWestSouth, cellSouth];
        }
    } else if (i === rows - 1) {
        if (k === 0) {
            const cellEast      = cells[i][k + 1];
            const cellEastNorth = cells[i - 1][k + 1];
            const cellNorth     = cells[i - 1][k];
            return [cellEast, cellEastNorth, cellNorth];

        } else if (k === columns - 1) {
            const cellWest      = cells[i][k - 1];
            const cellWestNorth = cells[i - 1][k - 1];
            const cellNorth     = cells[i - 1][k];
            return [cellWest, cellWestNorth, cellNorth];
        } else {
            const cellEast      = cells[i][k + 1];
            const cellEastNorth = cells[i - 1][k + 1];
            const cellWest      = cells[i][k - 1];
            const cellWestNorth = cells[i - 1][k - 1];
            const cellNorth     = cells[i - 1][k];
            return [cellEast, cellEastNorth, cellWest, cellWestNorth, cellNorth];
        }
    } else {
        if (k === 0) {
            const cellEast      = cells[i][k + 1];
            const cellEastNorth = cells[i - 1][k + 1];
            const cellNorth     = cells[i - 1][k];
            const cellSouth     = cells[i + 1][k];
            const cellEastSouth = cells[i + 1][k + 1];

            return [cellEast, cellEastNorth, cellNorth, cellSouth, cellEastSouth];

        } else if (k === columns - 1) {
            const cellWest      = cells[i][k - 1];
            const cellWestNorth = cells[i - 1][k - 1];
            const cellNorth     = cells[i - 1][k];
            const cellSouth     = cells[i + 1][k];
            const cellWestSouth = cells[i + 1][k - 1];

            return [cellWest, cellWestNorth, cellNorth, cellSouth, cellWestSouth];
        } else {
            const cellEast      = cells[i][k + 1];
            const cellWest      = cells[i][k - 1];
            const cellNorth     = cells[i - 1][k];
            const cellSouth     = cells[i + 1][k];
            const cellEastNorth = cells[i - 1][k + 1];
            const cellWestNorth = cells[i - 1][k - 1];
            const cellWestSouth = cells[i + 1][k - 1];
            const cellEastSouth = cells[i + 1][k + 1];

            return [
                cellEast, cellEastNorth, cellWest,
                cellWestNorth, cellNorth, cellSouth,
                cellWestSouth, cellEastSouth
            ];
        }
    }
}

function openNeighborsIfMineCountNull(cell: Cell) {
    const neighbors: Cell[] = getNeighbors(cell);
    for (let i = 0; i < neighbors.length; i++) {
        if (!neighbors[i].isOpen) {
            neighbors[i].isOpen = true;
            if (neighbors[i].neighborMineCount === 0) {
                openNeighborsIfMineCountNull(neighbors[i]);
            }
        }
    }
}

function setFlag(event: Event) {
    if (isStarted) {
        const target     = event.currentTarget as HTMLDivElement;
        const dataCell   = target.getAttribute("data-cell");
        const cell: Cell = JSON.parse(dataCell!);

        if (!cell.isOpen) {
            cell.hasFlag                      = true;
            cells[cell.row][cell.col].hasFlag = true;
            target.setAttribute('data-cell', JSON.stringify(cell));
            target.innerHTML = `<span>F</span>`;
        }
    }
}

function renderer() {
    field.innerHTML = '';
    for (let i = 0; i < rows; i++) {
        let row       = document.createElement('div') as HTMLDivElement;
        row.className = 'row'
        field.appendChild(row);
        for (let k = 0; k < columns; k++) {
            let cell: Cell        = cells[i][k];
            let cellElement       = document.createElement('div') as HTMLDivElement;
            cellElement.className = 'cell';
            cellElement.setAttribute('data-cell', JSON.stringify(cells[i][k]));
            cellElement.addEventListener('click', (event) => sweep(event));
            cellElement.addEventListener('contextmenu', (event) => {
                setFlag(event);
                event.preventDefault();
            });
            if (cell.isOpen) {
                if (cell.isMine) {
                    cellElement.innerHTML = '<span>M</span>'
                } else {
                    cellElement.innerHTML = `<span>${cell.neighborMineCount}</span>`
                }
            } else {
                if (cell.hasFlag) {
                    cellElement.innerHTML = `<span>F</span>`;
                }
            }
            row.appendChild(cellElement);
        }
    }
}

function onLose() {
    field.innerHTML = '';
    for (let i = 0; i < rows; i++) {
        let row       = document.createElement('div') as HTMLDivElement;
        row.className = 'row'
        field.appendChild(row);
        for (let k = 0; k < columns; k++) {
            let cell: Cell        = cells[i][k];
            let cellElement       = document.createElement('div') as HTMLDivElement;
            cellElement.className = 'cell';
            if (cell.isMine) {
                cellElement.innerHTML = '<span>M</span>'
            } else {
                cellElement.innerHTML = `<span>${cell.neighborMineCount}</span>`
            }
            row.appendChild(cellElement);
        }
    }
}

function sweep(event: Event) {
    const target     = event.currentTarget as HTMLDivElement;
    const dataCell   = target.getAttribute("data-cell");
    const cell: Cell = JSON.parse(dataCell!);


    if (isStarted) {
        if (!cell.isOpen) {
            if (cell.isMine) {
                onLose();
            } else {
                if (cell.neighborMineCount === 0) {
                    openNeighborsIfMineCountNull(cell);
                    renderer();
                } else {
                    cell.isOpen                      = true;
                    cells[cell.row][cell.col].isOpen = true;
                    target.setAttribute('data-cell', JSON.stringify(cell));
                    renderer();
                }
            }
        }
    } else {
        const cellElement: Cell       = cells[cell.row][cell.col];
        cellElement.isMine            = false;
        cellElement.isOpen            = true;
        cellElement.neighborMineCount = 0;

        mineSetter(cellElement);
        neighbors();
        openNeighborsIfMineCountNull(cellElement);

        renderer()
        isStarted = true;
    }
}

function mineSetter(startCell: Cell) {
    const neighbors = getNeighbors(startCell);

    for (let mineCounter = 0; mineCounter < maxMine; mineCounter++) {
        const randomRow = Math.floor(Math.random() * rows);
        const randomCol = Math.floor(Math.random() * columns);

        let cell = cells[randomRow][randomCol];
        if ((cell.col !== startCell.col && cell.row !== startCell.row) &&
            neighbors.indexOf(cell) === -1
        ) {
            if (!cell.isMine) {
                cell.isMine = true;
            } else {
                mineCounter--;
            }
        } else {
            mineCounter--;
        }
    }
}

function neighbors() {
    for (let i = 0; i < rows; i++) {
        for (let k = 0; k < columns; k++) {
            let cell = cells[i][k];
            if (cell.isMine) continue;
            cell.neighborMineCount = getNeighbors(cell)
                .map(c => c.isMine)
                .filter(c => c === true)
                .length;
        }
    }
}