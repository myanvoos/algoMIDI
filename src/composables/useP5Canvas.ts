import p5 from "p5";
import { type Ref, onUnmounted, ref } from "vue";

export interface P5CanvasConfig {
	width: number;
	height: number;
	frameRate: number;
	backgroundColour: string;
	canvasContainer: HTMLElement | null;
}

interface RenderCallbacks {
	onDraw?: (p5: p5) => void;
	onMouseClicked?: (p5: p5) => void;
	beforeLoop?: () => void;
	afterLoop?: () => void;
}

export function useP5Canvas() {
	const p5Instance = ref<p5 | null>(null);

	const createSketch = (
		config: Ref<P5CanvasConfig>,
		callbacks: RenderCallbacks,
	) => {
		return (p5: p5) => {
			p5.setup = () => {
				console.log("Setup running with config:", {
					width: config.value.width,
					height: config.value.height,
					container: config.value.canvasContainer,
				});

				const canvas = p5.createCanvas(config.value.width, config.value.height);
				canvas.parent(config.value.canvasContainer!);
				canvas.mouseClicked(callbacks.onMouseClicked || (() => {}));

				p5.frameRate(config.value.frameRate);
				p5.background(config.value.backgroundColour);
				p5.noLoop();
			};

			p5.draw = () => {
				p5.background(config.value.backgroundColour);
				callbacks.beforeLoop?.();
				callbacks.onDraw?.(p5);
				callbacks.afterLoop?.();
			};
		};
	};

	const cleanup = () => {
		if (p5Instance.value) {
			p5Instance.value.remove();
			p5Instance.value = null;
		}
	};
	const initCanvas = (
		sketch: (p: p5) => void,
		container: HTMLElement | null,
	) => {
		cleanup();
		if (container) {
			try {
				p5Instance.value = new p5(sketch, container);
			} catch (error) {
				console.error("Failed to initialize p5 canvas:", error);
			}
		} else {
			console.error("Canvas container element is null.");
		}
	};

	onUnmounted(cleanup);

	return {
		p5Instance,
		initCanvas,
		createSketch,
	};
}
