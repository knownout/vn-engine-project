import { ImageLoader, IImageElement } from "./fragments/loaders";

class Core {
	// TODO: Заменить на защищенный тип (будет наследоваться движком)
	public readonly canvasContext: CanvasRenderingContext2D;
	public readonly LoadImage: typeof ImageLoader.prototype.LoadImage;

	private readonly layersList: (IImageElement | null)[] = [];

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
	public get Layers () {
		// Перерисовывает изображения из всех слоёв
		const redrawLayers = () => {
			for (let image of this.layersList) if (image) this.DrawImage(image);
			return this;
		};

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
				return redrawLayers();
			},
			// Очищает указанный слой
			Clean: (index: number) => {
				this.layersList[index] = null;
				return redrawLayers();
			}
		};
	}

	public DrawImage (image: IImageElement, layer: number = 0) {
		// Проверяем, существует ли заданный слой
		if (this.layersList[layer] === undefined)
			throw new Error("Layer with given index did not exist");

		// Изменяем содержимое слоя на указанное изображение
		this.layersList[layer] = image;

		// Полностью очищаем холст
		this.canvasContext.clearRect(
			0,
			0,
			this.canvasContext.canvas.width,
			this.canvasContext.canvas.height
		);

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

		// Создание копии массива слоёв и удаление из этой копии текущего слоя
		const localLayersList = [ ...this.layersList ];
		localLayersList.splice(layer, 1);

		// Получение слоёв, идущих до и после текущего слоя
		const downLayers = localLayersList.slice(0, layer);
		const upperLayers = localLayersList.slice(layer, localLayersList.length);

		// Отрисовка слоёв, идущих до текущего
		for (const image of downLayers) if (image) drawImage(image);
		drawImage(image); // Отрисовка содержимого текущего слоя

		for (const image of upperLayers) if (image) drawImage(image);
	}
}

window.addEventListener("load", async () => {
	let core = new Core(420, 240);
	document.body.append(core.canvasContext.canvas);

	let top = core.Layers.Add();

	let image = await core.LoadImage("1.jpg");
	image.alpha = 1;

	core.DrawImage(image, top);
});
