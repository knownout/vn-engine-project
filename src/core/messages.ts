export const CoreMessagesList = {
	exceptions: {
		noInitSector:
			"Invalid executable file: no INIT sector found in given novel executable file",
		noScreenSector:
			"Invalid executable file: no SCREEN sector found in given novel executable file",

		invalidInitImagesSection:
			"Invalid INIT sector: images can only be defined with URL string of *.png or *.jpeg[jpg]",
		invalidInitCharactersSection:
			"Invalid INIT sector: characters data can be presented only as URL strings array",
		invalidInitCharactersSectionData:
			"Invalid INIT sector: character data can be presented only as URL string of *.chr file",
		invalidScreenActionData:
			"Invalid SCREEN sector: action request must be presented as string",

		noCharacterMetadataFile:
			"Invalid character file: metadata file for this character not found"
	}
};
