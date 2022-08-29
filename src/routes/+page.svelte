<script lang="ts">
	import evaluate from '../utils/evaluate';
	import { isAIWin, isPlayerWin, isDraw } from '../utils/gameResult';
	import findBestMove from '../utils/findBestMove';
	import initBoard from '../utils/initBoard';
	import restart from '../utils/restart';
	import { disabled } from '../stores';

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
				console.log('why am I even in here ?');
				let restartRes = restart(AITurn);
				if (isPlayerWin(evaluateRes)) {
					console.log('player won, that is unexpected');
					board = restartRes.board;
					AITurn = restartRes.AITurn;
				} else if (isDraw(evaluateRes, board)) {
					console.log('draw');
					board = restartRes.board;
					AITurn = restartRes.AITurn;
				}
				evaluateRes = evaluate(board, player, opponent);
				if (isAIWin(evaluateRes)) {
					console.log('AI won, that is expected');
					board = restartRes.board;
					AITurn = restartRes.AITurn;
				} else if (isDraw(evaluateRes, board)) {
					board = restartRes.board;
					AITurn = restartRes.AITurn;
					console.log('draw');
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
						}}
					/>
				{/if}
			{/each}
		{/each}
	</div>
</div>

<style>
	:global(body) {
		height: 100vh;
		width: 100%;
	}

	.x {
		transform: rotate(45deg);
	}

	.container {
		height: 100vh;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.game-brd {
		font-family: 'Roboto', sans-serif;
		display: grid;
		grid-template-columns: auto auto auto;
		justify-content: center;
	}

	.col {
		cursor: pointer;
		background-color: white;
		border: 4px solid black;
		width: 250px;
		height: 200px;
		text-align: center;
		display: flex;
		justify-content: center;
		align-items: center;
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
