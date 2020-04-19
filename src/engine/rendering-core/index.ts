import LayersController, { Layer } from "./modules/layers-controller";
import { ImageLoader } from "./modules/image-loader";

import { ObjectsRendering } from "./modules/objects-rendering";

export default class CoreOfRendering extends ObjectsRendering {
	public readonly canvasContext: CanvasRenderingContext2D;
	private layersList: Layer[];

	public Layers: LayersController;
	public ImageLoader: ImageLoader;

	constructor (width: number, height: number, defaultColor = "#111") {
		// Создание элемента слоя и получение контекста
		const canvas = document.createElement("canvas");
		const context = canvas.getContext("2d") as CanvasRenderingContext2D;

		// Инициализация класса отрисовки объектов
		super(context);

		// Установка начального размера и стилей холста
		canvas.width = width;
		canvas.height = height;

		canvas.style.width = `${width}px`;
		canvas.style.backgroundColor = defaultColor;
		canvas.style.height = `${height}px`;

		// Установка начальных параметров ядра
		this.layersList = [];
		this.emitRedraw = this.emitRedraw.bind(this);
		this.canvasContext = context;

		// Инициализация вспомогательных классов (модулей) ядра
		this.Layers = new LayersController(this.layersList, this.emitRedraw);
		this.ImageLoader = new ImageLoader(width, height);
	}

	// Метод для отрисовки (перерисовки) холста
	private emitRedraw () {
		// Сохранение всех изменяемых параметров холста в новый объект
		const savedCanvasProperties: {
			[key: string]: string | number | boolean | CanvasGradient | CanvasPattern;
		} = {};
		for (const key in this.canvasContext) {
			const propertyOfContext = this.canvasContext[key as keyof CanvasRenderingContext2D];

			// Методы и элемент холста не входят в список изменямых
			if (typeof propertyOfContext !== "function" && key != "canvas")
				savedCanvasProperties[key] = propertyOfContext as Exclude<
					CanvasRenderingContext2D,
					HTMLCanvasElement
				>;
		}

		/*  Полная очистка слоя неэффективна, но необходима, 
			так как позволяет корректно использовать наложение 
			слоёв без комплексных вычислений и создания 
			дополнительных холстов  */
		this.canvasContext.clearRect(
			0,
			0,
			this.canvasContext.canvas.width,
			this.canvasContext.canvas.height
		);

		// Перебор всех слоёв и поочередная отрисовка объектов каждого из них
		for (const layer of this.layersList) {
			// Установка начального разворота холста для текущего слоя
			this.canvasContext.rotate(layer.Rotate() || 0);

			for (const item of layer.Get()) {
				// Установка стиля (контур и заливка) отрисовки и прозрачности для текущего объекта
				if ("fillStyle" in item) this.canvasContext.fillStyle = item.fillStyle || "#000";
				if ("strokeStyle" in item)
					this.canvasContext.strokeStyle = item.strokeStyle || "#000";

				if (item.alpha != null) this.canvasContext.globalAlpha = item.alpha;

				/*  Отрисовка объекта по его имени конструктора (имя конструктора 
					эквивалентно названию класса, таким образом 
					ImageObject.contructor.name == "ImageObject"). 
					
					Такой подход является более компактной 
					альтернативой instanceof  */
				this.ObjectsRendering(layer.Offset())[
					item.constructor.name as
						| "ImageObject"
						| "TextObject"
						| "LineObject"
						| "ArcObject"
						| "RectObject"
				](item as any);
			}
		}

		// Восстановление сохранённых значений для изменямых параметров холста
		for (const key in savedCanvasProperties)
			(this.canvasContext as any)[key] = savedCanvasProperties[key];
	}
}

export { Layer };
