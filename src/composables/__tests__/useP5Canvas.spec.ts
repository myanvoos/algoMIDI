import {useP5Canvas} from "../useP5Canvas.ts"

jest.mock('p5', () => {
    return jest.fn().mockImplementation(() => ({
        setup: jest.fn(),
        draw: jest.fn()
    }))
})

describe('useP5Canvas', () => {
    let container: HTMLElement | null

    beforeEach(() => {
        container = document.createElement('div')
    })

    afterEach(() => {
        jest.clearAllMocks()
    });

    it('initialises the p5 canvas with the provided container', () => {
        const { p5Instance, initCanvas } = useP5Canvas()
        const sketch = jest.fn()
        initCanvas(sketch, container)

        expect(p5Instance.value).not.toBeNull()
        expect(p5Instance.value?.setup).toBeDefined()
        expect(p5Instance.value?.draw).toBeDefined()
    })

    it('logs error if container is null', () => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
        const { initCanvas } = useP5Canvas()

        initCanvas(jest.fn(), null)

        expect(consoleSpy).toHaveBeenCalledWith('Canvas container element is null.')
        consoleSpy.mockRestore()
    })
})
