export interface MidiEvent {
    time: number;
    note: string;
    type: 'noteOn' | 'noteOff';
    trackName: string;
    channel: number;
}
