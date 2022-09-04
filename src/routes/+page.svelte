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
	import { onDisconnect, ref, onValue, onChildAdded, push, get, set } from 'firebase/database';
	import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
	import { auth, db } from '../lib/firebase/index';
	import type { DatabaseReference } from 'firebase/database';
	import type { PageData } from './$types';

	interface PlayerValue {
		id: string;
		name: string;
	}

	export let data: PageData;
	let playerId: string;
	let playerRef: DatabaseReference;
	let gameRef: DatabaseReference;
	let players: {
		[key: string]: PlayerValue;
	};

	onMount(() => {
		async function fetch() {
			await signInAnonymously(auth);
		}

		const initGame = () => {
			const allGamesRef = ref(db, 'games');

			const allPlayersRef = ref(db, 'players');
			console.log('players ref: ', allPlayersRef.parent);
			console.log('games ref: ', allGamesRef);

			onValue(allGamesRef, (snapshot) => {});

			onValue(allPlayersRef, (snapshot) => {
				// console.log('This is an event that fires whenever a change occurs: ', snapshot.val());
				players = snapshot.val() || {};
				Object.keys(players).forEach((uid) => {
					const player = players[uid];
					// console.log('--------------uid---------------------: ', uid);
					// console.log('--------------this is player id---------------------: ', player.id);
					// console.log('--------------this is player name---------------------: ', player.name);
					// TODO: make firebase realtime db object look like this: https://miro.medium.com/max/1400/1*ZLZB_Oa3hK9kTMid5iNZ8A.png
				});
			});

			onChildAdded(allPlayersRef, (snapshot) => {
				console.log('This is an event that fires whenever a player joins: ', snapshot.val().id);
				if (snapshot.val().id === playerId) {
					// console.log('this is me: ', snapshot.val());
				} else {
					// console.log('this is not me: ', snapshot.val());
				}
			});
		};
		onAuthStateChanged(auth, (user) => {
			if (user) {
				playerId = user.uid;
				const allGamesRef = ref(db, 'games');
				let gameId: string | null;
				get(allGamesRef).then((snapshot) => {
					if (snapshot.val()) {
						Object.keys(snapshot.val()).forEach((key) => {
							if (
								snapshot.val()[key].players &&
								Object.keys(snapshot.val()[key].players).length === 1
							) {
								// GET GAMEID AND ADD SECOND PLAYER
								console.log('------------------1------------------');
								playerRef = ref(db, `games/${key}/players`);
								gameRef = ref(db, `games/${key}`);
								// ----------------------------------->>>>>>>>>>>>>>>>>>>>><<<<<<<<<<<<<<<<<<<<<-----------------------------------------
								// is this the way to go ? I replaced set with push
								push(playerRef, {
									id: playerId,
									name: data.name,
									moves: [
										{ i: 1, j: 2 },
										{ i: 0, j: 2 },
										{ i: 1, j: 0 }
									]
								});
							} else {
								// CREATE NEW GAME AND ADD FIRST PLAYER
								console.log('------------------2------------------');
								gameId = push(allGamesRef).key;
								playerRef = ref(db, `games/${gameId}/players/${playerId}`);
								gameRef = ref(db, `games/${gameId}`);
								set(gameRef, {
									turn: playerId,
									ready: {
										player1: true,
										player2: true
									}
								});
								set(playerRef, {
									id: playerId,
									name: data.name,
									moves: [
										{ i: 1, j: 2 },
										{ i: 0, j: 2 },
										{ i: 1, j: 0 }
									]
								});
							}
						});
					} else {
						// NO GAME HAS EVER BEEN CREATED
						console.log('------------------3------------------');
						gameId = push(allGamesRef).key;
						playerRef = ref(db, `games/${gameId}/players/${playerId}`);
						gameRef = ref(db, `games/${gameId}`);
						set(gameRef, {
							turn: playerId,
							ready: {
								player1: true,
								player2: true
							}
						});
						set(playerRef, {
							id: playerId,
							name: data.name,
							moves: [
								{ i: 1, j: 2 },
								{ i: 0, j: 2 },
								{ i: 1, j: 0 }
							]
						});
					}
				});
				onDisconnect(playerRef).remove();
				// You're logged in
			} else {
				// You're logged out
			}
		});

		fetch();
		initGame();

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
