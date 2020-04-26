// Подключение контроллеров (иодулей ядра)
import { LayersController, Layer } from "./modules/layers-controller";
import { PicturesController, Align } from "./modules/images-controller";
import { DrawablesController } from "./modules/drawables-controller";

// Подключение базовых объектов и общего типа Drawable
import { Picture, Drawable, Text, Rect, Path, Circle } from "./modules/drawable-objects";
// Подключение дополнительного базового объекта Person
import Person from "./modules/person-class";

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
				// Данная переменная будет изменяться для поддержки объектов типа Person
				let drawableItem = item;
				if (item instanceof Person) drawableItem = item.getCurrentSprite();

				// Установка стиля (контур и заливка) отрисовки и прозрачности для текущего объекта
				this.canvasContext.globalAlpha = item.getTransparency();
				this.canvasContext.strokeStyle = drawableItem.getStrokeStyle();
				this.canvasContext.fillStyle = drawableItem.getFillStyle();

				// Установка значений параметров тени текущего объекта
				this.canvasContext.shadowColor = item.getShadowColor();
				this.canvasContext.shadowBlur = item.getShadowBlur();
				[
					this.canvasContext.shadowOffsetX,
					this.canvasContext.shadowOffsetY
				] = item.getShadowOffset();

				// Отрисовка объекта в зависимости от его типа (Drawable или Person)
				if (item instanceof Person) {
					this.drawPerson(item, layer.getOffset());
				} else this.drawObject(item, layer.getOffset());
			}
		}

		// Восстановление сохранённых значений для изменямых параметров холста
		for (const key in savedCanvasProperties)
			(this.canvasContext as any)[key] = savedCanvasProperties[key];
	}

	/**
	 * Метод для добавления (создания) объекта персонажа
	 * @param name имя персонажа
	 * @param spritesList список спрайтов персонажа
	 * 
	 * Объект типа Person не входит в тип Drawable, однако он
	 * так же может быть отрисован на любом из слоёв
	 */
	public async AddPerson (name: string, spritesList: (string | Picture)[]) {
		// Список загруженных изображений
		const readySpritesList: Picture[] = [];

		// Проверка и звгрузка всех недостяющих изображений
		for await (const item of spritesList) {
			if (item instanceof Picture) readySpritesList.push(item);
			else readySpritesList.push(await this.LoadPicture(item, true));
		}

		// Создание нового персонажа
		const person = new Person(name, readySpritesList, this.redrawFunction);
		return person;
	}

	/**
	 * Метод для получение числовой позиции объекта из названия позиции
	 * @param object объект, относительно которого производятся вычисления
	 * @param pos название позиции, числовое представление 
	 * которой нужно получить
	 * 
	 * Данный метод необходим для более короткой записи при необходимости
	 * смещения прямоугольных фигур относительно определенных точек пространства 
	 * и незамени при изменении позиции объектов, не поддерживающих
	 * вычисление размера напрямую
	 */
	public GetPositionFromName (
		object: Drawable | Person,
		pos: "center-x" | "center-y" | "left" | "top" | "right" | "bottom"
	) {
		// Ширина и высота текущего слоя
		const { width, height } = this.canvasContext.canvas;

		/**
		 * Функция для вычисления числового представления позиции на основе
		 * данных о ширине и высоте текущего объекта
		 * @param objectWidth ширина текущего объекта
		 * @param objectHeight высота текущего объекта
		 */
		const calculateSize = (objectWidth: number, objectHeight: number) => {
			if ([ "left", "top" ].includes(pos)) return 0;

			if (pos == "bottom") {
				return height - objectHeight;
			} else if (pos == "right") return width - objectWidth;

			if (pos == "center-x") return width / 2 - objectWidth / 2;
			return this.canvasContext.canvas.height / 2 - objectHeight / 2;
		};

		// Вычисление размеров (ширины и высоты) текущего объекта
		switch (object.constructor.name) {
			// Для фигур типа Rect, Person и Picture существует встроенный размер
			case "Rect":
				return calculateSize(...(object as Rect).getSize());
			case "Person":
				return calculateSize(...(object as Person).getCurrentSprite().getSize());
			case "Picture":
				return calculateSize(...(object as Picture).getSize());

			/*  Для фигур, встроенный размер у которых отсутствует
				точность вычисления размера падает, однако вычисление
				размера всё еще остаётся возможным  */
			case "Path":
				let obj = object as Path;

				// Очень низкая точность вычисления
				// TODO: если возможно, необходимо заменить формулу
				const bottomPoint = obj.getPath()[Math.ceil(obj.getPath().length / 2)];
				return calculateSize(
					bottomPoint[0] - obj.getPath()[0][0],
					bottomPoint[1] - obj.getPath()[0][1]
				);

			case "Circle":
				// Высокая точность вычисления
				const diameter = (object as Circle).getRadius() * 2;
				return calculateSize(diameter, diameter);

			case "Text":
				// Высокая точности вычисления ширины текста
				// Однако точность вычисления высоты оставляет желать лучшего
				const longestString = (object as Text)
					.getText()
					.reduce((a, b) => (a.length > b.length ? a : b), "");

				return calculateSize(
					this.canvasContext.measureText(longestString).width,
					(object as Text).getFont()[0] + 4
				);
		}

		// В непредвиденных ситуациях метод будет взовращать -1
		return -1;
	}
}
