import { Picture } from "./drawable-objects";

export type Align = {
	top: "top" | "center" | "bottom" | number;
	left: "left" | "center" | "right" | number;
};

/** Модуль управления загрузкой и изменением размеров изображения */
export class PicturesController {
	/**
	 * @param width ширина холста для отрисовки изображения
	 * @param height высота холста
	 */
	constructor (private readonly width: number, private readonly height: number) {}

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
		// Загрузка изображения и перобразование в Blob => ImageBitmap
		const pictureBitmap = await createImageBitmap(await fetch(link).then(res => res.blob()));

		// Вычисление размеров изображения относительно холста и типа
		const pictureProps = this.findPictureSize(
			pictureBitmap.width,
			pictureBitmap.height,
			typeof argData == "boolean" ? argData : false
		);

		// Вычисление отступа изображения
		const getPictureOffset = (side: "top" | "left") => {
			if (!argData || typeof argData == "boolean" || argData[side] === undefined) return 0;
			else {
				if (argData[side] == "bottom") return pictureProps.top;
				else if (argData[side] == "right") return pictureProps.left;
				else if (argData[side] == "center")
					return (side == "top" ? pictureProps.top : pictureProps.left) / 2;
				else if (typeof argData[side] === "number") return argData[side] as number;

				return 0;
			}
		};

		// Создание нового объекта изображения
		const pictureObject = new Picture(pictureBitmap, pictureProps.width, pictureProps.height);
		pictureObject.setOffset(getPictureOffset("left"), getPictureOffset("top"));

		return pictureObject;
	}

	/**
	 * Метод вычисления размера изображения относительно заданных размеров холста
	 * @param width начальная ширина зиображения
	 * @param height начальная высота изображения
	 * @param relativeToHeight если true, выравнивает изображение по высоте (относительно ширины)
	 */
	private findPictureSize (width: number, height: number, relativeToHeight = false) {
		// Соотношение сторон по типу 1:(высота / ширина)
		const relation = {
			canvas: this.width / this.height,
			image: width / height
		};

		let nextImageProps = { width: 0, height: 0, top: 0, left: 0 };
		const alignWithHeight = () => {
			let reducerSize = width - this.width;
			nextImageProps.width = this.width;

			let nextImageWidth = width - reducerSize;
			let nextImageHeight = height - Math.round(reducerSize / relation.image);

			let marignTop = -(nextImageHeight - this.height);
			return { height: nextImageHeight, width: nextImageWidth, top: marignTop, left: 0 };
		};

		const alignWithWidth = () => {
			// Холст вытянут по высоте
			// ! То, как вытянуто изображение, не имеет значения
			// Если холст вытянут по высоте, то и изображение нужно вытягивать по высоте холста
			/*  Высчитываем кол-во пикселей, на которые необходимо
				изменить изображение по высоте, чтобы
				подогнать его под размер холста  */
			let reducerSize: number = height - this.height;

			// Высота картинки выстроенная по высоте холста. Размер уменьшен на reducerSize пикселей
			// Размер будет увеличен, если в reducerSize отрицательный знак
			let nextImageHeight = height - reducerSize;
			// nextImageProps.height = this.height; // this.height === nextImageHeight

			// Теперь нужно вычислить ширину изображения на основе reducerSize и relation.image
			let nextImageWidth = width - Math.round(reducerSize * relation.image);

			// Следующая ширина изображения может не подходить по размеру, необходимо добавить отступ
			let marginLeft = -(nextImageWidth - this.width);
			return { height: nextImageHeight, width: nextImageWidth, top: 0, left: marginLeft };
		};

		/* 	Выравниваем изображение по ширине или высоте а затем провярем, 
            покрывает ли изображение всю площадь холста  */
		nextImageProps = alignWithHeight();
		if (relativeToHeight) nextImageProps = alignWithWidth();
		else {
			if (nextImageProps.height < this.height) nextImageProps = alignWithWidth();
			if (relation.canvas < 2) {
				nextImageProps = alignWithWidth();
				if (nextImageProps.width < this.width) nextImageProps = alignWithHeight();
			}
		}

		return nextImageProps;
	}
}
