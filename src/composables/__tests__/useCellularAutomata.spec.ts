import { useCellularAutomata } from '../useCellularAutomata'

describe('useCellularAutomata', () => {
    const mockGridSize = 5
    const mockScale = 'major'
    const mockRootNote = 'C'

    it('initialises the grid with correct dimensions', () => {
        const { rowCount, columnCount } = useCellularAutomata({
            gridSize: mockGridSize,
            scale: mockScale,
            rootNote: mockRootNote,
        })

        expect(rowCount.value).toBe(mockGridSize)
        expect(columnCount.value).toBe(mockGridSize)
    })

    it('updates the automata according to neighbour count', () => {
        const { currentCells, updateAutomata } = useCellularAutomata({
            gridSize: 4,
            scale: mockScale,
            rootNote: mockRootNote,
        })

        currentCells.value[0][0].isOn = true
        currentCells.value[0][1].isOn = true
        currentCells.value[0][2].isOn = true

        updateAutomata()

        expect(currentCells.value[0][1].isOn).toBe(true)
        expect(currentCells.value[1][1].isOn).toBe(true)
        expect(currentCells.value[2][1].isOn).toBe(false)
        expect(currentCells.value[0][0].isOn).toBe(false)
        expect(currentCells.value[0][2].isOn).toBe(false)
        expect(currentCells.value[1][0].isOn).toBe(false)

        expect(currentCells.value[1][2].isOn).toBe(false)
        expect(currentCells.value[3][0].isOn).toBe(false)
        expect(currentCells.value[3][1].isOn).toBe(true)
        expect(currentCells.value[3][2].isOn).toBe(false)
        expect(currentCells.value[3][3].isOn).toBe(false)

    })

    it('sets isRightmostChild flag on the correct cell', () => {
        const { currentCells, updateAutomata } = useCellularAutomata({
            gridSize: 3,
            scale: mockScale,
            rootNote: mockRootNote,
        })

        currentCells.value[1][0].isOn = true
        currentCells.value[1][1].isOn = true
        currentCells.value[1][2].isOn = true

        updateAutomata()

        expect(currentCells.value[1][1].isRightmostChild).toBe(false)
        expect(currentCells.value[1][0].isRightmostChild).toBe(false)
    })

    it('correctly counts neighbours in a toroidal grid', () => {
        const { currentCells, countNeighbours } = useCellularAutomata({
            gridSize: 3,
            scale: mockScale,
            rootNote: mockRootNote,
        })

        currentCells.value[0][0].isOn = true
        currentCells.value[0][2].isOn = true
        currentCells.value[2][0].isOn = true

        const count = countNeighbours(0, 1)
        expect(count).toBe(3)
    })

    it('returns active notes after update', () => {
        const { currentCells, updateAutomata } = useCellularAutomata({
            gridSize: 3,
            scale: mockScale,
            rootNote: mockRootNote,
        })

        currentCells.value[0][0].isOn = true
        currentCells.value[0][1].isOn = true
        currentCells.value[0][2].isOn = true

        const activeNotes = updateAutomata()
        expect(activeNotes.size).toBeGreaterThan(0)
        expect(activeNotes.has(currentCells.value[2][1].note.id)).toBe(true)
    })

    it('clears rightmost flags before each update', () => {
        const { currentCells, updateAutomata } = useCellularAutomata({
            gridSize: 3,
            scale: mockScale,
            rootNote: mockRootNote,
        })

        currentCells.value[1][2].isOn = true
        currentCells.value[1][2].isRightmostChild = true

        updateAutomata()
        expect(currentCells.value[1][2].isRightmostChild).toBe(false)
    })
})
