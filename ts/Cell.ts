export type Cell = {
    isMine: boolean,
    isOpen: boolean,
    hasFlag: boolean,
    col: number,
    row: number,
    neighborMineCount: number
}