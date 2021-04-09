import React from "react";
import ReactDOM from "react-dom";

import "normalize.css";
import "./main.less";
import Core from "./core/core";

class App extends React.Component {
	render () {
		return <ScreenVisualizerComponent />;
	}
}

class ScreenVisualizerComponent extends React.Component {
	private wrapperLayer = React.createRef<HTMLDivElement>();
	private backgroundLayer = React.createRef<HTMLDivElement>();
	private charactersLayer = React.createRef<HTMLDivElement>();
	private controlsLayer = React.createRef<HTMLDivElement>();

	render () {
		return (
			<div className="main-screen">
				<div className="layer layers-wrapper" ref={this.wrapperLayer}>
					<div className="layer bg-layer" ref={this.backgroundLayer} />
					<div className="layer chr-layer" ref={this.charactersLayer} />
					<div className="layer controls-layer controls" ref={this.controlsLayer} />
				</div>
			</div>
		);
	}

	async componentDidMount () {
		const novelExecutableFile = await fetch("http://localhost:8080/dev/executable.json").then(req =>
			req.text()
		);

		const core = new Core(novelExecutableFile, this.wrapperLayer.current as HTMLDivElement);
	}
}

ReactDOM.render(<App />, document.querySelector("main#main"));
