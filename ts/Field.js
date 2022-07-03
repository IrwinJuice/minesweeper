export class Field {
    constructor(rows, columns, mines) {
        this.cells = [];
        this.isStarted = false;
        this.columns = columns;
        this.rows = rows;
        this.mines = mines;
    }
    generateCells() {
        for (let i = 0; i < this.rows; i++) {
            const arr = [];
            for (let k = 0; k < this.columns; k++) {
                const cell = {
                    col: k,
                    hasFlag: false,
                    isMine: false,
                    isOpen: false,
                    neighborMineCount: 0,
                    row: i
                };
                arr.push(cell);
            }
            this.cells.push(arr);
        }
        return this;
    }
    render() {
        const field = document.getElementById('field');
        field.innerHTML = '';
        for (let i = 0; i < this.rows; i++) {
            let row = document.createElement('div');
            row.className = 'row';
            field.appendChild(row);
            for (let k = 0; k < this.columns; k++) {
                let cell = this.cells[i][k];
                let cellElement = document.createElement('div');
                cellElement.className = 'cell';
                cellElement.setAttribute('data-row', cell.row.toString());
                cellElement.setAttribute('data-column', cell.col.toString());
                cellElement.addEventListener('click', (event) => this.sweep(event));
                cellElement.addEventListener('contextmenu', (event) => {
                    this.setFlag(event);
                    event.preventDefault();
                });
                if (cell.isOpen) {
                    cellElement.className = 'cell cell--open';
                    if (cell.isMine) {
                        cellElement.className = 'cell cell--open cell--mine';
                    }
                    else {
                        if (cell.neighborMineCount) {
                            cellElement.innerHTML = `<span>${cell.neighborMineCount}</span>`;
                        }
                        else {
                            cellElement.innerHTML = '';
                        }
                    }
                }
                else {
                    if (cell.hasFlag) {
                        cellElement.className = 'cell cell--flag';
                    }
                }
                row.appendChild(cellElement);
            }
        }
        return this;
    }
    sweep(event) {
        const target = event.currentTarget;
        const row = target.getAttribute("data-row");
        const column = target.getAttribute("data-column");
        let cell = this.cells[+row][+column];
        if (this.isStarted) {
            if (!cell.isOpen) {
                if (cell.isMine) {
                    this.onLose();
                    this.render();
                }
                else {
                    if (cell.neighborMineCount === 0) {
                        this.markAsOpenIfMineCountNull(cell);
                        this.render();
                    }
                    else {
                        cell.isOpen = true;
                        target.setAttribute('data-row', cell.row.toString());
                        target.setAttribute('data-column', cell.col.toString());
                        this.render();
                    }
                }
            }
        }
        else {
            cell.isMine = false;
            cell.isOpen = true;
            cell.neighborMineCount = 0;
            this.setMines(cell);
            this.setNeighbors();
            this.markAsOpenIfMineCountNull(cell);
            this.render();
            this.isStarted = true;
        }
    }
    setFlag(event) {
        const target = event.currentTarget;
        const row = target.getAttribute("data-row");
        const column = target.getAttribute("data-column");
        let cell = this.cells[+row][+column];
        if (!cell.isOpen) {
            cell.hasFlag = !cell.hasFlag;
            target.setAttribute('data-row', cell.row.toString());
            target.setAttribute('data-column', cell.col.toString());
            if (cell.hasFlag) {
                target.className = 'cell cell--flag';
            }
            else {
                target.innerHTML = '';
            }
        }
    }
    setNeighbors() {
        for (let i = 0; i < this.rows; i++) {
            for (let k = 0; k < this.columns; k++) {
                let cell = this.cells[i][k];
                if (cell.isMine)
                    continue;
                cell.neighborMineCount = this.getNeighbors(cell)
                    .map(c => c.isMine)
                    .filter(c => c).length;
            }
        }
    }
    markAsOpenIfMineCountNull(cell) {
        const neighbors = this.getNeighbors(cell);
        for (let i = 0; i < neighbors.length; i++) {
            if (!neighbors[i].isOpen) {
                neighbors[i].isOpen = true;
                if (neighbors[i].neighborMineCount === 0) {
                    this.markAsOpenIfMineCountNull(neighbors[i]);
                }
            }
        }
    }
    setMines(startCell) {
        const neighbors = this.getNeighbors(startCell);
        for (let mineCounter = 0; mineCounter < this.mines; mineCounter++) {
            const randomRow = Math.floor(Math.random() * this.rows);
            const randomCol = Math.floor(Math.random() * this.columns);
            let cell = this.cells[randomRow][randomCol];
            if ((cell.col !== startCell.col && cell.row !== startCell.row) &&
                neighbors.indexOf(cell) === -1) {
                if (!cell.isMine) {
                    cell.isMine = true;
                }
                else {
                    mineCounter--;
                }
            }
            else {
                mineCounter--;
            }
        }
        return this;
    }
    onLose() {
        for (let i = 0; i < this.rows; i++) {
            for (let k = 0; k < this.columns; k++) {
                this.cells[i][k].isOpen = true;
            }
        }
    }
    getNeighbors(cell) {
        const i = cell.row;
        const k = cell.col;
        if (i === 0) {
            if (k === 0) {
                const cellEast = this.cells[i][k + 1];
                const cellEastSouth = this.cells[i + 1][k + 1];
                const cellSouth = this.cells[i + 1][k];
                return [cellEast, cellEastSouth, cellSouth];
            }
            else if (k === this.columns - 1) {
                const cellWest = this.cells[i][k - 1];
                const cellWestSouth = this.cells[i + 1][k - 1];
                const cellSouth = this.cells[i + 1][k];
                return [cellWest, cellWestSouth, cellSouth];
            }
            else {
                const cellEast = this.cells[i][k + 1];
                const cellEastSouth = this.cells[i + 1][k + 1];
                const cellWest = this.cells[i][k - 1];
                const cellWestSouth = this.cells[i + 1][k - 1];
                const cellSouth = this.cells[i + 1][k];
                return [cellEast, cellEastSouth, cellWest, cellWestSouth, cellSouth];
            }
        }
        else if (i === this.rows - 1) {
            if (k === 0) {
                const cellEast = this.cells[i][k + 1];
                const cellEastNorth = this.cells[i - 1][k + 1];
                const cellNorth = this.cells[i - 1][k];
                return [cellEast, cellEastNorth, cellNorth];
            }
            else if (k === this.columns - 1) {
                const cellWest = this.cells[i][k - 1];
                const cellWestNorth = this.cells[i - 1][k - 1];
                const cellNorth = this.cells[i - 1][k];
                return [cellWest, cellWestNorth, cellNorth];
            }
            else {
                const cellEast = this.cells[i][k + 1];
                const cellEastNorth = this.cells[i - 1][k + 1];
                const cellWest = this.cells[i][k - 1];
                const cellWestNorth = this.cells[i - 1][k - 1];
                const cellNorth = this.cells[i - 1][k];
                return [cellEast, cellEastNorth, cellWest, cellWestNorth, cellNorth];
            }
        }
        else {
            if (k === 0) {
                const cellEast = this.cells[i][k + 1];
                const cellEastNorth = this.cells[i - 1][k + 1];
                const cellNorth = this.cells[i - 1][k];
                const cellSouth = this.cells[i + 1][k];
                const cellEastSouth = this.cells[i + 1][k + 1];
                return [cellEast, cellEastNorth, cellNorth, cellSouth, cellEastSouth];
            }
            else if (k === this.columns - 1) {
                const cellWest = this.cells[i][k - 1];
                const cellWestNorth = this.cells[i - 1][k - 1];
                const cellNorth = this.cells[i - 1][k];
                const cellSouth = this.cells[i + 1][k];
                const cellWestSouth = this.cells[i + 1][k - 1];
                return [cellWest, cellWestNorth, cellNorth, cellSouth, cellWestSouth];
            }
            else {
                const cellEast = this.cells[i][k + 1];
                const cellWest = this.cells[i][k - 1];
                const cellNorth = this.cells[i - 1][k];
                const cellSouth = this.cells[i + 1][k];
                const cellEastNorth = this.cells[i - 1][k + 1];
                const cellWestNorth = this.cells[i - 1][k - 1];
                const cellWestSouth = this.cells[i + 1][k - 1];
                const cellEastSouth = this.cells[i + 1][k + 1];
                return [
                    cellEast, cellEastNorth, cellWest,
                    cellWestNorth, cellNorth, cellSouth,
                    cellWestSouth, cellEastSouth
                ];
            }
        }
    }
}
