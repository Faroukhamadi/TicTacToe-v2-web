<script lang="ts">
	import findBestMove from '../utils/findBestMove';

	let board = [
		['_', '_', '_'],
		['_', '_', '_'],
		['_', '_', '_']
	];
	let player = '+';
	let opponent = 'o';
	let bestMove = findBestMove(board, player, opponent);
	board[bestMove.row][bestMove.col] = '+';
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
							board[i][j] = opponent;
							let bestMove = findBestMove(board, player, opponent);
							board[bestMove.row][bestMove.col] = '+';
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
