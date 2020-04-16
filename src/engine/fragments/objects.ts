// Параметры цвета заливки, контура и альфа-канала
type VisualOptions = Partial<{ strokeColor: string; fillColor: string; alpha: number }>;

// Параметры тени объекта
type ObjectShadowOptions = {
	shadow?: Partial<{
		blur: number;
		color: string;
		offset: [number, number]; // Отступ тени (по X и Y соответственно)
	}>;
};

export type AnyItem = ImageObject | LineObject | ArcObject | TextObject | null;

// Класс (тип) для загружаемых изображений
export class ImageObject {
	constructor (
		public readonly html: HTMLImageElement,
		public readonly options: {
			width: number;
			height: number;
			top: number;
			left: number;
		} & { alpha?: number } & ObjectShadowOptions
	) {}
}

export type Point = [number, number]; // Точка линии

// Класс для обозначения объекта линии
export class LineObject {
	public readonly options: VisualOptions & ObjectShadowOptions;

	constructor (public linePath: Readonly<Point[] | Point[][]>, options: VisualOptions) {
		type T = "strokeColor" | "fillColor" | "alpha";

		this.options = options;
		for (const key of [ "strokeColor", "fillColor", "alpha" ] as T[]) {
			if (key in this.options) return;
			if (key == "alpha") this.options[key] = 1;
			else this.options[key] = "#fff";
		}
	}
}

// Класс для обозначения объекта окружности
export class ArcObject {
	constructor (
		public x: number, // Координаты окружности на холсте
		public y: number,
		public readonly options: {
			radius: number;
			angleFrom: number; // Начальный угол
			angleTo: number; // Конечный угол
			clockwise?: boolean;
		} & VisualOptions &
			ObjectShadowOptions
	) {}
}

// Класс для обозначения объекта текста
export class TextObject {
	constructor (
		public text: string,
		public readonly options: Partial<{
			font: string;
			lineWidth: number;
			maxWidth: number;
			textAlign: CanvasTextAlign;
		}> & { x: number; y: number } & VisualOptions &
			ObjectShadowOptions
	) {}
}
