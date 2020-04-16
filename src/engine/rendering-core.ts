import { ImageLoader } from "./fragments/resource-loaders";
import {
	ImageObject,
	LineObject,
	ArcObject,
	Point,
	TextObject,
	AnyItem
} from "./fragments/objects";
import Layer from "./fragments/layer-class";

// TODO: Написать комментарии к коду
export { ImageObject, LineObject, ArcObject, TextObject };
export default class RenderingCore {
	public readonly canvasContext: CanvasRenderingContext2D;
	public readonly ImageLoader: ImageLoader; // Экземпляр класса загрузчика изображений

	// Список слоёв, доступных для изменения
	private layersList: Layer[] = [];

	public constructor (width: number, height: number, defaultColor: string = "#111") {
		const canvasElement = document.createElement("canvas"); // Элемент холста
		const context = canvasElement.getContext("2d") as CanvasRenderingContext2D;

		// Установка размера и цвета фона холста
		canvasElement.style.width = `${width}px`;
		canvasElement.style.height = `${height}px`;

		canvasElement.style.backgroundColor = defaultColor;
		canvasElement.height = height;
		canvasElement.width = width;

		this.canvasContext = context;
		this.redrawCanvas = this.redrawCanvas.bind(this);
		this.ImageLoader = new ImageLoader(context);
	}

	// Метод перерисовки холста
	private redrawCanvas () {
		// Полная очистка холста
		this.canvasContext.clearRect(
			0,
			0,
			this.canvasContext.canvas.width,
			this.canvasContext.canvas.height
		);

		// Функция отрисовки (основная) элементов слоёв на холсте (визуализация)
		const Draw = (item: NonNullable<AnyItem>) => {
			// Установка прозрачности (альфа-канала) холста
			this.canvasContext.globalAlpha =
				item.options.alpha === undefined ? 1 : item.options.alpha;

			// Сохранение стандартных значений (заданных в самом холсте) для теней
			const beginShadowOptions = [];
			for (const prop of [ "Blur", "Color", "OffsetX", "OffsetY" ])
				beginShadowOptions.push((this.canvasContext as any)[`shadow${prop}`]);

			/*  Проверка на то, заданы ли в элементе параметры тени
				Если заданы, происходит установка параметров тени для холста  */
			if (item.options.shadow) {
				if (item.options.shadow.blur)
					this.canvasContext.shadowBlur = item.options.shadow.blur;

				// Установка параметров размытия и цвета
				for (const prop of [ "blur", "color" ])
					if ((item.options.shadow as any)[prop])
						(this.canvasContext as any)[
							`shadow${prop.charAt(0).toUpperCase() + prop.slice(1)}`
						] =
							item.options.shadow.blur;

				// Установка параметров отступа тени
				if (item.options.shadow.offset)
					[
						this.canvasContext.shadowOffsetX,
						this.canvasContext.shadowOffsetY
					] = item.options.shadow.offset;
			}

			// Проверка типа отрисовываемого элемента
			if (item instanceof ImageObject) {
				// Код отрисовки изображения (ImageObject)
				this.canvasContext.drawImage(
					item.html,
					item.options.left,
					item.options.top,
					item.options.width,
					item.options.height
				);
			} else {
				// Если не ихображение, то задаются дополнительные общие параметрых холста
				// Сохранение стандартных значений для цвета заливки и контура
				const beginStyleOptions = [
					this.canvasContext.strokeStyle,
					this.canvasContext.fillStyle
				];

				// Установка цвета заливки и контура
				this.canvasContext.strokeStyle = item.options.strokeColor || "#fff";
				this.canvasContext.fillStyle = item.options.fillColor || "#fff";

				// Проверка типа отрисовываемого элемента
				if (item instanceof LineObject) {
					// Код отрисовки линии по точкам (Point, LineObject)
					// Функция для отрисовки линии (массива точек) на холсте (визуализация)
					const drawLine = (line: Point[]) => {
						this.canvasContext.beginPath();

						// Установка карсора и/или отрисовка линии от/до точки
						for (let i = 0; i < line.length; i++) {
							if (i === 0) this.canvasContext.moveTo(...line[i]);
							else this.canvasContext.lineTo(...line[i]);
						}

						// Создание контура и заливка фигуры
						this.canvasContext.stroke();
						if (item.options.fillColor) this.canvasContext.fill();

						this.canvasContext.closePath();
					};

					// Проверка на количество путей для отрисовки в элемента (один или несколько)
					if (typeof item.linePath[0][0] == "number") drawLine(item.linePath as Point[]);
					else for (const line of item.linePath as Point[][]) drawLine(line);
				} else if (item instanceof ArcObject) {
					// Код отрисовки окружности (ArcObject)
					this.canvasContext.arc(
						item.x,
						item.y,
						item.options.radius,
						item.options.angleFrom, // Начальный угол
						item.options.angleTo, // Конечный угол
						item.options.clockwise || false
					);

					// Создание контура и заливка окружности
					this.canvasContext.stroke();
					if (item.options.fillColor) this.canvasContext.fill();
				} else if (item instanceof TextObject) {
					// Код отрисовки текста (TextObject)
					// Сохранение стандартных значений для шрифта, выравнивания текста и ширины линии
					const beginFontOptions: [string, CanvasTextAlign, number] = [
						this.canvasContext.font,
						this.canvasContext.textAlign,
						this.canvasContext.lineWidth
					];

					// Установка шрифта и ширины линии
					if (item.options.font)
						this.canvasContext.font = item.options.font || "30px Arial";
					if (item.options.lineWidth)
						this.canvasContext.lineWidth = item.options.lineWidth;

					// Аргументы функции отрисовки текста на холста
					const drawOptions: [string, number, number, number | undefined] = [
						item.text,
						item.options.x,
						item.options.y,
						item.options.maxWidth
					];

					// Отрисовка текста и/или контура (если ничего из этого не задано, отрисовывается текст)
					if (item.options.strokeColor) this.canvasContext.strokeText(...drawOptions);
					if (!(item.options.strokeColor && item.options.fillColor) || item.options)
						this.canvasContext.fillText(...drawOptions);

					// Восстановление стандартных значений холста для шрифта, выравнивания текста и ширины линии
					[
						this.canvasContext.font,
						this.canvasContext.textAlign,
						this.canvasContext.lineWidth
					] = beginFontOptions;
				}

				// Восстановление стандартных значений холста для цвета контура и заливки
				[
					this.canvasContext.strokeStyle,
					this.canvasContext.fillStyle
				] = beginStyleOptions;
			}

			// Восстановление альфа-канала (прозрачности) холста
			this.canvasContext.globalAlpha = 1;

			// Восстановление стандартных значений холста для параметров тени
			for (const prop of [ "Blur", "Color", "OffsetX", "OffsetY" ])
				(this.canvasContext as any)[`shadow${prop}`] =
					beginShadowOptions[beginShadowOptions.indexOf(prop)];

			return this;
		};

		// Отрисовка (перерисовка) всех элементов слоёв (визуализация)
		for (const layer of this.layersList)
			for (const layerItem of layer.Get()) if (layerItem) Draw(layerItem);
	}

	// Набор функций для работы со слоями холста
	public Layers = {
		// Функция получения экземпляра слоя по индексу
		Get: (index: number) => this.layersList[index] || null,

		// Функция добавления нового слоя в список
		Add: (index?: number) => {
			// Создание экземпляра слоя (нового слоя)
			const layer = new Layer([], this.redrawCanvas);

			// Вставка слоя в список слоёв с определенным индексом или в конец списка
			if (index !== undefined) {
				// Список слоёв разбивается на две части и между ними вставляется новый слой
				const endPart = this.layersList.slice(index, this.layersList.length);
				const beginPart = this.layersList.slice(0, index);

				this.layersList = [ ...beginPart, layer, ...endPart ];
			} else this.layersList.push(layer);

			return layer;
		},

		// Функция удаления слоя из списка (холст перерисовывается)
		Remove: (indexOrItem: Layer | number) => {
			// Поиск индекса слоя
			let index = indexOrItem as number;
			if (indexOrItem instanceof Layer) index = this.layersList.indexOf(indexOrItem);

			// Удаление слоя по найденному иднексу
			if (index in this.layersList) this.layersList.splice(index, 1);
			this.redrawCanvas();
		},

		// Функция очистки слоя (удаление всех элементов слоя, холст перерисовывается)
		Clean: (indexOrItem: Layer | number) => {
			// Поиск индекса слоя и его очиска (замена новым слоем)
			let index = indexOrItem as number;
			if (indexOrItem instanceof Layer) index = this.layersList.indexOf(indexOrItem);
			if (index in this.layersList) this.layersList[index] = new Layer([], this.redrawCanvas);

			this.redrawCanvas();
			return this.layersList[index];
		}
	};
}
