type CanvasStyles = string | CanvasGradient | CanvasPattern;
export type AnyObject = ImageObject | LineObject | RectObject | ArcObject | TextObject;
export type Point = [number, number];

export class ImageObject {
	constructor (
		public readonly bitmap: ImageBitmap,
		public size: [number, number],
		public position: [number, number] = [ 0, 0 ],
		public alpha?: number
	) {}
}

export class LineObject {
	constructor (
		public path: Point[][] | Point[],
		public strokeStyle?: CanvasStyles | null,
		public fillStyle?: CanvasStyles | null,
		public alpha?: number | null
	) {}
}

export class RectObject {
	constructor (
		public size: [number, number],
		public position: [number, number] = [ 0, 0 ],
		public strokeStyle?: CanvasStyles | null,
		public fillStyle?: CanvasStyles | null,
		public alpha?: number | null
	) {}
}

export class ArcObject {
	constructor (
		public radius: number,
		public position: [number, number] = [ 0, 0 ],
		public angleFrom: number = 0,
		public angleTo: number = Math.PI * 2,
		public antiClockwise: boolean | undefined = false,
		public strokeStyle?: CanvasStyles | null,
		public fillStyle?: CanvasStyles | null,
		public alpha?: number | null
	) {}
}

export class TextObject {
	constructor (
		public text: string[] | string,
		public position: [number, number] = [ 0, 0 ],
		public fontSize: number | string = "16px",
		public fontFamily: string = "Arial",
		public lineWidth: number = 1,
		public maxWidth: number = window.innerWidth,
		public baseline: CanvasTextBaseline = "alphabetic",
		public align: CanvasTextAlign = "left",
		public strokeStyle?: CanvasStyles | null,
		public fillStyle?: CanvasStyles | null,
		public alpha?: number | null
	) {
		if (!Array.isArray(this.text)) this.text = this.text.split("\n");
	}
}
