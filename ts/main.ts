import {Field} from './Field.js';

function bootstrap() {
    let small: HTMLButtonElement;
    let middle: HTMLButtonElement;
    let large: HTMLButtonElement;
    let ultra: HTMLButtonElement;

    small  = document.getElementById('small')! as HTMLButtonElement;
    middle = document.getElementById('middle')! as HTMLButtonElement;
    large  = document.getElementById('large')! as HTMLButtonElement;
    ultra  = document.getElementById('ultra')! as HTMLButtonElement;


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
    const rows    = 9;
    const columns = 9;
    const mines   = 18;

    const field = new Field(rows, columns, mines);
    field.generateCells().render();

    /*
        // for test
        const m  = document.getElementById('mine')! as HTMLButtonElement;
        m.addEventListener('click', () => field.showMines());
        const re  = document.getElementById('re')! as HTMLButtonElement;
        re.addEventListener('click', () => field.render());
    */
  }

function playMiddle() {
    const rows    = 18;
    const columns = 18;
    const mines   = 36;

    const field = new Field(rows, columns, mines);
    field.generateCells().render();
}

function playLarge() {
    const rows    = 36;
    const columns = 36;
    const mines   = 130;

    const field = new Field(rows, columns, mines);
    field.generateCells().render();
}

function playUltra() {
    const rows    = 130;
    const columns = 130;
    const mines   = 1600;

    const field = new Field(rows, columns, mines);
    field.generateCells().render();
}
