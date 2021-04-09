export interface ILayersList<T> {
	layersWrapperLayer: T;
	backgroundLayer: T;
	charactersLayer: T;
	controlsLayer: T;
}

type TAnimationType = "fade" | "crossfade" | null;
interface ICharacterInitOptions {
	hideNameByDefault: boolean;
	hideSpriteByDefault: boolean;
	defaultSpriteIndex: number;
}
export namespace INovelExecutableObject {
	export namespace IInit {
		export type TImagesOptions = { [key: string]: string };
		export type TCharactersOptions = string[];
		export type TDefaultKey = ICharacterInitOptions | string[] | { [key: string]: string } | undefined;
	}

	export interface IInit {
		images?: { [key: string]: string };
		characters?: string[];

		[key: string]: ICharacterInitOptions | string[] | { [key: string]: string } | undefined;
	}

	export namespace IScreen {
		export type TSetBackgroundAction = {
			action: "set-background";
			options: {
				background: string | null;
				animation?: TAnimationType;
			};
		};

		export type TRewriteEngineAction = {
			action: "rewrite-engine";
			options: {
				controlsVisibility: boolean;
				animationTime: number;
				speechTimePerSymbol: number;
			};
		};

		export type TUpdateCharacterAction = {
			action: "update-character";
			options: {
				character: string;
				state?: "show" | "hide";
				animation?: TAnimationType;
				sprite?: number | string;
			};
		};

		export type TUpdateDialogWindowAction = {
			action: "update-dialog-window";
			options: {
				text?: string[] | string;
				windowState?: "show" | "hide" | "clean";
				speaker?: string;
			};
		};
	}

	type TScreen = (
		| IScreen.TSetBackgroundAction
		| IScreen.TRewriteEngineAction
		| IScreen.TUpdateCharacterAction
		| IScreen.TUpdateDialogWindowAction)[];

	export interface IScreen extends TScreen {}
}

export interface INovelExecutableObject {
	init: INovelExecutableObject.IInit;

	screen: INovelExecutableObject.IScreen;
}

export namespace ICharacterData {
	export interface ICharacterMetadataFile {
		name: string;
		color: string;
		bio?: string;
		sprites: { [key: string]: string };
	}
}

export interface ICharacterData {
	name: string;
	color: string;
	bio?: string;

	defaultSprite: number | string;
	spriteVisible: boolean;
	nameVisible: boolean;

	sprites: { [key: string]: string };
}

export type TInitResult = {
	imagesList: { [key: string]: string }[];
	charactersList: { [key: string]: ICharacterData }[];
};
