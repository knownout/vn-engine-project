import { AnyItem } from "./objects";

// Класс слоя
export default class Layer {
	constructor (
		private readonly listOfItems: AnyItem[], // Список элементов внутри слоя
		private redrawFunction: (itemsList: AnyItem[]) => void // Функция перерисовки холста
	) {}

	// Метод для добавления элемента (псевдо-отрисовки) в список элементов слоя
	public Draw (...items: NonNullable<AnyItem>[]) {
		for (const item of items) {
			// Если элемет уже существует в этом слое, он пересоздаётся
			if (this.listOfItems.includes(item))
				this.listOfItems.splice(this.listOfItems.indexOf(item), 1);

			this.listOfItems.push(item);
		}

		// Вызов перерисовки холста
		this.redrawFunction(this.listOfItems);
		return this;
	}

	// Метод замены элемента в списке на новый
	public Replace (currentItem: NonNullable<AnyItem>, nextItem: NonNullable<AnyItem>) {
		// Проверка на то, существует ли заменяемый элемент
		if (!this.listOfItems.includes(currentItem)) return this;

		// Получение индекса заменяемого элемента и замена
		const itemIndex = this.listOfItems.indexOf(currentItem);
		this.listOfItems[itemIndex] = nextItem;
		this.redrawFunction(this.listOfItems);

		return this;
	}

	// Метод для получения элемента слоя по индексу или всего списка элементов
	public Get (index: number): AnyItem;
	public Get (): AnyItem[];
	public Get (index?: number) {
		if (index) {
			if (this.listOfItems[index]) return this.listOfItems[index];
			else return null;
		}

		return this.listOfItems;
	}

	// Метод для удаления элемента слоя (по индексу или самому элементу)
	public Clean (indexOrItem: NonNullable<AnyItem> | number) {
		// Поиск индекса очищаемого элемента
		let itemIndex = indexOrItem as number;
		if (typeof indexOrItem !== "number") this.listOfItems.indexOf(indexOrItem);

		// Удаление элемента из слоя
		this.listOfItems.splice(itemIndex, 1);
		this.redrawFunction(this.listOfItems);
		return this;
	}
}
