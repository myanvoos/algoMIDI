import {Ref} from "vue";
import {Cell} from "../types/types";

interface P5CanvasConfig {
    width: number
    height: number
    frameRate: number
    backgroundColor: string
}

interface P5CanvasOptions {
    currentCells: Ref<Cell[][]>
    rowCount: Ref<number>
    columnCount: Ref<number>
    onCellToggled: (payload: { noteId: string; isOn: boolean}) => void
}

export function useP5Canvas(options: P5CanvasOptions) {
    const p5Instance = ref<P5CanvasInstance | null>(null);
    const cellSize = ref(0);

    const initCanvas = (config: P5CanvasConfig) => {
        const sketch = (p5: P5CanvasInstance) => {
            p5.setup = () => {
                p5.createCanvas(config.width, config.height)
                    .mouseClicked(() => handleMouseClick(p5));
                p5.frameRate(config.frameRate);
                p5.background(config.backgroundColor);

                cellSize.value = Math.floor(config.width / options.columnCount.value);
                p5.noLoop();
            };

            p5.draw = () => {
                p5.background(config.backgroundColor);
                drawGrid(p5);
            };
        };

        p5Instance.value = new p5(sketch);
    };

    const drawGrid = (p5: P5CanvasInstance) => {
        if (!p5) return;

        p5.stroke('slategray');
        p5.textAlign(p5.CENTER, p5.CENTER);
        p5.textSize(cellSize.value / 3);

        options.currentCells.value.forEach((row, rowIndex) => {
            row.forEach((cell, colIndex) => {
                const currentColumn = colIndex % options.columnCount.value;

                p5.fill(cell.isOn ?
                    (cell.isRightmostChild ? 'lightskyblue' : '#213547') :
                    'white'
                );

                p5.square(
                    currentColumn * cellSize.value,
                    rowIndex * cellSize.value,
                    cellSize.value
                );

                if (cell.isOn) {
                    p5.fill(cell.isRightmostChild ? '#213547' : 'white');
                    p5.text(
                        cell.note.id,
                        currentColumn * cellSize.value + cellSize.value / 2,
                        rowIndex * cellSize.value + cellSize.value / 2
                    );
                }
            });
        });
    };

    const handleMouseClick = (p5: P5CanvasInstance) => {
        const row = Math.floor(p5.mouseY / cellSize.value);
        if (row < 0 || row >= options.rowCount.value) return;

        let adjustedMouseX = p5.mouseX;
        if (adjustedMouseX < 0) {
            adjustedMouseX += options.columnCount.value * cellSize.value;
        }

        const column = Math.floor(adjustedMouseX / cellSize.value) %
            options.columnCount.value;
        if (column < 0 || column >= options.columnCount.value) return;

        const cell = options.currentCells.value[row][column];
        cell.isOn = !cell.isOn;

        options.onCellToggled({
            noteId: cell.note.id,
            isOn: cell.isOn
        });

        p5.redraw();
    };

    return {
        p5Instance,
        initCanvas,
        drawGrid,
        handleMouseClick
    };
}