import areMovesLeft from './areMovesLeft';
import evaluate from './evaluate';

let player = 'x';
let opponent = 'o';
const minimax = (board: string[][], depth: number, isMax: boolean): number => {
	let score = evaluate(board);

	if (score !== 0) {
		return score;
	}

	if (areMovesLeft(board) === false) {
		return 0;
	}

	if (isMax) {
		let best = Number.MIN_SAFE_INTEGER;

		for (let i = 0; i < 3; i++) {
			for (let j = 0; j < 3; j++) {
				if (board[i][j] === '_') {
					board[i][j] = player;

					best = Math.max(best, minimax(board, depth + 1, !isMax));

					board[i][j] = '_';
				}
			}
		}
		return best;
	} else {
		let best = Number.MAX_SAFE_INTEGER;

		for (let i = 0; i < 3; i++) {
			for (let j = 0; j < 3; j++) {
				if (board[i][j] === '_') {
					board[i][j] = opponent;

					best = Math.min(best, minimax(board, depth + 1, !isMax));

					board[i][j] = '_';
				}
			}
		}
		return best;
	}
};
export default minimax;
