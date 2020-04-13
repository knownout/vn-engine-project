type ImagePosition = "top" | "center" | "bottom";
export interface IImageElement {
	html: HTMLImageElement;
	alpha: number;

	width: number;
	height: number;
	top: number;
	left: number;
}

export class ImageLoader {
	constructor (private canvasContext: CanvasRenderingContext2D) {}

	// Асинхронная загрузка изображения
	public LoadImage (
		imageURL: string,
		center: {
			vertical: ImagePosition;
			horizontal: ImagePosition;
		} = { horizontal: "center", vertical: "center" }
	): Promise<IImageElement> {
		// Создание нового изображения из ссылки
		const imageElement = new Image();
		imageElement.src = imageURL;

		return new Promise((resolve, reject) => {
			imageElement.addEventListener("load", () => {
				// Получение необходимых размеров и отступов для текущего изображения
				const { width, height, ...margins } = this.calculateImageCoverSize(imageElement);

				// Функция для получение оступов относительно заданного позиционирования
				const realMargin = (type: "vertical" | "horizontal") =>
					center[type] == "top"
						? 0
						: center[type] == "center"
							? margins[type == "vertical" ? "left" : "top"] / 2
							: margins[type == "vertical" ? "left" : "top"];

				// Запись отступов в переменные (для упрощённой записи в resolve)
				const { top, left } = {
					top: realMargin("horizontal"),
					left: realMargin("vertical")
				};
				resolve({ html: imageElement, height, width, top, left, alpha: 1 });
			});

			// При ошибке загрузки изображения возвращается ошибка
			for (const event of [ "cancel", "error", "abort" ])
				imageElement.addEventListener(event, () => reject());
		});
	}

	private calculateImageCoverSize (image: HTMLImageElement) {
		const canvas = {
			width: this.canvasContext.canvas.width,
			height: this.canvasContext.canvas.height
		};

		// Соотношение сторон по типу 1:(высота / ширина)
		const relation = {
			canvas: canvas.width / canvas.height,
			image: image.naturalWidth / image.naturalHeight
		};

		let nextImageProps = { width: 0, height: 0, top: 0, left: 0 };
		function alignWithHeight () {
			let reducerSize = image.naturalWidth - canvas.width;
			nextImageProps.width = canvas.width;

			let nextImageWidth = image.naturalWidth - reducerSize;
			let nextImageHeight = image.naturalHeight - Math.round(reducerSize / relation.image);

			let marignTop = -(nextImageHeight - canvas.height);
			return { height: nextImageHeight, width: nextImageWidth, top: marignTop, left: 0 };
		}

		function alignWithWidth () {
			// Холст вытянут по высоте
			// ! То, как вытянуто изображение, не имеет значения
			// Если холст вытянут по высоте, то и изображение нужно вытягивать по высоте холста
			/*  Высчитываем кол-во пикселей, на которые необходимо
				изменить изображение по высоте, чтобы
				подогнать его под размер холста  */
			let reducerSize: number = image.naturalHeight - canvas.height;

			// Высота картинки выстроенная по высоте холста. Размер уменьшен на reducerSize пикселей
			// Размер будет увеличен, если в reducerSize отрицательный знак
			let nextImageHeight = image.naturalHeight - reducerSize;
			// nextImageProps.height = canvas.height; // canvas.height === nextImageHeight

			// Теперь нужно вычислить ширину изображения на основе reducerSize и relation.image
			let nextImageWidth = image.naturalWidth - Math.round(reducerSize * relation.image);

			// Следующая ширина изображения может не подходить по размеру, необходимо добавить отступ
			let marginLeft = -(nextImageWidth - canvas.width);
			return { height: nextImageHeight, width: nextImageWidth, top: 0, left: marginLeft };
		}

		/* 	Выравниваем изображение по ширине или высоте а затем провярем, 
            покрывает ли изображение всю площадь холста  */
		nextImageProps = alignWithHeight();
		if (nextImageProps.height < canvas.height) nextImageProps = alignWithWidth();
		if (relation.canvas < 2) {
			nextImageProps = alignWithWidth();
			if (nextImageProps.width < canvas.width) nextImageProps = alignWithHeight();
		}

		return nextImageProps;
	}
}
