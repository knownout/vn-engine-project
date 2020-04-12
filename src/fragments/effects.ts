function linearFadeEffect (
	from: number,
	to: number,
	time: number,
	callback: (defaultValue: number) => void
): Promise<void> {
	let coefficient = (to - from) / time * 4;
	if (from > to) coefficient = -coefficient;

	let defaultValue = 0;
	return new Promise(resolve => {
		const endEffect = () => {
			clearInterval(effectInterval);
			resolve();
		};

		const effectInterval = setInterval(() => {
			callback(defaultValue);
			defaultValue += coefficient;

			if (from > to) {
				if (defaultValue <= to) endEffect();
			} else if (defaultValue >= to) endEffect();
		}, 1);

		setTimeout(endEffect, time + 10);
	});
}

export { linearFadeEffect };
