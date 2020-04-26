import "normalize.css";
import "./styles.less";

import CoreOfDrawing from "./drawing-core";

window.addEventListener("load", async () => {
	const root = document.querySelector("div#root") as HTMLElement;
	const core = new CoreOfDrawing(window.innerWidth, window.innerHeight);

	root.append(core.canvasContext.canvas);
});
