/*
    Набор стандартных (базовых) объектов

    Этот файл содержит конструкторы базовых типов (объектов)
    отрисовываемых на холсте элементов
*/

/** Составной тип для обозначения стиля отрисовки объекта на холсте */
type CanvasStyle = string | CanvasGradient | CanvasPattern;
/** Составной тип для обозначения всех объектов, которые могут быть отрисованы на холсте */
export type Drawable = Rect | Circle | Ellipse | Text | Picture;

/*

	Базовые классы, содержащие общие свойства для объектов
	определенного типа (не экспортируются)

*/

/**
 * Базовый класс, содержащий стили заполнения и контура фигуры, а 
 * также значение альфа-канала (прозрачности) для текущего объекта
 * и значение параметра вращения относительно собственного центра
 */
class DrawableObject {
	private objectOffset: [number, number] = [ 0, 0 ];

	private shapeRotation = 0;
	private transparency = 1;
	private shapeSize: [number, number];

	private strokeStyle: CanvasStyle = "transparent";
	private fillStyle: CanvasStyle = "transparent";

	private parentObject: Drawable | null = null;

	private shadowBlur: number = 0;
	private shadowColor: string = "transparent";
	private shadowOffset: [number, number] = [ 0, 0 ];

	constructor (width: number, height: number) {
		this.shapeSize = [ width, height ];
	}

	/** Метод получения отступа объекта от левого верхнего края холста */
	getOffset = () => this.objectOffset;

	/** Метод получения значения параметра вращения фигуры относительно собственного 
	 * центра в радианах */
	getRotation = () => this.shapeRotation;
	/** Метод получения значения параметра прозрачности (альфа-канала) текущего объекта */
	getTransparency = () => this.transparency;
	/** Метод получения значений размеров фигуры (ширины и высоты) */
	getSize = () => this.shapeSize;

	/** Метод получения значения стилей заполнения и контура фигуры */
	getStyles = () => [ this.fillStyle, this.strokeStyle ] as [CanvasStyle, CanvasStyle];
	/** Метод получения значения стиля контура фигуры */
	getStrokeStyle = () => this.strokeStyle;
	/** Метод получения значения стиля заполнения фигуры */
	getFillStyle = () => this.fillStyle;

	/** Метод для получения родительского объекта */
	getParentObject = () => this.parentObject;

	/** Метод для получения значения отступа тени относительн объекта */
	getShadowOffset = () => this.shadowOffset;

	/** Метод для получения значения параметра цвета тени */
	getShadowColor = () => this.shadowColor;

	/** Метод для получения значения параметра размытия тени */
	getShadowBlur = () => this.shadowBlur;

	/**
	 * Метод изменения значения текущей координаты объекта по оси X
	 * @param x координата по оси X
	 */
	setCoordinateX (x: number) {
		this.objectOffset[0] = x;
		return this;
	}

	/**
	 * Метод изменения значения текущей координаты объекта по оси Y
	 * @param y координата по оси Y
	 */
	setCoordinateY (y: number) {
		this.objectOffset[1] = y;
		return this;
	}

	/**
	 * Метод изменения значения текущего отступа объекта от левого верхнего угла холста
	 * @param x отсутп по оси X
	 * @param y отступ по оси Y
	 */
	setOffset (x: number, y: number) {
		return this.setCoordinateX(x).setCoordinateY(y);
	}

	/**
	 * Метод изменения значения параметра прозрачности (альфа-канала) текущего объекта
	 * @param transparency значение параметра прозрачности
	 */
	setTransparency (transparency: number) {
		this.transparency = transparency < 0 ? 0 : transparency > 1 ? 1 : transparency;
		return this;
	}

	/**
	 * Метод изменения значения параметра вращения фигуры относительно собственного центра
	 * в градусах
	 * @param rotation вращение относительно собственного центра
	 */
	setRotation (rotation: number) {
		this.shapeRotation = rotation * (Math.PI / 180);
		return this;
	}

	/**
	 * Метод для изменения значений размеров отрисовываемой фигуры
	 * @param width значение ширины фигуры
	 * @param height значение высоты
	 */
	setSize (width: number, height: number) {
		return this.setWidth(width).setHeight(height);
	}

	/**
	 * Метод изменения значения ширины отрисовываемой фигуры
	 * @param width значение ширины фигуры
	 */
	setWidth (width: number) {
		this.shapeSize[0] = width;
		return this;
	}

	/**
	 * Метод изменения значения высоты отрисовываемой фигуры
	 * @param height значение высоты фигуры
	 */
	setHeight (height: number) {
		this.shapeSize[1] = height;
		return this;
	}

	/**
	 * Метод изменения значения стилей заполнения и контура фигуры
	 * @param fillStyle стиль заполнения текущей фигуры
	 * @param strokeStyle стиль контура фигуры
	 */
	setStyles (fillStyle: CanvasStyle, strokeStyle: CanvasStyle) {
		return this.setFillStyle(fillStyle).setStrokeStyle(strokeStyle);
	}

	/**
	 * Метод изменения значения стиля контура фигуры
	 * @param strokeStyle стиль контура
	 */
	setStrokeStyle (strokeStyle: CanvasStyle) {
		this.strokeStyle = strokeStyle;
		return this;
	}

	/**
	 * Метод изменения значения стиля заполнения фигуры
	 * @param strokeStyle стиль заполнения
	 */
	setFillStyle (fillStyle: CanvasStyle) {
		this.fillStyle = fillStyle;
		return this;
	}

	/**
	 * Метод для изменения родительского объекта (для изменения привязки текущего объекта)
	 * @param object родительский объект
	 */
	setParentObject (object: Drawable | null) {
		this.parentObject = object;
		return this;
	}

	/**
	 * Метод для изменения значения отступа тени относительно объекта
	 * @param x отступ по оси X
	 * @param y отсутп по оси Y
	 */
	setShadowOffset (x: number, y: number) {
		this.shadowOffset = [ x, y ];
		return this;
	}

	/**
	 * Метод для изменения значения параметра цвета тени
	 * @param color цвет тени
	 */
	setShadowColor (color: string) {
		this.shadowColor = color;
		return this;
	}

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
		if (offsetX) this.shadowOffset[0] = offsetX;
		if (offsetY) this.shadowOffset[1] = offsetY;

		return this.setShadowColor(color).setShadowBlur(blur);
	}
}

/**
 * Базовый класс, содержащий следующие общие параметры окржуностей: 
 * направление отрисовки (по или против часовой стрелки), 
 * углы начала и конца дуги. Расширят базовый класс DrawableObject
 */
class RoundDrawableObject extends DrawableObject {
	private anglesList: [number, number] = [ 0, Math.PI * 2 ];
	private clockwiseDirection = true;

	/** Метод получения значения углов начала и конца дуги в радианах */
	getAngles = () => this.anglesList;
	/** Метод получения значения параметра направления отрисовки дуги */
	getDirection = () => this.clockwiseDirection;

	/**
	 * Метод изменения значения углов начала и конца дуги в градусах
	 * @param startAngle начальный угол дуги
	 * @param endAngle конечный угол
	 */
	setAngles (startAngle: number, endAngle: number) {
		return this.setStartAngle(startAngle).setEndAngle(endAngle);
	}

	/**
	 * Метод изменения значения начального угла дуги в градусах
	 * @param startAngle начальный угол
	 * а не в радианах
	 */
	setStartAngle (startAngle: number) {
		this.anglesList[0] = startAngle * (Math.PI / 180);
		return this;
	}

	/**
	 * Метод изменения значения конечного угла дуги в градусах
	 * @param endAngle конечный угол
	 * а не в радианах
	 */
	setEndAngle (endAngle: number) {
		this.anglesList[1] = endAngle * (Math.PI / 180);
		return this;
	}

	/**
     * Метод изменения значения параметра направления отрисовки дуги
     * @param clockwiseDirection если true, отрисовывается по часовой стрелке 
     * (true по умолчанию)
     */
	setDirection (clockwiseDirection: boolean) {
		this.clockwiseDirection = clockwiseDirection;
		return this;
	}
}

/*

	Классы для базовых отрисовываемых на холсте фигур

*/

/**
 * Класс прямоугольника, содержит дополнительные 
 * параметры ширины и высоты фигуры
 */
export class Rect extends DrawableObject {
	/** 
	 * @param width Ширина отрисовываемой фигуры 
	 * @param height Высота фигуры
	 */
	constructor (width: number, height: number) {
		super(width, height);
	}
}

/**
 * Класс создания объекта изображения на основе объекта прямоугольника 
 * (объект изображения расширяет объект прямоугольника) 
 */
export class Picture extends Rect {
	/** 
     * @param bitmap данные объекта изображения (изображение) из заранее загруженного изображения
     * @param height высота изображения (задаётся автоматически)
     * @param width ширины изображения (задаётся автоматически)
     */
	constructor (public readonly bitmap: ImageBitmap, width: number, height: number) {
		super(width, height);
	}
}

/**
 * Класс круга, расширяет базовый класс RoundDrawableObject
 * дополнительным параметром радиуса фигуры
 */
export class Circle extends RoundDrawableObject {
	/** @param radius радиус окружности */
	constructor (private radius: number) {
		super(radius * 2, radius * 2);
	}

	/** Метод получения значения радиуса текущей фигуры в радианах */
	getRadius = () => this.radius;

	/**
	 * Метод изменения значения радиуса текущей фигуры
	 * @param radius радиус фигуры
	 */
	setRadius (radius: number) {
		this.radius = radius;
		return this;
	}
}

/**
 * Класс эллипса (овала), расширяет базовый класс RoundDrawableObject
 * дополнительными параметром радиусов (по X и Y), а также
 * перезаписывает метод setRotation базового класса DrawableObject
 */
export class Ellipse extends RoundDrawableObject {
	constructor (private radiusX: number, private radiusY: number) {
		super(radiusX * 2, radiusY * 2);
	}

	/** Метод получения значений радиусов (по X и Y) эллипса */
	getRadii = () => [ this.radiusX, this.radiusY ] as [number, number];

	/**
	 * Метод изменения значений радиусов фигуры по обеим осям
	 * @param radiusX радиус по оси X
	 * @param radiusY радиус по оси Y
	 */
	setRadii (radiusX: number, radiusY: number) {
		return this.setRadiusX(radiusX).setRadiusY(radiusY);
	}

	/**
	 * Метод изменения значения радиуса фигуры про оси X
	 * @param radiusX радиус по оси X
	 */
	setRadiusX (radiusX: number) {
		this.radiusX = radiusX * (Math.PI / 180);
		return this;
	}

	/**
	 * Метод изменения значения радиуса фигуры про оси Y
	 * @param radiusY радиус по оси Y
	 */
	setRadiusY (radiusY: number) {
		this.radiusY = radiusY * (Math.PI / 180);
		return this;
	}
}

/**
 * Класс текста, содержит дополнительные
 * параметры шрифта (размер и семейтво) и
 * максимальной ширины строки, а также позвоялет
 * создавать многострочные текстовые блоки
 */
export class Text extends DrawableObject {
	private textLines: string[] = [];
	private fontSize = 16;
	private fontFamily = "Arial";
	private maxWidth = window.innerWidth || -1;

	/** @param textLines одна или несколько строк текста */
	constructor (...textLines: string[]) {
		super(0, 0);
		this.setText(...textLines);
	}

	/** Метод построчного получения текста */
	getText = () => this.textLines;
	/** Метод получения значения параметров размера и семейтва шрифта */
	getFont = () => [ this.fontSize, this.fontFamily ] as [number, string];
	/** Метод получения значения максимальной ширины строки */
	getMaxWidth = () => this.maxWidth;

	/**
	 * Метод изменения текста и перерассчёта размера объекта на основе
	 * заданных данных о размере шрифта и тексте
	 * @param textLines одна или несколько линий текста
	 */
	setText (...textLines: string[]) {
		this.textLines = textLines;

		const localCanvasContext = document
			.createElement("canvas")
			.getContext("2d") as CanvasRenderingContext2D;

		const textHeight = textLines.length * this.fontSize + textLines.length * 2;
		const textWidth = localCanvasContext.measureText(
			textLines.reduce((a, b) => (a.length > b.length ? a : b), "")
		).width;

		return this.setSize(textWidth, textHeight);
	}

	/**
	 * Метод изменения значения параметров размера и семейтва шрифта
	 * @param fontSize размер шрифта в пикселях
	 * @param fontFamily название семейства шрифта с дополнительными
	 * параметрами
	 */
	setFont (fontSize: number, fontFamily: string) {
		this.fontFamily = fontFamily;
		this.fontSize = fontSize;

		// Если изменилось семейство шрифта или размер, изменился и размер объекта
		return this.setText(...this.textLines);
	}

	/**
	 * Метод изменения значения параметра семейтва шрифта
	 * @param fontFamily название семейства шрифта с дополнительными
	 * параметрами ("Arial" по умолчанию)
	 */
	setFontFamily (fontFamily: string) {
		this.fontFamily = fontFamily;
		return this;
	}

	/**
	 * Метод изменения значения параметра размера шрифта
	 * @param fontSize размер шрифта в пикселях (16 по умолчанию)
	 */
	setFontSize (fontSize: number) {
		this.fontSize = fontSize;
		return this;
	}

	/**
	 * Метод изменения значения максимальной ширины строки
	 * @param maxWidth максимальная ширина строки в пикселях 
	 * (по умолчанию - ширина текущего окна или -1)
	 */
	setMaxWidth (maxWidth: number) {
		this.maxWidth = maxWidth;
		return this;
	}
}
