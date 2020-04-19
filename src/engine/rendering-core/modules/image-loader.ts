import { ImageObject } from "./type-objects";

export class ImageLoader {
	constructor (private width: number, private height: number) {}

	// Асинхронная загрузка изображения
	public async LoadImage (
		link: string,
		offset?: Partial<{
			top: "top" | "center" | "bottom" | number;
			left: "left" | "center" | "right" | number;
		}>
	) {
		const imageBitmap = await createImageBitmap(await fetch(link).then(res => res.blob()));
		const imageProps = this.findImageSize(imageBitmap.width, imageBitmap.height);
		const getOffset = (side: "top" | "left") => {
			if (!offset || offset[side] === undefined) return 0;
			else {
				if (offset[side] == "bottom") return imageProps.top;
				else if (offset[side] == "right") return imageProps.left;

				if (offset[side] == "center")
					return (side == "top" ? imageProps.top : imageProps.left) / 2;

				return 0;
			}
		};

		return new ImageObject(
			imageBitmap,
			[ imageProps.width, imageProps.height ],
			[ getOffset("left"), getOffset("top") ]
		);
	}

	private findImageSize (width: number, height: number) {
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
		if (nextImageProps.height < this.height) nextImageProps = alignWithWidth();
		if (relation.canvas < 2) {
			nextImageProps = alignWithWidth();
			if (nextImageProps.width < this.width) nextImageProps = alignWithHeight();
		}

		return nextImageProps;
	}
}
