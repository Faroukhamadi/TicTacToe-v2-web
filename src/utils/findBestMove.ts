import minimax from './minimax';
class Move {
	row: number;
	col: number;
	constructor(row: number, col: number) {
		this.row = row;
		this.col = row;
	}
}

const findBestMove = (board: string[][], player: string, opponent: string): Move => {
	let bestVal = Number.MIN_SAFE_INTEGER;
	let bestMove = new Move(-1, -1);

	for (let i = 0; i < 3; i++) {
		for (let j = 0; j < 3; j++) {
			if (board[i][j] === '_') {
				board[i][j] = player;
				let moveVal = minimax(board, 0, false, player, opponent);
				board[i][j] = '_';

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
