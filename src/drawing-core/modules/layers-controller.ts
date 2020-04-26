import { Drawable } from "./drawable-objects";
import Person from "./person-class";

export class Layer {
	// Отступ от верхнего левого края холста (в пикселях)
	private offset: [number, number] = [ 0, 0 ];
	// Вращение слоя относительно холста
	private rotation = 0;
	// Глобальная прозрачность слоя
	private transparency = 1;

	constructor (
		private redrawFunction: () => void,
		private readonly itemsList: (Drawable | Person | null)[] = []
	) {}

	/**
	 * Метод для добавления заданных объектов или объекта на текущий слой
	 * @param objects объект или объекты, котрые будут добавлены на слой
	 * 
	 * Если добавляемый объект уже существует в списке объектов слоя, 
	 * то этот объект
	 * будет удалён и заново добавлен в список с обновлением индекса 
	 * (поверх пердыдущих объектов)
	 * 
	 * Данный метод автоматически вызывает функцию перерисовки холста. Изменения
	 * вступят в силу сразу после выполнения метода
	 */
	Draw (...objects: (Drawable | Person)[]) {
		for (const object of objects) {
			if (this.itemsList.includes(object))
				this.itemsList.splice(this.itemsList.indexOf(object), 1);

			object.setTransparency(object.getTransparency() * this.getTransparency());
			this.itemsList.push(object);
		}

		this.redrawFunction();
	}

	/**
	 * Метод для замены одного объекта слоя на любой другой
	 * @param oldObject заменяемый объект
	 * @param newObject заменяющий объект
	 * 
	 * Заменяемый объект должен нахудоится в списк объектов слоя, иначе
	 * операция замены никак не повлияет на данный слой
	 * 
	 * Данный метод автоматически вызывает функцию перерисовки холста. Изменения
	 * вступят в силу сразу после выполнения метода
	 */
	Replace (oldObject: Drawable, newObject: Drawable) {
		if (this.itemsList.includes(oldObject))
			this.itemsList[this.itemsList.indexOf(oldObject)] = newObject;

		return this;
	}

	/**
	 * Метод для полной очистки слоя и списка объектов
	 * 
	 * Данный метод автоматически вызывает функцию перерисовки холста. Изменения
	 * вступят в силу сразу после выполнения метода
	 */
	Clean () {
		this.itemsList.splice(0, this.itemsList.length);
		this.redrawFunction();
		return this;
	}

	/**
	 * Метод для удаления определеннго объекта или нескольких объектов 
	 * со слоя и из списка объектов
	 * @param objects объект или несколько объектов, которые будут удалены
	 * 
	 * Объект или все заданные объекты должны находится в списке объектов слоя, иначе
	 * операция удаления никак не поалияет на текущий слой
	 * 
	 * Данный метод автоматически вызывает функцию перерисовки холста. Изменения
	 * вступят в силу сразу после выполнения метода
	 */
	Remove (...objects: (number | Drawable)[]) {
		for (const object of objects) {
			let index = object as number;
			if (typeof object !== "number") index = this.itemsList.indexOf(object);

			if (index in this.itemsList) this.itemsList.splice(index, 1);
		}

		this.redrawFunction();
		return this;
	}

	/**
	 * Метод для получения объекта из списка объектов слоя по индексу
	 * @param index иднекс искомого объекта
	 */
	Get (index: number): Drawable | null;

	/**
	 * Метод для получения всего списка объектов слоя
	 */
	Get (): Drawable[];
	Get (index?: number) {
		if (index === undefined) return this.itemsList.filter(e => e != null);
		else if (index in this.itemsList) return this.itemsList[index];
		return null;
	}

	/** Метод для получения значения параметра вращения слоя */
	getRotation = () => this.rotation;

	/**
	 * Метод для изменения значения параметра вращения слоя
	 * @param rotation угол, на который будет повёрнут слой
	 * 
	 * Данный метод автоматически вызывает функцию перерисовки холста. Изменения
	 * вступят в силу сразу после выполнения метода
	 */
	setRotation (rotation: number) {
		this.rotation = rotation;
		this.redrawFunction();
		return this;
	}

	/** Метод для получения значения параметра прозрачности текущего слоя */
	getTransparency = () => this.transparency;

	/**
	 * Метод для изменения значения параметра прозрачности слоя
	 * @param transparency уровень прозрачности (от 0 до 1)
	 * 
	 * Данный метод автоматически вызывает функцию перерисовки холста. Изменения
	 * вступят в силу сразу после выполнения метода
	 */
	setTransparency (transparency: number) {
		this.transparency = transparency;
		this.redrawFunction();
		return this;
	}

	/** Метод для получения значения отступов текущего слоя от левого верхнего края холста */
	getOffset = () => this.offset;

	/**
	 * Метод для изменения значения параметра отступа слоя относительно левого 
	 * верхнего края холста
	 * @param x отступ по координате X
	 * @param y отступ по координате Y
	 * 
	 * Данный метод автоматически вызывает функцию перерисовки холста. Изменения
	 * вступят в силу сразу после выполнения метода
	 */
	setOffset (x: number, y: number) {
		this.offset = [ x, y ];
		this.redrawFunction();
		return this;
	}

	/**
	 * Метод для изменения значения параметра отступа слоя относительно левого 
	 * верхнего края холста по заданной координате
	 * @param x отступ по координате X
	 * 
	 * Данный метод автоматически вызывает функцию перерисовки холста. Изменения
	 * вступят в силу сразу после выполнения метода
	 */
	setOffsetX (x: number) {
		this.offset[0] = x;
		this.redrawFunction();
		return this;
	}

	/**
	 * Метод для изменения значения параметра отступа слоя относительно левого 
	 * верхнего края холста по заданной координате
	 * @param Y отступ по координате Y
	 * 
	 * Данный метод автоматически вызывает функцию перерисовки холста. Изменения
	 * вступят в силу сразу после выполнения метода
	 */
	setOffsetY (y: number) {
		this.offset[1] = y;
		this.redrawFunction();
		return this;
	}
}

/** Модуль управления слоями холста */
export class LayersController {
	constructor (private layersList: Layer[], private redrawFunction: () => void) {}

	/**
	 * Метод для создания нового виртуального слоя и добавления его в список слоёв холста
	 * 
	 * Новый слой добавляется в конец списка слоёв холста
	 */
	Add (): Layer;

	/**
	 * Метод для создания нового виртуального слоя и добавления его в список 
	 * слоёв холста после существующего слоя
	 * @param afterLayer слой, после которого будет добавлен созданный (новый слой)
	 * @param after если true, слой будет вставлен не до, а после заданного 
	 * существующего слоя (текущее состояние)
	 * 
	 * Заданный слой должен находится в списке слоёв холста, иначе
	 * новый слой будет вставлен в конец списка
	 */
	Add (afterLayer: Layer, after: true): Layer;

	/**
	 * Метод для создания нового виртуального слоя и добавления его в список 
	 * слоёв холста до существующего слоя
	 * @param beforeLayer слой, перед которым будет вставлен созданный (новый слой)
	 * 
	 * Заданный слой должен находится в списке слоёв холста, иначе
	 * новый слой будет вставлен в конец списка
	 */
	Add (beforeLayer: Layer): Layer;
	public Add (layer?: Layer, after = false) {
		// Экземпляр создаваемого слоя
		const newLayer = new Layer(this.redrawFunction);

		/*  Если в качестве индекса задан экземпляр 
			существующего слоя, текущий слой будет вставлен 
            до или после (boolean before) заданного  */

		let indexOfMain = -1;
		if (layer) {
			if (!this.layersList.includes(layer))
				throw new Error("Given layer not found in the layers list");

			indexOfMain = this.layersList.indexOf(layer) - 1;
			if (after === true) indexOfMain += 2;
		}

		// Если же в качестве индекса задано число, то новый слой добавляется по этому иднексу
		if (indexOfMain >= 0) {
			/*  Если ячейка с заданным индексом свободна, новый 
				слой помещается в нее. Если же нет, массив разбивается 
				на две части по индексу и между этими частами 
				добавляется новый слой  */
			if (this.layersList[indexOfMain] === undefined) this.layersList[indexOfMain] = newLayer;
			else {
				const partBefore = this.layersList.slice(0, indexOfMain);
				const partAfter = this.layersList.slice(indexOfMain);

				this.layersList = [ ...partBefore, newLayer, ...partAfter ];
			}
		} else this.layersList.push(newLayer);

		// Возвращается новый созданный слой
		return newLayer;
	}

	/**
	 * Метод для удаления слоя (или слоёв) и всех находящися внутри объектов
	 * @param layers слой или несколько слоёв, которые будут удалены
	 * 
	 * Объект или все заданные объекты должны находится в списке объектов слоя, иначе
	 * операция удаления никак не поалияет на текущий слой
	 * 
	 * Данный метод автоматически вызывает функцию перерисовки холста. Изменения
	 * вступят в силу сразу после выполнения метода
	 */
	public Remove (...layers: (number | Layer)[]) {
		for (const layer of layers) {
			let index = layer as number;
			if (layer instanceof Layer) index = this.layersList.indexOf(layer);

			if (index in this.layersList) this.layersList.splice(index, 1);
		}

		this.redrawFunction();
	}

	/**
	 * Метод для замены слоя на любой другой
	 * @param oldLayer заменяемый слой
	 * @param newLayer заменяющий слой
	 * 
	 * Заменяемый слой должен нахудоится в списк слоёв холста, иначе
	 * операция замены никак не повлияет на данный холст
	 * 
	 * Данный метод автоматически вызывает функцию перерисовки холста. Изменения
	 * вступят в силу сразу после выполнения метода
	 */
	public Replace (oldLayer: Layer, newLayer: Layer) {
		if (this.layersList.includes(oldLayer))
			this.layersList[this.layersList.indexOf(oldLayer)] = newLayer;

		return self;
	}

	/**
	 * Метод для получения всего списка слоёв холста
	 */
	Get (): Layer[];

	/**
	 * Метод для получения слоя из списка слоёв холста по индексу
	 * @param index иднекс искомого слоя
	 */
	Get (index: number): Layer | null;
	public Get (index?: number) {
		if (index === undefined) return this.layersList;
		if (index in this.layersList) return this.layersList[index];
		return null;
	}
}
