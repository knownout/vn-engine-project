import { Circle, Path, Picture, Rect, Text, Drawable } from "./drawable-objects";
import Person from "./person-class";

type Point = [number, number];

/** Модуль управления отрисовываемыми объектами */
export class DrawablesController {
	protected constructor (private context: CanvasRenderingContext2D) {}

	/**
	 * Метод для отрисовки персонажей (объектов типа Person, не входящих в Drawable)
	 * на заданном холсте
	 * @param person объект персонажа для отрисовки
	 * @param offset отступ для текущего слоя
	 * 
	 * Отступ текущего слоя также действует и на отступ персонажа, увеличивая
	 * или уменьшая его (иными словам, смещая)
	 */
	protected drawPerson (person: Person, offset: [number, number] = [ 0, 0 ]) {
		// Сокращение для контекста холста
		const context = this.context;

		/*  Текущий спрайт персонажа, на основе которого
			проводится вычисление позиции изображения  */
		const picture = person.getCurrentSprite();

		// Изначальный отступ объекта персонажа
		const [ offsetX, offsetY ] = person.getOffset();

		// Изначальный размер персонажа
		let [ width, height ] = picture.getSize();

		/* Изменение размера персонажа относительно 
			заданного процентного размера */
		width = width * person.getSize() / 100;
		height = height * person.getSize() / 100;

		// Перечисление возможных позиций изображения по оси X
		enum alignWidthRealtion {
			left = 0,
			center = context.canvas.width / 2 - width / 2,
			right = context.canvas.width - width
		}

		// Перечисление возможных позиций изображения по оси Y
		enum alignHeightRelation {
			top = 0,
			center = context.canvas.height / 2 - height / 2,
			bottom = context.canvas.height - height
		}

		// Вычисление числовой позиции по осям
		const numbericOffsetY = typeof offsetY == "number" ? offsetY : alignHeightRelation[offsetY];
		const numbericOffsetX = typeof offsetX == "number" ? offsetX : alignWidthRealtion[offsetX];

		// Отрисовка изображения на холсте
		context.drawImage(
			picture.bitmap,
			offset[0] + numbericOffsetX,
			offset[1] + numbericOffsetY,
			width,
			height
		);
	}

	/**
	 * Метод для отрисовки объектов типа Drawable на заданном холсте
	 * @param object объект типа Drawable, который будет отрисован
	 * @param offset отступ для текущего слоя
	 * 
	 * Отсутп текущего слоя затрагивает только объекты, позиционируемые
	 * относительно всего слоя. Объекты, у которых задан parentObject
	 * позиционируются только относительно родителького объекта
	 * и отступ слоя никак на них не влияет
	 */
	protected drawObject (object: Drawable, offset: [number, number] = [ 0, 0 ]) {
		const context = this.context;

		/**
		 * Функция для суммирования отступов объектов
		 * @param accumulator объект, к которому будет прибавлен отступ
		 * @param offset прибавляемый объект
		 */
		const sumOffsets = (accumulator: Point, offset: Point) =>
			accumulator.map((e, i) => e + offset[i]) as [number, number];

		// Получение родительского объекта и отступа текущего обекта
		const parentObject = object.getParentObject();
		let objectOffset = object.getOffset();

		// Вычисление отступов текущего объекта
		if (parentObject && parentObject !== object)
			// Если задан родительский объект, то отступы вычисляются относительно него
			objectOffset = sumOffsets(objectOffset, parentObject.getOffset());
		else {
			// Если в качестве родительского задан сам объект, пердупредить об этом
			if (parentObject)
				console.warn(
					"Неверно задан родительский объект для",
					object,
					"\nОбъект не может быть назначен сам себе в качестве родительского"
				);

			// Если родительский объект не задан, отступы вычислятся относительно слоя
			objectOffset = sumOffsets(objectOffset, offset);
		}

		// Набор функций для отрисовки раличного рода объектов
		const renderingFunctions = {
			/**
			 * Функция для отрисовки ломанной линии (пути)
			 * @param path точечный путь линии
			 */
			pathObject (path: Path) {
				const pointsList = path.getPath();

				context.beginPath();
				for (let i = 0; i < pointsList.length; i++) {
					const point = sumOffsets(pointsList[i], objectOffset);

					if (i === 0) context.moveTo(...point);
					else context.lineTo(...point);
				}

				context.stroke();
				context.fill();

				context.closePath();
			},

			/**
			 * Функция отрисовки изображение по ImageBitmap
			 * @param picture загруженный объект изображения
			 */
			pictureObject (picture: Picture) {
				context.drawImage(
					picture.bitmap,
					...([ ...objectOffset, ...picture.getSize() ] as [
						number,
						number,
						number,
						number
					])
				);
			},

			/**
			 * Функция отрисоки окружности на заданном холсте
			 * @param circle объект окружности
			 */
			circleObject (circle: Circle) {
				context.beginPath();
				context.arc(
					objectOffset[0],
					objectOffset[1],
					circle.getRadius(),
					...([ ...circle.getAngles(), circle.getAntiClockwise() ] as [
						number,
						number,
						boolean
					])
				);

				context.stroke();
				context.fill();
				context.closePath();
			},

			/**
			 * Функция отрисовки прямоугольника фиксированых размеров
			 * @param rect объект прямоугольника
			 */
			rectObject (rect: Rect) {
				context.beginPath();
				context.rect(
					...([ ...objectOffset, ...rect.getSize() ] as [number, number, number, number])
				);

				context.stroke();
				context.fill();
				context.closePath();
			},

			/**
			 * Функция отрисовки текста на холсте
			 * @param text объект текста
			 */
			textObject (text: Text) {
				context.beginPath();
				for (const line of text.getText()) {
					// Установка шрифта, ширины линии и других параметров
					context.font = text.getFont().join(" ");
					context.lineWidth = text.getLineWidth();

					context.textBaseline = text.getBaseline();
					context.textAlign = text.getAlign();

					// Аргументы функции отрисовки текста на холста
					const drawOptions = [ line, ...objectOffset, text.getMaxWidth() ] as [
						string,
						number,
						number,
						number
					];

					// Отрисовка текста и/или контура (если ничего из этого не задано, отрисовывается текст)
					context.strokeText(...drawOptions);
					context.fillText(...drawOptions);
				}
				context.closePath();
			}
		};

		/*  Отрисовка объекта по его имени конструктора (имя конструктора 
			эквивалентно названию класса, таким образом 
			ImageObject.contructor.name == "ImageObject"). 
					
			Такой подход является более компактной 
			альтернативой instanceof  */
		const methodName = (object.constructor.name.toLowerCase() + "Object") as
			| "pictureObject"
			| "pathObject"
			| "circleObject"
			| "rectObject"
			| "textObject";
		(renderingFunctions as any)[methodName](object, objectOffset);
	}
}
