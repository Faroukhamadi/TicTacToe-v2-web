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
	import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
	import { auth, db } from '../lib/firebase/index';
	import type { DatabaseReference } from 'firebase/database';
	import type { PageData } from './$types';
	import {
		onDisconnect,
		ref,
		onValue,
		onChildAdded,
		push,
		get,
		set,
		update
	} from 'firebase/database';

	export let data: PageData;
	let playerId: string;
	let gameId: string | null;
	let playerRef: DatabaseReference;
	let gameRef: DatabaseReference;

	onMount(() => {
		async function signIn() {
			await signInAnonymously(auth);
		}

		const updateMultiplayerBoard = () => {
			const allGamesRef = ref(db, 'games');
			onValue(allGamesRef, (snapshot) => {
				if (gameId) {
					const data = snapshot.val()[gameId];

					if (data.players) {
						let playerKeys = Object.keys(data.players);

						if (playerKeys.length === 2) {
							const player1Moves = data.players[playerKeys[0]].moves;
							const player2Moves = data.players[playerKeys[1]].moves;

							if (player1Moves) {
								// @ts-ignore
								player1Moves.forEach((move) => {
									board[move.i][move.j] = '+';
								});
							}

							if (player2Moves) {
								// @ts-ignore
								player2Moves.forEach((move) => {
									board[move.i][move.j] = 'o';
								});
							}
						}
					}
				}
			});
		};

		onAuthStateChanged(auth, (user) => {
			if (user) {
				playerId = user.uid;
				let state = -1;
				const allGamesRef = ref(db, 'games');
				get(allGamesRef).then((snapshot) => {
					if (snapshot.val()) {
						Object.keys(snapshot.val()).forEach((key) => {
							if (
								snapshot.val()[key].players &&
								Object.keys(snapshot.val()[key].players).length === 1
							) {
								// GET GAMEID AND ADD SECOND PLAYER
								console.log('------------------1------------------');
								state = 1;
								playerRef = ref(db, `games/${key}/players`);
								gameRef = ref(db, `games/${key}`);
								gameId = key;
							} else {
								// CREATE NEW GAME AND ADD FIRST PLAYER
								console.log('------------------2------------------');
								state = 2;
								gameId = push(allGamesRef).key;
								playerRef = ref(db, `games/${gameId}/players`);
								gameRef = ref(db, `games/${gameId}`);
								set(gameRef, {
									turn: playerId,
									ready: {
										player1: true,
										player2: true
									}
								});
								const allPlayersRef = ref(db, `games/${gameId}/players`);

								onChildAdded(allPlayersRef, (snapshot) => {
									if (snapshot.val().id === playerId) {
										// console.log('this is me: ', snapshot.val());
									} else {
										// console.log('this is not me: ', snapshot.val());
									}
								});
							}
						});
					} else {
						// NO GAME HAS EVER BEEN CREATED
						console.log('------------------3------------------');
						state = 3;
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

						const allPlayersRef = ref(db, `games/${gameId}/players`);

						onChildAdded(allPlayersRef, (snapshot) => {
							// console.log('This is an event that fires whenever a player joins: ', snapshot.val());
							if (snapshot.val().id === playerId) {
								// console.log('this is me: ', snapshot.val());
							} else {
								// console.log('this is not me: ', snapshot.val());
							}
						});
					}
					// try this here
					if (state === 1) {
						push(playerRef, {
							id: playerId,
							name: data.name
						});
						onDisconnect(playerRef).remove();
					} else if (state === 2 || state === 3) {
						set(playerRef, {
							id: playerId,
							name: data.name
						});
						onDisconnect(playerRef).remove();
					}
				});
				// You're logged in
			} else {
				// You're logged out
			}
		});

		signIn();
		updateMultiplayerBoard();

		return () => console.log('destroyed');
	});

	let board = initBoard();

	let player = 'o';
	let opponent = '+';

	let playerScore = 0;
	let AIScore = 0;
	let drawCount = 0;
	let mode = 'easy';

	let AITurn = true;
	if (AITurn) {
		let bestMove: Move;
		if (mode === 'hard') {
			bestMove = findBestMove(board, player, opponent);
			board[bestMove.row][bestMove.col] = player;
		} else if (mode === 'easy') {
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
								if (mode === 'multiplayer') {
									onValue(gameRef, (snapshot) => {
										const data = snapshot.val();
										let playerKeys = Object.keys(data.players);
										let playersIds = [];
										let id = '';
										let turn = '';
										playerKeys.forEach((key) => {
											playersIds.push(data.players[key].id);
											// @ts-ignore
											if (data.players[key].id === auth.currentUser.uid) {
												id = key;
											} else {
												turn = data.players[key].id;
											}
										});
										// @ts-ignore
										if (playerKeys.length === 2 && data.turn === auth.currentUser.uid) {
											let moves;
											if (
												// @ts-ignore
												data.players[id].moves &&
												// @ts-ignore
												!data.players[id].moves.some(
													// @ts-ignore
													(move) => move.i === i && move.j === j
												)
											) {
												// @ts-ignore
												moves = data.players[id].moves;
												moves.push({ i, j });
												// @ts-ignore
											} else if (!data.players[id].moves) {
												moves = [{ i, j }];
											}
											const updates = {};
											// @ts-ignore
											updates[`/games/${gameId}/players/${id}/moves`] = moves;
											// @ts-ignore
											updates[`/games/${gameId}/turn`] = turn;

											update(ref(db), updates);
										}
									});
								} else {
									board[i][j] = opponent;
									let bestMove;
									if (mode === 'hard') {
										bestMove = findBestMove(board, player, opponent);
										board[bestMove.row][bestMove.col] = player;
									} else if (
										mode === 'easy' &&
										!isPlayerWin(evaluateRes) &&
										!isAIWin(evaluateRes) &&
										!isDraw(evaluateRes, board)
									) {
										bestMove = findRandomMove(board);
										board[bestMove.row][bestMove.col] = player;
									}
								}
							}
						}}
					/>
				{/if}
			{/each}
		{/each}
	</div>
	<Difficulty {playerScore} {AIScore} {drawCount} {mode} />
	<div class="button-container">
		<button on:click={() => (mode = 'easy')} id="ez">EASY</button>
		<button on:click={() => (mode = 'hard')} id="hrd">HARD</button>
		<button on:click={() => (mode = 'multiplayer')} id="mtp">MULTIPLAYER</button>
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
		min-width: 300px;
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

	#mtp:hover {
		border-color: white;
	}

	#rs:hover {
		border-color: white;
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
