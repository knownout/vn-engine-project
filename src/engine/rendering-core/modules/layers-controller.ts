import { AnyObject } from "./type-objects";

// Класс (тип) слоёв
export class Layer {
	// Отступ от верхнего левого края холста (в пикселях)
	private offset: [number, number] = [ 0, 0 ];
	// Вращение слоя относительно холста
	private rotation = 0;
	// Глобальная прозрачность слоя
	private alpha = 1;

	constructor (
		private emitRedraw: () => void,
		private readonly itemsList: (AnyObject | null)[] = []
	) {}

	// Метод для отрисовки любого типа объектов
	public Draw (...objects: AnyObject[]) {
		for (const object of objects) {
			if (this.itemsList.includes(object))
				this.itemsList.splice(this.itemsList.indexOf(object), 1);

			object.alpha = (typeof object.alpha !== "number" ? 1 : object.alpha) * this.alpha;
			this.itemsList.push(object);
		}

		this.emitRedraw();
	}

	// Метод для замены одного объекта слоя на любой другой
	public Replace (oldObject: AnyObject, newObject: AnyObject) {
		if (this.itemsList.includes(oldObject))
			this.itemsList[this.itemsList.indexOf(oldObject)] = newObject;

		return this;
	}

	// Полная очистка слоя
	public Clean () {
		this.itemsList.splice(0, this.itemsList.length);
		this.emitRedraw();
		return this;
	}

	// Удаление объекта или объектов с холста и из списка объектов слоя
	public Remove (...objects: (number | AnyObject)[]) {
		for (const object of objects) {
			let index = object as number;
			if (typeof object !== "number") index = this.itemsList.indexOf(object);

			if (index in this.itemsList) this.itemsList.splice(index, 1);
		}

		this.emitRedraw();
		return this;
	}

	public Get (index: number): AnyObject | null;
	public Get (): AnyObject[];
	// Получение объекта слоя по индексу или всего списка объектов
	public Get (index?: number) {
		if (index === undefined) return this.itemsList.filter(e => e != null);
		else if (index in this.itemsList) return this.itemsList[index];
		return null;
	}

	public Rotate (angle: number): this;
	public Rotate (): number;
	// Получени или установка значения поворота слоя (rotation)
	public Rotate (angle?: number) {
		if (typeof angle != "number") return this.rotation;

		this.rotation = angle;
		this.emitRedraw();
		return this;
	}

	public Offset (offset: [number | null, number]): this;
	public Offset (): [number, number];
	// Получени или установка значения отступа слоя (offset)
	public Offset (offset?: [number | null, number]) {
		if (!offset) return this.offset;

		offset[0] = offset[0] || 0;
		this.offset = offset as [number, number];
		return this;
	}

	public Alpha (alpha: number): this;
	public Alpha (): number;
	// Получени или установка значения глобальной прозрачности слоя (alpha)
	public Alpha (alpha?: number) {
		if (typeof alpha != "number") return this.alpha;

		this.alpha = alpha;
		return this;
	}
}

// Класс управления слоями (контроллер слоёв)
export default class LayersController {
	constructor (private layersList: Layer[], private emitRedraw: () => void) {}

	Add (): Layer;
	Add (index: Layer, before?: boolean): Layer;
	Add (index: number): Layer;

	// Метод для создания нового слоя и добавления его в список слоёв
	public Add (index?: number | Layer, before: boolean = false) {
		// Экземпляр создаваемого слоя
		const instanceOfLayer = new Layer(this.emitRedraw);

		/*  Если в качестве индекса задан экземпляр 
			существующего слоя, текущий слой будет вставлен 
			до или после (boolean before) заданного  */
		if (index instanceof Layer) {
			if (!this.layersList.includes(index))
				throw new Error("Given layer not found in the layers list");

			index = this.layersList.indexOf(index) + 1;
			if (before === true) index -= 2;
		}

		// Если же в качестве индекса задано число, то новый слой добавляется по этому иднексу
		if (index) {
			/*  Если ячейка с заданным индексом свободна, новый 
				слой помещается в нее. Если же нет, массив разбивается 
				на две части по индексу и между этими частами 
				добавляется новый слой  */
			if (this.layersList[index] === undefined) this.layersList[index] = instanceOfLayer;
			else {
				const partBefore = this.layersList.slice(0, index);
				const partAfter = this.layersList.slice(index);

				this.layersList = [ ...partBefore, instanceOfLayer, ...partAfter ];
			}
		} else this.layersList.push(instanceOfLayer);

		// Возвращается новый созданный слой
		return instanceOfLayer;
	}

	// Метод для удаления слоя (или слоёв) и всех находящися внутри объектов
	public Remove (...layers: (number | Layer)[]) {
		for (const layer of layers) {
			let index = layer as number;
			if (layer instanceof Layer) index = this.layersList.indexOf(layer);

			if (index in this.layersList) this.layersList.splice(index, 1);
		}

		this.emitRedraw();
	}

	// Замена слоя из списка слоёв на любой новый слой
	public Replace (oldLayer: Layer, newLayer: Layer) {
		if (this.layersList.includes(oldLayer))
			this.layersList[this.layersList.indexOf(oldLayer)] = newLayer;

		return self;
	}

	Get (): Layer[];
	Get (index: number): Layer | null;

	// Получение слоя по индексу или получение всего списка слоёв
	public Get (index?: number) {
		if (index === undefined) return this.layersList;
		if (index in this.layersList) return this.layersList[index];
		return null;
	}
}
