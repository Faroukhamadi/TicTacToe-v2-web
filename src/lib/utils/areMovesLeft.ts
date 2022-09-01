const areMovesLeft = (board: string[][]): boolean => {
	for (let i = 0; i < 3; i++) {
		for (let j = 0; j < 3; j++) {
			if (board[i][j] === '_') {
				return true;
			}
		}
	}
	return false;
};
export default areMovesLeft;
