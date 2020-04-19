import CoreOfRendering, { Layer } from "./rendering-core";

class publicLayersController {
	public readonly backgroundLayer: Layer;
	public readonly charactersLayer: Layer;
	public readonly interfaceLayer: Layer;

	constructor (private readonly core: CoreOfRendering) {
		this.backgroundLayer = core.Layers.Add(0);
		this.charactersLayer = core.Layers.Add(1);
		this.interfaceLayer = core.Layers.Add(2);
	}
}

export default class Engine {
	private readonly coreOfRendering: CoreOfRendering;
	public readonly Layers: publicLayersController;

	constructor (rootElement: Element, defaultColor: string = "#111") {
		const { innerWidth: width, innerHeight: height } = window;

		this.coreOfRendering = new CoreOfRendering(width, height, defaultColor);
		rootElement.append(this.coreOfRendering.canvasContext.canvas);

		this.Layers = new publicLayersController(this.coreOfRendering);
	}
}
