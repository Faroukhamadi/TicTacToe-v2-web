import initBoard from './initBoard';

interface Restart {
	board: string[][];
	AITurn: boolean;
}

const restart = (AITurn: boolean): Restart => {
	return {
		board: initBoard(),
		AITurn: !AITurn
	};
};

export default restart;
