import { ImageObject, LineObject, ArcObject, RectObject, TextObject } from "./type-objects";
import { Point } from "./type-objects";

export class ObjectsRendering {
	protected constructor (private context: CanvasRenderingContext2D) {}
	protected ObjectsRendering (offset: [number, number] = [ 0, 0 ]) {
		const context = this.context;
		return {
			ImageObject (image: ImageObject) {
				// Код отрисовки изображения (ImageObject)
				context.drawImage(
					image.bitmap,
					offset[0] + image.position[0],
					offset[1] + image.position[1],
					...image.size
				);
			},

			LineObject (line: LineObject) {
				// Код отрисовки линии по точкам (Point, LineObject)
				// Функция для отрисовки линии (массива точек) на холсте (визуализация)
				const drawLine = (path: Point[]) => {
					context.beginPath();

					// Установка карсора и/или отрисовка линии от/до точки
					for (let i = 0; i < path.length; i++) {
						if (i === 0) context.moveTo(offset[0] + path[i][0], offset[1] + path[i][1]);
						else context.lineTo(offset[0] + path[i][0], offset[1] + path[i][1]);
					}

					// Создание контура и заливка фигуры
					context.stroke();
					if (line.fillStyle) context.fill();

					context.closePath();
				};

				// Проверка на количество путей для отрисовки в элемента (один или несколько)
				if (typeof line.path[0][0] == "number") drawLine(line.path as Point[]);
				else for (const path of line.path as Point[][]) drawLine(path);
			},

			ArcObject (arc: ArcObject) {
				// Код отрисовки окружности (ArcObject)
				context.beginPath();
				context.arc(
					offset[0] + arc.position[0],
					offset[1] + arc.position[1],
					arc.radius,
					arc.angleFrom, // Начальный угол
					arc.angleTo, // Конечный угол
					arc.antiClockwise || false
				);

				// Создание контура и заливка окружности
				context.stroke();
				if (arc.fillStyle) context.fill();

				context.closePath();
			},

			RectObject (rect: RectObject) {
				// Код отрисовки прямоугольника (RectObject)
				context.beginPath();
				context.rect(
					offset[0] + rect.position[0],
					offset[1] + rect.position[1],
					...rect.size
				);

				if (rect.fillStyle || (!rect.strokeStyle && !rect.fillStyle)) context.fill();
				if (rect.strokeStyle) context.stroke();

				context.closePath();
			},

			TextObject (text: TextObject) {
				// Код отрисовки текста (TextObject)
				context.beginPath();
				for (const line of text.text) {
					// Создание параметра шрифта из размера шрифта и его вида
					const font = `${typeof text.fontSize == "number"
						? text.fontSize + "px"
						: text.fontSize} ${text.fontFamily}`;

					// Установка шрифта и ширины линии
					if (font) context.font = font;
					if (text.lineWidth) context.lineWidth = text.lineWidth;

					context.textBaseline = text.baseline;
					context.textAlign = text.align;
					// Аргументы функции отрисовки текста на холста
					const drawOptions: [string, number, number, number | undefined] = [
						line,
						offset[0] + text.position[0],
						offset[1] + text.position[1],
						text.maxWidth
					];

					// Отрисовка текста и/или контура (если ничего из этого не задано, отрисовывается текст)
					if (text.strokeStyle) context.strokeText(...drawOptions);
					if (text.fillStyle || (!text.fillStyle && !text.strokeStyle))
						context.fillText(...drawOptions);
				}

				context.closePath();
			}
		};
	}
}
