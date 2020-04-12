namespace Novel {
	export type DrawableType = "image" | "line" | "rect" | "arc";
	export type PositioningState = "top" | "center" | "bottom";
}

class Core {
	// TODO: Заменить на защищенный тип (будет наследоваться движком)
	public readonly canvasContext: CanvasRenderingContext2D;
	public constructor (width: number, height: number) {
		// Создание холста и установка CSS стилей
		const canvasElement = document.createElement("canvas");

		canvasElement.style.backgroundColor = "#111";
		canvasElement.style.width = `${width}px`;
		canvasElement.style.height = `${height}px`;

		// Получение контекста холста и установка размера
		const canvasContext = canvasElement.getContext("2d") as CanvasRenderingContext2D;

		canvasContext.canvas.width = width;
		canvasContext.canvas.height = height;

		this.canvasContext = canvasContext;
	}

	public DrawImage (
		image: HTMLImageElement,
		// Начальные настройки заданы лишь на центрирование изображения
		options = {
			vertical: "center",
			horizontal: "center"
		} as {
			vertical?: Novel.PositioningState;
			horizontal?: Novel.PositioningState;

			// Настрока эффекта для изменения прозрачности изображения
			effectOptions?: {
				fn: (
					from: number,
					to: number,
					time: number,
					callback: (currentValue: number) => void
				) => Promise<void>;

				// Ручное изменение параметров функции эффекта
				from?: number; // С какого значения начать
				to?: number; // Каким значением закончить
				time?: number; // Общая продолжительность работы функции
			};

			// Статичная прозрачность изображения
			// (не может быть использована вместе с эффектом)
			opacity?: number;
		}
	) {
		// Получаем размер изображения и отступы относительно холста
		const { width, height, ...margins } = this.calculateImageCoverSize(image);

		// Вычисление отступов относительно типа центрирования
		const margin = (plane: "vertical" | "horizontal") =>
			options[plane] == "top"
				? 0
				: options[plane] == "center" ? margins[plane == "vertical" ? "left" : "top"] : 0;

		// Если не задан эффект, то по возможности устанавливается статичный уровень прозрачности
		if (options.opacity && !options.effectOptions)
			this.canvasContext.globalAlpha = options.opacity;
		if (!options.effectOptions)
			// Если эффект не установлен, то изображение отрисовывается
			this.canvasContext.drawImage(
				image,
				margin("vertical"),
				margin("horizontal"),
				width,
				height
			);
		else {
			// Если нет, то настраивается и запускается эффект
			// Создание копии начального изображения для перерисовки
			const beginImage = new Image();
			beginImage.src = this.canvasContext.canvas.toDataURL();

			// Получение вручную записанных опций эффекта
			const { fn, ...opacityEffect } = options.effectOptions;
			let effectOptions = { from: 0, to: 0, time: 0 };

			type T = "from" | "to" | "time";
			for (const part of [ "from", "to", "time" ])
				if (opacityEffect[part as T])
					effectOptions[part as T] = opacityEffect[part as T] as number;

			// Вызов функции эффекта
			fn(effectOptions.from, effectOptions.to, effectOptions.time, currentValue => {
				// Очистка холста и отрисовка начального изображения
				this.canvasContext.globalAlpha = 1;
				this.canvasContext.clearRect(
					0,
					0,
					this.canvasContext.canvas.width,
					this.canvasContext.canvas.height
				);

				this.canvasContext.drawImage(beginImage, 0, 0);

				// Установка заданного уровня прозрачности и
				// отрисовка текущего изображения
				this.canvasContext.globalAlpha = currentValue;
				this.canvasContext.drawImage(
					image,
					margin("vertical"),
					margin("horizontal"),
					width,
					height
				);
			});
		}
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

		nextImageProps = alignWithHeight();
		if (nextImageProps.height < canvas.height) nextImageProps = alignWithWidth();
		if (relation.canvas < 2) {
			nextImageProps = alignWithWidth();
			if (nextImageProps.width < canvas.width) nextImageProps = alignWithHeight();
		}

		return nextImageProps;
	}
}

window.addEventListener("load", async () => {
	let core = new Core(420, 240);
	document.body.append(core.canvasContext.canvas);

	let image = new Image();
	image.src = "1.jpg";

	image.addEventListener("load", function () {
		core.DrawImage(this);
	});
});
