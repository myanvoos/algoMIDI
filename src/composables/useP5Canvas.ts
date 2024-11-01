import { ref } from 'vue';
import p5 from 'p5';

export function useP5Canvas() {
    const p5Instance = ref<p5 | null>(null);
    const initCanvas = (sketch: (p: p5) => void, container: HTMLElement | null) => {
        if (container) {
            p5Instance.value = new p5(sketch, container);
        } else {
            console.error('Canvas container element is null.');
        }
    };
    return {
        p5Instance,
        initCanvas,
    };
}
