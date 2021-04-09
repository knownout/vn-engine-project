import JSZip from "jszip";
import * as d from "./types";
import { CoreMessagesList as ML } from "./messages";

class Base64Image {
	public readonly base64: string;
	constructor (image: string, base64: string) {
		const extension = image.split(".").slice(-1)[0].trim() == "png" ? "png" : "jpg";
		this.base64 = `data:image/${extension};base64,${base64}`;
	}
}

class Core {
	// Массив слоев новеллы в виде HTML-элементов
	private readonly layersList: d.ILayersList<HTMLDivElement>;

	// Генератор ошибки парсинга исполняемого файла новеллы
	private throwParseException (...message: string[]) {
		class NovelExecutableParseException {
			constructor (public readonly message: string) {}
		}

		return new NovelExecutableParseException(message.map(e => e.trim()).join(" ").trim());
	}

	constructor (private readonly novelExecutableFile: string, wrapperLayer: HTMLDivElement) {
		// TODO: Проверять, существуют ли элементы слоев
		this.layersList = {
			layersWrapperLayer: wrapperLayer,
			backgroundLayer: wrapperLayer.querySelector(".layer.bg-layer") as HTMLDivElement,
			controlsLayer: wrapperLayer.querySelector(".layer.controls-layer") as HTMLDivElement,
			charactersLayer: wrapperLayer.querySelector(".layer.chr-layer") as HTMLDivElement
		};
	}

	// Функция предварительной проверки исполняемого файла на наличие ошибок
	public parseNovelExecutableFile (): d.INovelExecutableObject {
		const novelExecutableFile = this.novelExecutableFile;

		// Преобразование данных JSON-строки в объект
		const novelExecutableObject = JSON.parse(novelExecutableFile) as d.INovelExecutableObject;

		// Проверка наличия необходимых секторов исполняемого файла
		if (!novelExecutableObject.init) throw this.throwParseException(ML.exceptions.noInitSector);

		if (!novelExecutableObject.screen) throw this.throwParseException(ML.exceptions.noScreenSector);

		// Проверка сектора INIT
		const initSectorKeysList = Object.keys(novelExecutableObject.init);

		for (const initSectorKey of initSectorKeysList) {
			switch (initSectorKey) {
				// Проверка секции изображений на правильность ссылок
				case "images":
					const imagesKeywordValuesList = Object.values(novelExecutableObject.init[
						"images"
					] as d.INovelExecutableObject.IInit.TImagesOptions);

					for (const imagesKeywordValue of imagesKeywordValuesList)
						if (typeof imagesKeywordValue != "string")
							throw this.throwParseException(ML.exceptions.invalidInitImagesSection);
					break;

				// Та же проверка, только для персонажей
				case "characters":
					if (!Array.isArray(novelExecutableObject.init.characters))
						throw this.throwParseException(ML.exceptions.invalidInitCharactersSection);

					for (const characterSectionKey of novelExecutableObject.init.characters)
						if (typeof characterSectionKey != "string")
							throw this.throwParseException(ML.exceptions.invalidInitCharactersSectionData);
					break;

				default:
					break;
			}
		}

		// Проверка сектора SCREEN
		const screenSectorAllowedKeysList = [ "action", "options" ];

		for (const screenObject of novelExecutableObject.screen) {
			const screenObjectKeys = Object.keys(screenObject);
			for (const screenObjectKey of screenObjectKeys)
				if (!screenSectorAllowedKeysList.includes(screenObjectKey))
					throw this.throwParseException(ML.exceptions.invalidScreenActionData);
		}

		return novelExecutableObject;
	}

	// Функция выполнения исходного кода сектора INIT
	public async processInitSector (init: d.INovelExecutableObject.IInit): Promise<d.TInitResult> {
		// Список загруженных изображений
		const imagesList: { [key: string]: string }[] = [];

		// Список загруженных персонажей
		const charactersList: { [key: string]: d.ICharacterData }[] = [];

		// Контейнер для промисов загрузки изображений
		const imageLoadPromises: Promise<{ [key: string]: string }>[] = [];

		// Загрузка изображений, если запрошено
		if (init.images) {
			for (const imageName of Object.keys(init.images)) {
				const imagePath = init.images[imageName];
				const imageBlob = await fetch(imagePath).then(res => res.blob());

				const reader = new FileReader();
				const loadPromise = new Promise(
					(resolve: (value: { [key: string]: string }) => void, reject) => {
						reader.onload = () => resolve({ [imageName]: reader.result as string });
						reader.onerror = () => reject();

						reader.readAsDataURL(imageBlob);
					}
				);

				imageLoadPromises.push(loadPromise);
			}
		}

		// Контейнер для промисов загрузки персонажей
		const characterLoadPromises: Promise<{ [key: string]: d.ICharacterData }>[] = [];

		// Загрузка персонажей, если запрошено
		if (init.characters) {
			for (const characterFilePath of init.characters) {
				// Загрузка файла персонажа
				const characterFileBuffer = await fetch(characterFilePath).then(res => res.arrayBuffer());

				// Разархивирование файла персонажа и парсинг мета-данных
				const characterFile = await JSZip.loadAsync(characterFileBuffer);
				const metadataFile = characterFile.file("metadata.json");

				if (!metadataFile) throw this.throwParseException(ML.exceptions.noCharacterMetadataFile);

				// Получение файла с мета-данными персонажа
				const characterMetadata: d.ICharacterData.ICharacterMetadataFile = JSON.parse(
					await metadataFile.async("text")
				);

				const characterData: d.ICharacterData = {
					...characterMetadata,

					spriteVisible: true,
					defaultSprite: 0,
					nameVisible: true
				};

				// Перезапись экстра опций персонажа, если запрошено
				const characterExtraOptions = init[characterData.name] as any;
				if (characterExtraOptions) {
					// Получение экстра-опций из исполняемого файла
					const hideNameByDefault = characterExtraOptions["hideNameByDefault"];
					const hideSpriteByDefault = characterExtraOptions["hideSpriteByDefault"];
					const defaultSpriteIndex = characterExtraOptions["defaultSpriteIndex"];
					const rewriteNameColor = characterExtraOptions["rewriteNameColor"];

					// Перезапись опций в объекте персонажа
					if (hideNameByDefault && hideNameByDefault === true) characterData.nameVisible = false;
					if (hideSpriteByDefault && hideSpriteByDefault === true)
						characterData.spriteVisible = false;

					if (defaultSpriteIndex) characterData.defaultSprite = defaultSpriteIndex;
					if (rewriteNameColor) characterData.color = rewriteNameColor;
				}

				// Загрузка спрайтов персонажа
				const promise = new Promise(
					(resolve: (value: { [key: string]: d.ICharacterData }) => void) => {
						for (const stateName of Object.keys(characterData.sprites)) {
							const stateFilePath = characterData.sprites[stateName];
							const stateFile = characterFile.file(stateFilePath);

							if (!stateFile) (characterData as any).sprites[stateName] = null;
							else
								stateFile.async("base64").then(stateFileBase64 => {
									(characterData as any).sprites[stateName] = new Base64Image(
										stateFilePath,
										stateFileBase64
									).base64;

									resolve({ [characterData.name]: characterData });
								});
						}
					}
				);

				characterLoadPromises.push(promise);
			}
		}

		// Добавление изображений в общий список после загрузки
		for (const image of await Promise.all(imageLoadPromises)) imagesList.push(image);

		// Добавление персонажей в общий список после загрузки
		for (const character of await Promise.all(characterLoadPromises)) charactersList.push(character);

		return { imagesList, charactersList };
	}

	public async processScreenSector (memory: d.TInitResult, screen: d.INovelExecutableObject.IScreen) {
		console.log(memory, screen);
	}
}

export default Core;
