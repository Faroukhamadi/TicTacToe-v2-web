import areMovesLeft from './areMovesLeft';

export const isDraw = (evaluateRes: number, board: string[][]): boolean => {
	if (evaluateRes === 0 && !areMovesLeft(board)) {
		return true;
	}
	return false;
};

export const isPlayerWin = (evaluateRes: number): boolean => {
	if (evaluateRes < 0) {
		return true;
	}
	return false;
};

export const isAIWin = (evaluateRes: number): boolean => {
	if (evaluateRes > 0) {
		return true;
	}
	return false;
};
