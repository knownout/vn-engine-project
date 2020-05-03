// Подключение контроллеров (иодулей ядра)
import { LayersController, Layer } from "./modules/layers-controller";
import { PicturesController, Align } from "./modules/images-controller";
import { DrawablesController } from "./modules/drawables-controller";

// Подключение базовых объектов и общего типа Drawable
import { Picture, Drawable, Text, Rect, Circle } from "./modules/drawable-objects";

/** Ядро базовой функциональности отрисовки фигур на холсте */
export default class CoreOfDrawing extends DrawablesController {
	public readonly canvasContext: CanvasRenderingContext2D; //# private
	private layersList: Layer[];
	private picturesController: PicturesController;

	/**
	 * Модуль управления слоями холста. Испольхуется для создания, удаления и изменения
	 * виртуальных слоёв заданного ядром холста
	 */
	public Layers: LayersController;

	/**
	 * @param width ширина отрисовываемого холста
	 * @param height высота отрисовываемого холста
	 * @param defaultColor стандартный цвет заднего фона холста
	 */
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
		this.redrawFunction = this.redrawFunction.bind(this);
		this.canvasContext = context;

		// Инициализация вспомогательных классов (модулей) ядра
		this.Layers = new LayersController(this.layersList, this.redrawFunction);
		this.picturesController = new PicturesController(width, height);

		this.picturesController.LoadPicture = this.picturesController.LoadPicture.bind(
			this.picturesController
		);
	}

	/**
	 * Метод для загрузки и изменения размеров относительно заданных размеров холста спрайта персонажа
	 * @param link ссылка (URL) на изображение
	 * @param loadAsCharacter если true, изображение загружается как спрайт (текущее состояние)
	 */
	public async LoadPicture (link: string, loadAsCharacter: true): Promise<Picture>;

	/**
	 * Метод для загнрузки изображения и изменения размера относительно заданных размеров холста
	 * @param link ссылка (URL) на изображение
	 * @param align выравнивание изображения относительно холста в случаях, когда изображение
	 * выходит за границы холста
	 */
	public async LoadPicture (link: string, align: Partial<Align>): Promise<Picture>;

	/**
	 * Метод для загнрузки изображения и изменения размера относительно заданных размеров холста
	 * @param link ссылка (URL) на изображение
	 */
	public async LoadPicture (link: string): Promise<Picture>;
	public async LoadPicture (link: string, argData?: true | Partial<Align>) {
		if (typeof argData == "boolean")
			return await this.picturesController.LoadPicture(link, true);
		else {
			if (argData) return await this.picturesController.LoadPicture(link, argData);
			return await this.picturesController.LoadPicture(link);
		}
	}

	/** Метод для отрисовки (перерисовки) холста */
	private redrawFunction () {
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
			this.canvasContext.rotate(layer.getRotation());

			for (const item of layer.Get()) {
				// Установка стиля (контур и заливка) отрисовки и прозрачности для текущего объекта
				this.canvasContext.globalAlpha = item.getTransparency();
				this.canvasContext.strokeStyle = item.getStrokeStyle();
				this.canvasContext.fillStyle = item.getFillStyle();

				// Установка значений параметров тени текущего объекта
				this.canvasContext.shadowColor = item.getShadowColor();
				this.canvasContext.shadowBlur = item.getShadowBlur();
				[
					this.canvasContext.shadowOffsetX,
					this.canvasContext.shadowOffsetY
				] = item.getShadowOffset();

				// Отрисовка объекта в зависимости от его типа (Drawable или Person)
				this.drawObject(item, layer.getOffset());
			}
		}

		// Восстановление сохранённых значений для изменямых параметров холста
		for (const key in savedCanvasProperties)
			(this.canvasContext as any)[key] = savedCanvasProperties[key];
	}
}
