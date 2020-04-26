/*
    Набор стандартных (базовых) объектов

    Этот файл содержит конструкторы базовых типов (объектов)
    отрисовываемых на холсте элементов
*/

/** Тип для координат точки на холсте (x, y) */
type Point = [number, number];

/** Объединение всех возможный типов стиля объектов холста */
type CanvasStyles = string | CanvasGradient | CanvasPattern;

/*
    Системные (не экспортируемые) классы и классы объектов
*/

// Класс, содержащий свойства тени объектов
export class Shadow {
	private shadowBlur: number = 0;
	private shadowColor: string = "transparent";
	private shadowOffset: [number, number] = [ 0, 0 ];

	/** Метод для получения значения отступа тени относительн объекта */
	getShadowOffset = () => this.shadowOffset;

	/**
	 * Метод для изменения значения отступа тени относительно объекта
	 * @param x отступ по оси X
	 * @param y отсутп по оси Y
	 */
	setShadowOffset (x: number, y: number) {
		this.shadowOffset = [ x, y ];
		return this;
	}

	/** Метод для получения значения параметра цвета тени */
	getShadowColor = () => this.shadowColor;

	/**
	 * Метод для изменения значения параметра цвета тени
	 * @param color цвет тени
	 */
	setShadowColor (color: string) {
		this.shadowColor = color;
		return this;
	}

	/** Метод для получения значения параметра размытия тени */
	getShadowBlur = () => this.shadowBlur;

	/**
	 * Метод для получения значения параметра размытия тени
	 * @param blur уровень размытия тени (в пикселях)
	 */
	setShadowBlur (blur: number) {
		this.shadowBlur = blur;
		return this;
	}

	/**
	 * Метод для комплексного измнения параметров тени. Может изменить все 
	 * параметры тени за одну итерацию
	 * @param color цвет тени
	 * @param blur уровень размытия тени (в пикселях)
	 * @param x отступ по оси X
	 * @param y отсутп по оси Y
	 */
	setShadow (color: string, blur: number, offsetX?: number | null, offsetY?: number) {
		this.shadowColor = color;
		this.shadowBlur = blur;

		if (offsetX) this.shadowOffset[0] = offsetX;
		if (offsetY) this.shadowOffset[1] = offsetY;
	}
}

// Класс, содержащий свойтва родительского объекта
export class Relation extends Shadow {
	private parentObject: Drawable | null = null;

	/** Метод для получения родительского объекта */
	getParentObject = () => this.parentObject;

	/**
	 * Метод для изменения родительского объекта (для изменения привязки текущего объекта)
	 * @param object родительский объект
	 */
	setParentObject (object: Drawable | null) {
		this.parentObject = object;
		return this;
	}
}

// Класс, содержащий свойства стилей объектов холста
class DrawableObject extends Relation {
	private fillStyle: CanvasStyles = "#111";
	private strokeStyle: CanvasStyles = "transparent";
	private transparency: number = 1;
	private offset: [number, number] = [ 0, 0 ];

	/** Метод для изменения стиля заливки текущего объекта холста */
	setFillStyle (fillStyle: CanvasStyles) {
		this.fillStyle = fillStyle;
		return this;
	}

	/** Метод для изменения стиля контура текущего объекта холста */
	setStrokeStyle (strokeStyle: CanvasStyles) {
		this.strokeStyle = strokeStyle;
		return this;
	}

	/** 
     * Метод для изменения уровня прозрачности текущего объекта холста 
     * @param transparency уровень прозрачности объекта (от 1 до 0)
     */
	setTransparency (transparency: number) {
		this.transparency = transparency > 1 ? 1 : transparency < 0 ? 0 : transparency;
		return this;
	}

	/**
     * Метод для изменения стиля заливки и стиля контура объектов холста
     * @param fillStyle стиль заливки объекта
     * @param strokeStyle стиль конура холста
     */
	setStyle (fillStyle: CanvasStyles, strokeStyle: CanvasStyles) {
		this.fillStyle = fillStyle;
		this.strokeStyle = strokeStyle;
		return this;
	}

	/** Метод для получения значения прозрачности объекта холста */
	getTransparency = () => this.transparency;

	/** Метод для получения значения стиля заливки объекта холста */
	getFillStyle = () => this.fillStyle;

	/** Метод для получения значения стиля контура объекта холста */
	getStrokeStyle = () => this.strokeStyle;

	/** Метод для получения значения отступа объекта от верхнего левого угла холста (X и Y) */
	getOffset = () => this.offset;

	/**
	 * Метод для изменения значений отступа объекта от верхнего левого угла холста (X и Y)
	 * @param x отступ объекта по координате "X"
	 * @param y отступ объекта по "Y"
	 */
	setOffset (x: number, y: number) {
		this.offset = [ x, y ];
		return this;
	}

	/**
	 * Мето для изменения значения отсутпа объекта от верхнего левого угла холста по координате X
	 * @param x координата отступа
	 */
	setOffsetX (x: number) {
		this.offset[0] = x;
		return this;
	}

	/**
	 * Мето для изменения значения отсутпа объекта от верхнего левого угла холста по координате Y
	 * @param y координата отступа
	 */
	setOffsetY (y: number) {
		this.offset[1] = y;
		return this;
	}
}

/*
    Основные (экспортируеме) классы объектов 
*/

export class Path extends DrawableObject {
	private path: Point[];

	/**
     * Класс для создания элемента пути (ломанной линии)
     * @param path Набор точек пути (REST)
     */
	constructor (...path: Point[]) {
		super();
		this.path = path;
	}

	/** Метод для получения всех точек пути */
	getPath = () => this.path;

	/**
	 * Метод для изменения (замены) массива точек пути
	 * @param path массив точек пути
	 * 
	 * Данный метод не вызывает функцию перерисовки холста, чтобы
	 * изменения вступили в силу необходимо вызвать перерисовку
	 * холста вручную или заново отрисовать данный слой
	 */
	setPath (...path: Point[]) {
		this.path = path;
		return this;
	}
}
export class Circle extends DrawableObject {
	/**
     * Класс для создания объекта окружности
     * @param radius радиус окружности
     * @param angleFrom начальный угол окружности
     * @param angleTo конечный угол
     * @param antiClockwise против часовой стрелки
     */
	constructor (
		private radius: number,
		private angleFrom: number,
		private angleTo: number,
		private antiClockwise: boolean
	) {
		super();
	}

	/** Метод для получения значения радиуса окружности */
	getRadius = () => this.radius;

	/** 
     * Метод для изменения значения радиуса 
     * @param radius радиус оуружности
	 * 
	 * Данный метод не вызывает функцию перерисовки холста, чтобы
	 * изменения вступили в силу необходимо вызвать перерисовку
	 * холста вручную или заново отрисовать данный слой
	 */
	setRadius (radius: number) {
		this.radius = radius;
		return this;
	}

	/** Метод для получения значения начального и конечного углов окружности */
	getAngles = () => [ this.angleFrom, this.angleTo ];

	/** 
     * Метод для изменения значения начального и конечного углов окружности 
     * @param from начальный угол окружности
     * @param to конечный угол
	 * 
	 * Данный метод не вызывает функцию перерисовки холста, чтобы
	 * изменения вступили в силу необходимо вызвать перерисовку
	 * холста вручную или заново отрисовать данный слой
	 */
	setAngles (from: number, to: number = Math.PI * 2) {
		this.angleFrom = from;
		this.angleTo = to;
		return this;
	}

	/** Метод для получения значения параметра стороны отрисовки */
	getAntiClockwise = () => this.antiClockwise;

	/**
	 * Метод для изменения значения параметра стороны отрисовки
	 * @param antiClockwise если true, то отрисовка против часовой стрелки
	 * 
	 * Данный метод не вызывает функцию перерисовки холста, чтобы
	 * изменения вступили в силу необходимо вызвать перерисовку
	 * холста вручную или заново отрисовать данный слой
	 */
	setAntiClockwise (antiClockwise: boolean) {
		this.antiClockwise = antiClockwise;
		return this;
	}
}
export class Rect extends DrawableObject {
	/**
     * Класс для создания объекта прямоугольника фиксированного размера
     * @param width ширина прямоугольника
     * @param height высота прямоугольника
     */
	constructor (private width: number, private height: number) {
		super();
	}

	/** Метод для изменения значения параметра ширины прямоугольника */
	setWidth (width: number) {
		this.width = width;
		return this;
	}

	/** Метод для изменения значения параметра высоты прямоугольника */
	setHeight (height: number) {
		this.height = height;
		return this;
	}

	/** Метод для получения значений параметров ширины и высоты прямоугольника */
	getSize = () => [ this.width, this.height ] as [number, number];

	/** Метод для изменения значений параметров ширины и высоты */
	setSize (width: number, height: number) {
		this.width = width;
		this.height = height;
		return this;
	}
}
export class Picture extends Rect {
	/** 
     * Класс для создания объекта изображения на основе объекта прямоугольника 
     * (объект изображения расширяет объект прямоугольника) 
     * 
     * @param bitmap данные объекта изображения (изображение) из заранее загруженного изображения
     * @param height высота изображения (задаётся автоматически)
     * @param width ширины изображения (задаётся автоматически)
     */

	constructor (public readonly bitmap: ImageBitmap, width: number, height: number) {
		super(width, height);
	}
}
export class Text extends DrawableObject {
	private maxWidth: number = window.innerWidth;
	private lineWidth: number = 16;
	private baseline: CanvasTextBaseline = "alphabetic";
	private align: CanvasTextAlign = "left";

	/**
     * Класс для создания лбъекта текста
     * @param text текст, который будет отрисован на холсте
     * @param fontSize размер шрифта текста
     * @param fontFamily семейство шрифтов текста
	 * 
	 * Данный метод не вызывает функцию перерисовки холста, чтобы
	 * изменения вступили в силу необходимо вызвать перерисовку
	 * холста вручную или заново отрисовать данный слой
	 */
	constructor (private text: string[], private fontSize = 16, private fontFamily = "Arial") {
		super();
	}

	/** Метод для получения текста */
	getText = () => this.text;

	/**
     * Метод для изменения отображаемого текста
     * @param text отображаемый текст
	 * 
	 * Данный метод не вызывает функцию перерисовки холста, чтобы
	 * изменения вступили в силу необходимо вызвать перерисовку
	 * холста вручную или заново отрисовать данный слой
	 */
	setText (text: string[]) {
		this.text = text;
		return this;
	}

	/**
     * Метод для изменения размера шрифта текста
     * @param fontSize размер шрифта
	 * 
	 * Данный метод не вызывает функцию перерисовки холста, чтобы
	 * изменения вступили в силу необходимо вызвать перерисовку
	 * холста вручную или заново отрисовать данный слой
	 */
	setFontSize (fontSize: number) {
		this.fontSize = fontSize;
		return this;
	}

	/**
     * Метод для изменения семейства шрифтов текста
     * @param fontFamily семейство шрифтов
	 * 
	 * Данный метод не вызывает функцию перерисовки холста, чтобы
	 * изменения вступили в силу необходимо вызвать перерисовку
	 * холста вручную или заново отрисовать данный слой
	 */
	setFontFamily (fontFamily: string) {
		this.fontFamily = fontFamily;
		return this;
	}

	/** Метод для получения параметров шрифта текста */
	getFont = () => [ this.fontSize, this.fontFamily ] as [number, string];

	/**
     * Метод, объедениющий setFontSize и setFamilySize
     * @param fontSize размер шрифта
     * @param fontFamily семейство шрифтов
	 * 
	 * Данный метод не вызывает функцию перерисовки холста, чтобы
	 * изменения вступили в силу необходимо вызвать перерисовку
	 * холста вручную или заново отрисовать данный слой
	 */
	setFont (fontSize: number, fontFamily: string) {
		this.fontSize = fontSize;
		this.fontFamily = fontFamily;
		return this;
	}

	/** Метод для получения максимальной ширины текста */
	getMaxWidth = () => this.maxWidth;

	/**
     * Метод для изменения значения максимальной ширины текста
     * @param maxWidth максимальная ширина в пикселях
	 * 
	 * Данный метод не вызывает функцию перерисовки холста, чтобы
	 * изменения вступили в силу необходимо вызвать перерисовку
	 * холста вручную или заново отрисовать данный слой
	 */
	setMaxWidth (maxWidth: number) {
		this.maxWidth = maxWidth;
		return this;
	}

	/** Метод для получения ширины линии текста */
	getLineWidth = () => this.lineWidth;

	/**
     * Метод для изменения значения ширины линии
     * @param lineWidth ширина линии
	 * 
	 * Данный метод не вызывает функцию перерисовки холста, чтобы
	 * изменения вступили в силу необходимо вызвать перерисовку
	 * холста вручную или заново отрисовать данный слой
	 */
	setLineWidth (lineWidth: number) {
		this.lineWidth = lineWidth;
		return this;
	}

	/** Метод для получения значения параметра baseline текста */
	getBaseline = () => this.baseline;

	/**
	 * Метод для изменения значения параметра baseline текста
	 * @param baseline значение параметра baseline
	 * 
	 * Данный метод не вызывает функцию перерисовки холста, чтобы
	 * изменения вступили в силу необходимо вызвать перерисовку
	 * холста вручную или заново отрисовать данный слой
	 */
	setBaseline (baseline: CanvasTextBaseline) {
		this.baseline = baseline;
		return this;
	}

	/** Метод для получения выравнивания текста */
	getAlign = () => this.align;

	/**
     * Метод для изменения выравнивания текста
     * @param align тип выравнивания
	 * 
	 * Данный метод не вызывает функцию перерисовки холста, чтобы
	 * изменения вступили в силу необходимо вызвать перерисовку
	 * холста вручную или заново отрисовать данный слой
	 */
	setAlign (align: CanvasTextAlign) {
		this.align = align;
		return this;
	}
}

export type Drawable = Path | Circle | Rect | Text | Picture;
