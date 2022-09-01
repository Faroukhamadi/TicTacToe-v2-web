<script lang="ts">
	import { findBestMove, findRandomMove, Move } from '../lib/utils/findMove';
	import { isAIWin, isDraw, isPlayerWin } from '../lib/utils/gameResult';
	import evaluate from '../lib/utils/evaluate';
	import initBoard from '../lib/utils/initBoard';
	import restart from '../lib/utils/restart';
	import Footer from '../lib/components/Footer.svelte';
	import Difficulty from '../lib/components/Difficulty.svelte';
	import convertIndexCol from '../lib/utils/convertIndex';
	import { onMount } from 'svelte';
	import { initializeApp, getApps, getApp } from 'firebase/app';
	import { ref } from 'firebase/database';
	import { set, type DatabaseReference } from 'firebase/database';
	import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
	import type { FirebaseApp } from 'firebase/app';
	import { auth, db } from '../lib/firebase/index';
	import { name } from '../stores';

	let playerId: string;
	let playerRef: DatabaseReference;

	onMount(() => {
		async function fetch() {
			await signInAnonymously(auth);
		}

		onAuthStateChanged(auth, (user) => {
			console.log('user: ', user);
			if (user) {
				playerId = user.uid;
				playerRef = ref(db, `players/${playerId}`);
				console.log('this is playedId: ', playerId);
				console.log('this is playedRef: ', playerRef);
				set(playerRef, {
					id: playerId,
					name: $name,
					direction: 'right',
					color: 'red'
				});
				// You're logged in
			} else {
				// You're logged out
			}
		});

		fetch();

		return () => console.log('destroyed');
	});

	let board = initBoard();

	let player = 'o';
	let opponent = '+';

	let playerScore = 0;
	let AIScore = 0;
	let drawCount = 0;
	let difficulty = 'easy';

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
					<div class="col" id={convertIndexCol(i, j)}><p class="x">{box}</p></div>
				{:else if box === 'o'}
					<div class="col" id={convertIndexCol(i, j)}><p>{box}</p></div>
				{:else}
					<div
						class="col"
						id={convertIndexCol(i, j)}
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
								} else if (
									difficulty === 'easy' &&
									!isPlayerWin(evaluateRes) &&
									!isAIWin(evaluateRes) &&
									!isDraw(evaluateRes, board)
								) {
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
	<Difficulty {playerScore} {AIScore} {drawCount} {difficulty} />
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
	<Footer />
</div>

<style>
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
