import RenderingCore, { TextObject } from "./engine/rendering-core";

window.addEventListener("load", async () => {
	const core = new RenderingCore(820, 550);
	document.body.append(core.canvasContext.canvas);

	const layer = core.Layers.Add();
	const image = await core.ImageLoader.LoadImage("2.jpg");
	const text = new TextObject("Hello world", {
		x: 0,
		y: 100,
		font: "69px Arial",
		textAlign: "center"
	});

	layer.Draw(image, text);
});
