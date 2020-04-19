import "normalize.css";
import "./styles.less";

import Engine from "./engine";
window.addEventListener("load", async () => {
	const engine = new Engine(document.querySelector("#root") as HTMLElement);
});
