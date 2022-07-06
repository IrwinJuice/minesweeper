import { Field } from './Field.js';
function bootstrap() {
    let small;
    let middle;
    let large;
    let ultra;
    small = document.getElementById('small');
    middle = document.getElementById('middle');
    large = document.getElementById('large');
    ultra = document.getElementById('ultra');
    small.addEventListener('click', () => playSmall());
    middle.addEventListener('click', () => playMiddle());
    large.addEventListener('click', () => playLarge());
    ultra.addEventListener('click', () => playUltra());
}
bootstrap();
/**
 * Field 9x9 - 10 mine
 * */
function playSmall() {
    const rows = 9;
    const columns = 9;
    const mines = 18;
    const field = new Field(rows, columns, mines);
    field.generateCells().render();
}
function playMiddle() {
    const rows = 18;
    const columns = 18;
    const mines = 36;
    const field = new Field(rows, columns, mines);
    field.generateCells().render();
}
function playLarge() {
    const rows = 36;
    const columns = 36;
    const mines = 130;
    const field = new Field(rows, columns, mines);
    field.generateCells().render();
}
function playUltra() {
    const rows = 130;
    const columns = 130;
    const mines = 1600;
    const field = new Field(rows, columns, mines);
    field.generateCells().render();
}
