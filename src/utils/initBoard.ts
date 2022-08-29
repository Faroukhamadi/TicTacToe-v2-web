const initBoard = (): string[][] => {
	return new Array(3).fill('_').map(() => new Array(3).fill('_'));
};

export default initBoard;
