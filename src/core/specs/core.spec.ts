import { readFileSync } from "fs";
import * as path from "path";

import Core from "../core";

const EmptyHTMLElement = document.createElement("div") as HTMLDivElement;
describe("Core functionality test", () => {
	const executableFile = readFileSync(path.join(__dirname, "../../../public/dev/executable.json"), {
		encoding: "utf8"
	});

	const core = new Core(executableFile, EmptyHTMLElement);

	const executableObject = core.parseNovelExecutableFile();
	it("Initial data (parsing) verify", () => {
		expect(Object.keys(executableObject)).toContain("init");
		expect(Object.keys(executableObject)).toContain("screen");
	});
});
