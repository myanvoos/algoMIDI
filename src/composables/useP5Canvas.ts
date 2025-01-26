import { onUnmounted, ref } from 'vue';
import p5 from 'p5';

export function useP5Canvas() {
    const p5Instance = ref<p5 | null>(null);

    const cleanup = () => {
        if (p5Instance.value) {
            p5Instance.value.remove();
            p5Instance.value = null;
        }
    }
    const initCanvas = (sketch: (p: p5) => void, container: HTMLElement | null) => {
        cleanup()
        if (container) {
            p5Instance.value = new p5(sketch, container);
        } else {
            console.error('Canvas container element is null.');
        }
    };

    onUnmounted(cleanup)

    return {
        p5Instance,
        initCanvas,
    };
}
