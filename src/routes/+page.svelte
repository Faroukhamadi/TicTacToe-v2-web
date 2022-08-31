<script lang="ts">
	import { findBestMove, findRandomMove, Move } from '../utils/findMove';
	import { isAIWin, isDraw, isPlayerWin } from '../utils/gameResult';
	import evaluate from '../utils/evaluate';
	import initBoard from '../utils/initBoard';
	import restart from '../utils/restart';

	let board = initBoard();

	let player = 'o';
	let opponent = '+';

	let playerScore = 0;
	let AIScore = 0;
	let drawCount = 0;
	let difficulty = 'easy';

	$: console.log('difficulty is: ', difficulty);
	let AITurn = true;
	if (AITurn) {
		let bestMove: Move;
		if (difficulty === 'hard') {
			bestMove = findBestMove(board, player, opponent);
			board[bestMove.row][bestMove.col] = player;
		} else if (difficulty === 'easy') {
			bestMove = findRandomMove(board);
			board[bestMove.row][bestMove.col] = player;
		}
	}
</script>

<svelte:head>
	<title>TicTacToe</title>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" />
	<link href="https://fonts.googleapis.com/css2?family=Roboto&display=swap" rel="stylesheet" />
</svelte:head>

<div class="container">
	<div class="game-brd">
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
								let bestMove;
								if (difficulty === 'hard') {
									bestMove = findBestMove(board, player, opponent);
									board[bestMove.row][bestMove.col] = player;
								} else if (difficulty === 'easy') {
									bestMove = findRandomMove(board);
									board[bestMove.row][bestMove.col] = player;
								}
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
			<p>{playerScore}</p>
		</div>
		<div class="score-container">
			<p>TIE</p>
			<p>{drawCount}</p>
		</div>
		<div class="score-container">
			<p>{difficulty === 'easy' ? 'EASY ' : 'UNBEATABLE '}AI(O)</p>
			<p>{AIScore}</p>
		</div>
	</div>

	<div class="button-container">
		<button on:click={() => (difficulty = 'easy')} id="ez">EASY</button>
		<button on:click={() => (difficulty = 'hard')} id="hrd">HARD</button>
		<button
			on:click={() => {
				let evaluateRes = evaluate(board, player, opponent);

				if (isPlayerWin(evaluateRes)) {
					playerScore++;
				} else if (isDraw(evaluateRes, board)) {
					drawCount++;
				} else if (isAIWin(evaluateRes)) {
					AIScore++;
				}

				let restartRes = restart(AITurn);
				board = restartRes.board;
				AITurn = restartRes.AITurn;
			}}
			id="rs">RESTART</button
		>
	</div>
	<footer>
		<a href="https://github.com/Faroukhamadi" target="_blank">
			<img src="GitHub-Mark-Light-32px.png" alt="Github Logo" /></a
		>
		<p>
			Created by <a href="https://github.com/Faroukhamadi" target="_blank">Farouk Hamadi</a> with Love,
			Affection and Care.
		</p>
	</footer>
</div>

<style>
	footer {
		width: 100%;
		height: 10vh;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	footer > p > a {
		color: white;
	}

	footer > a {
		opacity: 0.6;
		transition: 300ms opacity ease-in-out;
	}

	footer > a:hover {
		opacity: 1;
	}

	footer > p {
		margin-left: 1%;
		font-size: medium;
		font-family: 'sans-serif';
		color: white;
	}

	.score-container {
		font-family: sans-serif;
		font-size: xx-large;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.score-container > p {
		margin-top: 0.5em;
		margin-bottom: 0.2em;
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

	#rs:hover {
		border-color: black;
	}

	.button-container {
		display: flex;
		gap: 20px;
		margin-top: 30px;
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
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		gap: 14px;
		margin: 0;
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
		width: 200px;
		height: 150px;
		text-align: center;
		display: flex;
		justify-content: center;
		align-items: center;
		color: white;
		font-size: 150px;
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
