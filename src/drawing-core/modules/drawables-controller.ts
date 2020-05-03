import { Circle, Picture, Rect, Text, Drawable } from "./drawable-objects";

type Point = [number, number];

/** Модуль управления отрисовываемыми объектами */
export class DrawablesController {
	protected constructor (private context: CanvasRenderingContext2D) {}

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

		/**
		 * Функция для генерации пути на основе данных объекта фигуры
		 * @param object объект фигуры
		 */
		function getObjectPath (object: Exclude<Drawable, Text>) {
			const path = new Path2D();

			const [ x, y ] = objectOffset;
			const [ w, h ] = object.getSize();

			if (object instanceof Rect || object instanceof Picture) path.rect(x, y, w, h);
			else {
				const args = [ ...object.getAngles(), !object.getDirection() ] as [
					number,
					number,
					boolean
				];

				if (object instanceof Circle) path.arc(x, y, object.getRadius(), ...args);
				else path.ellipse(x, y, object.getRadii()[0], object.getRadii()[1], 0, ...args);
			}

			return path;
		}

		// TODO: Реализовать вращение объектов

		// Отрисовка пути фигуры на основе типа объекта
		if (object instanceof Text) {
			object.getText().forEach((line, index) => {
				// Если объект - текст, то орисовывается построчно
				const offset = [
					object.getOffset()[0],
					object.getOffset()[1] + object.getFont()[0] * index + 2
				] as [number, number];

				this.context.font = object.getFont()[0] + "px " + object.getFont()[1];

				console.log("FONT", object.getFont().join(" "));
				this.context.strokeText(line, ...offset);
				this.context.fillText(line, ...offset);
			});
		} else if (object instanceof Picture) {
			// Если изображение, то отрисовывается ImageBitmap объекта
			this.context.drawImage(
				object.bitmap,
				objectOffset[0],
				objectOffset[1],
				...object.getSize()
			);
		} else {
			// Во всех остальных случаях просто создайтся контур и объект заполняется
			this.context.stroke(getObjectPath(object));
			this.context.fill(getObjectPath(object));
		}
	}
}
