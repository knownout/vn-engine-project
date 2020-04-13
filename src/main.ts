import { ImageLoader, IImageElement } from "./fragments/loaders";
import { linearFadeEffect } from "./fragments/effects";

type Point = [number, number] | [number, number, number, number, number, boolean];
type LayerElement = IImageElement | Path | null;
type Path = { color: string; fill?: string; alpha?: number; path: Point[] | Point[][] };
type RectOptions = {
	x: number;
	y: number;
	width: number;
	height: number;
	alpha?: number;
	fill?: string;
	stroke?: string;
};

class Core {
	// TODO: Заменить на защищенный тип (будет наследоваться движком)
	public readonly canvasContext: CanvasRenderingContext2D;
	public readonly LoadImage: typeof ImageLoader.prototype.LoadImage;

	private readonly layersList: LayerElement[] = [];

	public constructor (width: number, height: number) {
		// Создание холста и установка CSS стилей
		const canvasElement = document.createElement("canvas");

		canvasElement.style.backgroundColor = "#111";
		canvasElement.style.width = `${width}px`;
		canvasElement.style.height = `${height}px`;

		// Получение контекста холста и установка размера
		const canvasContext = canvasElement.getContext("2d") as CanvasRenderingContext2D;

		canvasContext.canvas.width = width;
		canvasContext.canvas.height = height;

		this.canvasContext = canvasContext;

		// Инициализация загрузчика и добавление функции загрузки к публичным
		const imageLoader = new ImageLoader(canvasContext);
		this.LoadImage = imageLoader.LoadImage.bind(imageLoader);
	}

	// Метод управления слоями
	// TODO: Сделать управление для каждого слоя отдельно (core.Layers.Get(0).DrawImage(...))
	// TODO: Добавить возможность изменения положения слоя (core.(...).Position(x, y) && PositionX(x) ...)
	public get Layers () {
		return {
			// Добавляет новый слой и возвращает его индекс
			Add: () => {
				this.layersList.push(null);
				return this.layersList.length - 1;
			},
			Get: (index: number) => this.layersList[index], // Возвращает содержимое слоя
			// Удаляет указанный слой со сдвигом индексов
			Remove: (index: number) => {
				this.layersList.splice(index, 1);
				return this.redrawLayers(this.layersList);
			},
			// Очищает указанный слой
			Clean: (index: number) => {
				this.layersList[index] = null;
				return this.redrawLayers(this.layersList);
			},

			Redraw: () => {
				this.redrawLayers(this.layersList);
			}
		};
	}

	// Метод для перерисовки всех слоёв холста
	private redrawLayers (layers: LayerElement[]) {
		// Полностью очищаем холст
		if (layers.length > 0)
			this.canvasContext.clearRect(
				0,
				0,
				this.canvasContext.canvas.width,
				this.canvasContext.canvas.height
			);

		layers.forEach((layer, index) => {
			if (layer) {
				// Проверка на тип элемента на холсте (картинка или путь)
				if ("html" in layer) this.DrawImage(layer, index, false);
				else if ("path" in layer) this.DrawPath(layer, index, false);
			}
		});
	}

	public DrawImage (image: IImageElement, layer: number = 0, updateLayers = true) {
		// Проверяем, существует ли заданный слой
		if (this.layersList[layer] === undefined)
			throw new Error("Layer with given index did not exist");

		// Изменяем содержимое слоя на указанное изображение
		this.layersList[layer] = image;

		// Функция для отрисовки изображения на холсте
		const drawImage = (image: IImageElement) => {
			this.canvasContext.globalAlpha = image.alpha;
			this.canvasContext.drawImage(
				image.html,
				image.left,
				image.top,
				image.width,
				image.height
			);

			this.canvasContext.globalAlpha = 1;
		};

		// Отрисовка слоёв, идущих до текущего
		drawImage(image); // Отрисовка содержимого текущего слоя

		if (updateLayers) this.redrawLayers(this.layersList);
		return this;
	}

	public DrawPath (path: Path, layer: number = 0, updateLayers = true) {
		if (this.layersList[layer] === undefined)
			throw new Error("Layer with given index did not exist");

		type SinglePath = { color: string; fill?: string; alpha?: number; path: Point[] };
		this.layersList[layer] = path;

		// Сокращение для контекста
		const ctx = this.canvasContext;

		// Функция отрисовки пути по точкам
		const drawPath = (path: SinglePath) => {
			if (path.alpha) ctx.globalAlpha = path.alpha;

			ctx.beginPath();
			path.path.forEach((point, index) => {
				// Если первый элемент - окружность, то она отрисовывается вместо установки точки
				if (index == 0 && point.length == 2) ctx.moveTo(point[0], point[1]);
				else {
					ctx.strokeStyle = path.color;

					// Отрисовка линии или окружности
					if (point.length == 2) ctx.lineTo(...point);
					else ctx.arc(...point);
				}
			});

			// Заливка получившейся фигуры
			if (path.fill) {
				const beginFillStyle = ctx.fillStyle;

				ctx.fillStyle = path.fill;
				ctx.fill();

				ctx.fillStyle = beginFillStyle;
			}

			ctx.stroke();
			ctx.closePath();

			if (path.alpha) ctx.globalAlpha = 1;
		};

		// Проверка на то, является ли путь многоуровневым
		if (Array.isArray(path.path[0][0]))
			// Перебор массива путей и их отрисовка
			(path.path as Point[][]).forEach(p =>
				drawPath({
					color: path.color,
					fill: path.fill || undefined,
					alpha: path.alpha,
					path: p
				})
			);
		else drawPath(path as SinglePath); // Отрисовка пути

		if (updateLayers) this.redrawLayers(this.layersList);
		return this;
	}

	public DrawRect (options: RectOptions, layer: number = 0) {
		this.DrawPath(
			{
				color: options.stroke || "transparent",
				fill: options.fill,
				alpha: options.alpha,
				path: [
					[ options.x, options.y ],
					[ options.x + options.width, options.y ],
					[ options.x + options.width, options.y + options.height ],
					[ options.x, options.y + options.height ],
					[ options.x, options.y ]
				]
			},
			layer
		);
	}
}

window.addEventListener("load", async () => {
	const core = new Core(420, 240);
	document.body.append(core.canvasContext.canvas);

	const bottom = core.Layers.Add();
	const top = core.Layers.Add();
	const image = await core.LoadImage("2.jpg", { horizontal: "top", vertical: "center" });

	await linearFadeEffect(0, 1, 4500, currentValue => {
		image.alpha = currentValue;
		core.DrawImage(image, bottom);
	});

	await linearFadeEffect(0, 0.4, 500, currentValue => {
		console.log(currentValue);
		core.DrawRect(
			{ fill: "white", x: 10, y: 180, width: 400, height: 50, alpha: currentValue },
			top
		);
	});

	core.Layers.Redraw();
});
