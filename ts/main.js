import { Field } from './Field.js';
let small;
let medium;
let large;
function bootstrap() {
    small = document.getElementById('small');
    medium = document.getElementById('medium');
    large = document.getElementById('large');
    small.addEventListener('click', () => playSmall());
    medium.addEventListener('click', () => playSmall()); // TODO
    large.addEventListener('click', () => playSmall()); // TODO
}
bootstrap();
/**
 * Field 9x9 - 10 mine
 * */
function playSmall() {
    const rows = 9;
    const columns = 9;
    const mines = 10;
    const field = new Field(rows, columns, mines);
    field.generateCells().render();
}
