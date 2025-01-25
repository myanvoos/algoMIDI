// types/types.ts

import { Note } from "@tonejs/midi/dist/Note";
import {ref} from "vue";

export interface AutomataConfig {
    gridSize: number;
    scale: "major" | "minor" | "chromatic";
    rootNote: string;
    rules: string;
}

export interface P5CanvasConfig {
    width: number
    height: number
    frameRate: number
    backgroundColour: string
}

export interface P5CanvasOptions {
    currentCells: Cell[][]
    rowCount: number
    columnCount: number
    onCellToggled: (payload: { note: Note; isOn: boolean}) => void
}

export interface Cell {
    note: Note;
    isOn: boolean;
    isRightmostChild: boolean;
}
