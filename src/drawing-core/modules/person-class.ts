import { Picture, Shadow } from "./drawable-objects";

type OffsetX = "left" | "center" | "right" | number;
type OffsetY = "top" | "center" | "bottom" | number;
export default class Person extends Shadow {
	private currentSpriteIndex = 0;
	private personNameStyle: string | CanvasGradient | CanvasPath = "#eee";
	private personSizePercent = 100;
	private personOffset: [OffsetX, OffsetY] = [ "center", "bottom" ];
	private transparency: number = 1;

	/**
     * Класс для создания персонажей
     * @param name имя персонажа
     * @param spritesList набор (список) спрайтов
     * @param redrawFunction функция переррисовки холста
     */
	constructor (
		private name: string,
		private spritesList: Picture[],
		private redrawFunction: () => void
	) {
		super();
	}

	/** Получение индекса текущего спрайта персонажа */
	getCurrentSprite = () => this.spritesList[this.currentSpriteIndex];

	/**
     * Метод для изменения текущего спрайта персонажа по индесу
     * @param spriteIndex индекс спрайта
     */
	setCurrentSprite (spriteIndex: number) {
		if (spriteIndex in this.spritesList) this.currentSpriteIndex = spriteIndex;
		else
			console.warn(
				"Попытка изменения прайта предотвращена так как установлено",
				"неверное значение для состояния спрайта персонажа",
				this.name
			);

		this.redrawFunction();
		return this;
	}

	/** Получение списка спрайтов персонажа */
	getSpritesList = () => this.spritesList;

	/**
     * Метод для изменения (замены) списка спрайтов текущего персонажа
     * @param spritesList список спрайтов персонажа
     */
	setSpritesList (spritesList: Picture[]) {
		if (spritesList.length > 0) {
			this.spritesList = spritesList;
			if (spritesList.length <= this.currentSpriteIndex) {
				this.currentSpriteIndex = 0;
				console.warn(
					`Список спрайтов персонажа ${this
						.name} был изменен и текущий индекс спрайта был сброшен,`,
					"так как выходил за границы списка спрайтов"
				);
			}

			this.redrawFunction();
		} else
			console.warn(
				"Предотвращена попытка установки пустого",
				"списка спрайтов для персонажа",
				this.name
			);

		return this;
	}

	/** Метод для получения значения переметра стиля имени персонажа */
	getNameStyle = () => this.personNameStyle;

	/**
     * Метод для изменения значения переметра стиля имени персонажа
     * @param style значение параметра стиля имени
     */
	setNameStyle (style: string | CanvasGradient | CanvasPath) {
		this.personNameStyle = style;
		this.redrawFunction();
		return this;
	}

	/** Метод для получения значения прозрачности объекта холста */
	getTransparency = () => this.transparency;

	/** 
     * Метод для изменения уровня прозрачности текущего объекта холста 
     * @param transparency уровень прозрачности объекта (от 1 до 0)
     */
	setTransparency (transparency: number) {
		this.transparency = transparency > 1 ? 1 : transparency < 0 ? 0 : transparency;
		return this;
	}

	getSize = () => this.personSizePercent;
	setSize (percent: number) {
		if (percent < 0 || percent > 100)
			console.warn(
				"Предотвращена попытка изменения размера спрайта персонажа,",
				"так как введен неверный процент размера"
			);
		else {
			this.personSizePercent = percent;
			this.redrawFunction();
		}

		return this;
	}

	getOffset = () => this.personOffset;
	setOffset (x: OffsetX, y: OffsetY) {
		this.personOffset = [ x, y ];
		this.redrawFunction();
		return this;
	}

	setOffsetX (x: OffsetX) {
		this.personOffset[0] = x;
		this.redrawFunction();
		return this;
	}

	setOffsetY (y: OffsetY) {
		this.personOffset[1] = y;
		this.redrawFunction();
		return this;
	}
}
