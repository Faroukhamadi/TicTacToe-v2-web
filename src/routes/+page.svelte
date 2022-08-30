<script lang="ts">
	import evaluate from '../utils/evaluate';
	import { isAIWin, isPlayerWin, isDraw } from '../utils/gameResult';
	import findBestMove from '../utils/findBestMove';
	import initBoard from '../utils/initBoard';
	import restart from '../utils/restart';
	import { disabled, registerClick } from '../stores';

	let board = initBoard();

	let player = 'o';
	let opponent = '+';
	let AITurn = true;
	if (AITurn) {
		let bestMove = findBestMove(board, player, opponent);
		board[bestMove.row][bestMove.col] = player;
	}
</script>

<svelte:head>
	<title>TicTacToe</title>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" />
	<link href="https://fonts.googleapis.com/css2?family=Roboto&display=swap" rel="stylesheet" />
</svelte:head>

<div class="container">
	<div
		class="game-brd"
		on:click={() => {
			setTimeout(() => {
				disabled.set(false);
			}, 3000);
			let evaluateRes = evaluate(board, player, opponent);
			if (
				(isPlayerWin(evaluateRes) || isAIWin(evaluateRes) || isDraw(evaluateRes, board)) &&
				!$disabled
			) {
				console.log('we in this bitch');

				let restartRes = restart(AITurn);
				if (isPlayerWin(evaluateRes)) {
					board = restartRes.board;
					AITurn = restartRes.AITurn;
				} else if (isDraw(evaluateRes, board)) {
					board = restartRes.board;
					AITurn = restartRes.AITurn;
				}
				evaluateRes = evaluate(board, player, opponent);
				if (isAIWin(evaluateRes)) {
					board = restartRes.board;
					AITurn = restartRes.AITurn;
				} else if (isDraw(evaluateRes, board)) {
					board = restartRes.board;
					AITurn = restartRes.AITurn;
				}
			}
		}}
	>
		{#each board as col, i}
			{#each col as box, j}
				{#if box === '+'}
					<div class="col" id={'col' + (i * 3 + j).toString()}><p class="x">{box}</p></div>
				{:else if box === 'o'}
					<div class="col" id={'col' + (i * 3 + j).toString()}><p>{box}</p></div>
				{:else}
					<div
						class="col"
						id={'col' + (i * 3 + j).toString()}
						on:click={() => {
							let evaluateRes = evaluate(board, player, opponent);
							if (
								!isPlayerWin(evaluateRes) &&
								!isAIWin(evaluateRes) &&
								!isDraw(evaluateRes, board)
							) {
								board[i][j] = opponent;
								let bestMove = findBestMove(board, player, opponent);
								board[bestMove.row][bestMove.col] = player;
								disabled.set(true);
							}
							if (isPlayerWin(evaluateRes) || isAIWin(evaluateRes) || isDraw(evaluateRes, board)) {
								console.log('trueeeeeeeeeee');
								console.log(isPlayerWin(evaluateRes));
								console.log(isAIWin(evaluateRes));
								console.log(isDraw(evaluateRes, board));
								registerClick.set(true);
							}
						}}
					/>
				{/if}
			{/each}
		{/each}
	</div>
	<div class="footer-container">
		<div class="score-container">
			<p>PLAYER1(X)</p>
			<p>0</p>
		</div>
		<div class="score-container">
			<p>TIE</p>
			<p>0</p>
		</div>
		<div class="score-container">
			<p>AI(O)</p>
			<p>0</p>
		</div>
	</div>

	<div class="button-container">
		<button id="ez">EASY</button>
		<button id="hrd">HARD</button>
	</div>
</div>

<style>
	.score-container {
		font-family: sans-serif;
		font-size: xx-large;
	}

	.footer-container {
		display: flex;
		gap: 150px;
	}

	button {
		color: white;
		background: black;
		font-size: xx-large;
		width: 300px;
		height: 100px;
		border-radius: 15px;
		border: 5px solid white;
		cursor: pointer;
		transition: 300ms background-color ease-in-out, 300ms color ease-in-out,
			300ms border-color ease-in-out;
	}

	button:hover {
		background-color: white;
		color: black;
	}

	#ez:hover {
		border-color: green;
	}

	#hrd:hover {
		border-color: red;
	}

	.button-container {
		display: flex;
		gap: 20px;
	}

	.score-container {
		color: white;
	}

	:global(body) {
		background: black;
		height: 98vh;
		width: 99%;
	}

	.x {
		transform: rotate(45deg);
	}

	.container {
		height: 98vh;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		gap: 80px;
	}

	.game-brd {
		font-family: 'Roboto', sans-serif;
		display: grid;
		grid-template-columns: auto auto auto;
		justify-content: center;
	}

	.col {
		cursor: pointer;
		background-color: black;
		border: 4px solid white;
		width: 250px;
		height: 200px;
		text-align: center;
		display: flex;
		justify-content: center;
		align-items: center;
		color: white;
		font-size: 200px;
	}

	#col0,
	#col3,
	#col6 {
		border-left: white;
	}

	#col2,
	#col5,
	#col8 {
		border-right: white;
	}

	#col0,
	#col1,
	#col2 {
		border-top: white;
	}

	#col6,
	#col7,
	#col8 {
		border-bottom: 0px;
	}
</style>
