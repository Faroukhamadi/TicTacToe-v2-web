import minimax from './minimax';

let player = 'x';
let opponent = 'o';

class Move {
	constructor(row: number, col: number) {
		// @ts-ignore
		this.row = row;
		// @ts-ignore
		this.col = row;
	}
}

const findBestMove = (board: string[][]): Move => {
	let bestVal = Number.MIN_SAFE_INTEGER;
	let bestMove = new Move(-1, -1);

	for (let i = 0; i < 3; i++) {
		for (let j = 0; j < 3; j++) {
			if (board[i][j] === '_') {
				board[i][j] = player;
				let moveVal = minimax(board, 0, false);
				board[i][j] = '_';
				console.log('moveVal: ', moveVal);
				console.log('i:', i, 'j:', j);

				if (moveVal > bestVal) {
					bestMove.row = i;
					bestMove.col = j;
					bestVal = moveVal;
				}
			}
		}
	}
	return bestMove;
};

export default findBestMove;
