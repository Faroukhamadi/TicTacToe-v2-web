<script lang="ts">
	import type { DatabaseReference } from 'firebase/database';
	import type { PageData } from './$types';
	import evaluate from '$lib/utils/evaluate';
	import initBoard from '$lib/utils/initBoard';
	import restart from '$lib/utils/restart';
	import Footer from '$lib/components/Footer.svelte';
	import Score from '$lib/components/Score.svelte';
	import convertIndexCol from '../lib/utils/convertIndex';
	import { findBestMove, findRandomMove, Move } from '../lib/utils/findMove';
	import { isAIWin, isDraw, isPlayerWin } from '../lib/utils/gameResult';
	import { onMount } from 'svelte';
	import { onAuthStateChanged } from 'firebase/auth';
	import { signIn, auth, db } from '$lib/firebase/index';
	import {
		onDisconnect,
		ref,
		onValue,
		push,
		get,
		set,
		update,
		remove,
		increment
	} from 'firebase/database';

	type Mode = 'easy' | 'hard' | 'multiplayer';

	// Server side data
	export let data: PageData;
	let playerId: string;
	let gameId: string | null;
	let playerRef: DatabaseReference;
	let gameRef: DatabaseReference;
	let player1Score: number = 0;
	let player2Score: number = 0;
	let tie: number = 0;
	let player1Name: string = 'Waiting...';
	let player2Name: string = 'Waiting...';

	onMount(() => {});

	// Client side data
	let board = initBoard();

	let player = 'o';
	let opponent = '+';

	let playerScore = 0;
	let AIScore = 0;
	let drawCount = 0;
	let mode: Mode = 'easy';

	let AITurn = true;

	if (AITurn) {
		let bestMove: Move;
		bestMove = findRandomMove(board);
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
									const unsubscribe = onValue(gameRef, (snapshot) => {
										const data = snapshot.val();
										let playerKeys = Object.keys(data.players);
										// @ts-ignore
										if (playerKeys.length === 2 && data.turn === auth.currentUser.uid) {
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

											update(ref(db), updates).then(() => {
												console.log('updated');
											});
										}
									});
									unsubscribe();
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
	<Score
		{playerScore}
		{AIScore}
		{drawCount}
		{mode}
		{player1Score}
		{player2Score}
		{tie}
		{player1Name}
		{player2Name}
	/>
	<div class="button-container">
		<button on:click={() => (mode = 'easy')} id="ez">EASY</button>
		<button on:click={() => (mode = 'hard')} id="hrd">HARD</button>
		<button
			on:click={() => {
				mode = 'multiplayer';
				signIn();
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

									player1Name = data.players[playerKeys[0]].name;
									player2Name = data.players[playerKeys[1]].name;

									player1Score = data.score.player1;
									player2Score = data.score.player2;
									tie = data.score.tie;

									if (player1Moves) {
										// @ts-ignore
										player1Moves.forEach((move) => {
											if (board[move.i][move.j] === '_') {
												board[move.i][move.j] = '+';
											}
										});
									}

									if (player2Moves) {
										// @ts-ignore
										player2Moves.forEach((move) => {
											if (board[move.i][move.j] === '_') {
												board[move.i][move.j] = 'o';
											}
										});
									}

									if (!player1Moves && !player2Moves) {
										board = initBoard();
									}
								} else if (data.joined === 2) {
									let gameRef = ref(db, `games/${gameId}`);
									remove(gameRef).then(() => {
										console.log('game removed because there are no players left');
									});
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
										state = 1;
										playerRef = ref(db, `games/${key}/players`);
										gameRef = ref(db, `games/${key}`);
										gameId = key;
									} else {
										// CREATE NEW GAME AND ADD FIRST PLAYER
										state = 2;
										gameId = push(allGamesRef).key;
										playerRef = ref(db, `games/${gameId}/players`);
										gameRef = ref(db, `games/${gameId}`);
										set(gameRef, {
											turn: playerId,
											joined: 0,
											score: {
												player1: 0,
												tie: 0,
												player2: 0
											}
										});
									}
								});
							} else {
								// NO GAME HAS EVER BEEN CREATED
								state = 3;
								gameId = push(allGamesRef).key;
								playerRef = ref(db, `games/${gameId}/players/${playerId}`);
								gameRef = ref(db, `games/${gameId}`);
								set(gameRef, {
									turn: playerId,
									joined: 0,
									score: {
										player1: 0,
										tie: 0,
										player2: 0
									}
								});
							}
							if (state === 1) {
								push(playerRef, {
									id: playerId,
									name: data.name
								});
								onDisconnect(playerRef)
									.remove()
									.then(() => {
										const updates = {};
										// @ts-ignore
										updates[`games/${gameId}/joined`] = increment(1);
										update(ref(db), updates).then(() => {
											console.log('updated');
										});
									});
							} else if (state === 2 || state === 3) {
								set(playerRef, {
									id: playerId,
									name: data.name
								});
								onDisconnect(playerRef)
									.remove()
									.then(() => {
										const updates = {};
										// @ts-ignore
										updates[`games/${gameId}/joined`] = increment(1);
										update(ref(db), updates).then(() => {
											console.log('updated');
										});
									});
							}
						});
						// You're logged in
					} else {
						// You're logged out
					}
				});

				updateMultiplayerBoard();

				board = initBoard();
			}}
			id="mtp">MULTIPLAYER</button
		>
		<button
			disabled={mode === 'multiplayer' &&
				!(
					isPlayerWin(evaluate(board, player, opponent)) ||
					isAIWin(evaluate(board, player, opponent)) ||
					isDraw(evaluate(board, player, opponent), board)
				)}
			on:click={() => {
				let evaluateRes = evaluate(board, player, opponent);

				// delete moves when you restart
				const updates = {};
				if (mode === 'multiplayer') {
					if (isPlayerWin(evaluateRes)) {
						// @ts-ignore
						updates[`/games/${gameId}/score/player1`] = increment(1);
					} else if (isDraw(evaluateRes, board)) {
						// @ts-ignore
						updates[`/games/${gameId}/score/tie`] = increment(1);
					} else if (isAIWin(evaluateRes)) {
						// @ts-ignore
						updates[`/games/${gameId}/score/player2`] = increment(1);
					}
				} else {
					if (isPlayerWin(evaluateRes)) {
						playerScore++;
					} else if (isDraw(evaluateRes, board)) {
						drawCount++;
					} else if (isAIWin(evaluateRes)) {
						AIScore++;
					}
				}

				let restartRes = restart(AITurn);
				board = restartRes.board;
				AITurn = restartRes.AITurn;

				let playersRef = ref(db, `games/${gameId}/players`);
				get(playersRef).then((snapshot) => {
					if (snapshot.exists()) {
						const data = snapshot.val();
						const playerKeys = Object.keys(data);
						// @ts-ignore
						updates[`/games/${gameId}/players/${playerKeys[0]}/moves`] = null;
						// @ts-ignore
						updates[`/games/${gameId}/players/${playerKeys[1]}/moves`] = null;

						update(ref(db), updates).then(() => {
							console.log('updated moves to null');
						});
					}
				});
			}}
			id="rs">RESTART</button
		>
	</div>
	<Footer />
</div>

<style>
	#rs:disabled {
		cursor: not-allowed;
	}

	#rs:disabled:hover {
		border-color: white;
		background-color: black;
		color: white;
	}

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

	@media only screen and (min-width: 320px) and (max-width: 480px) {
		.button-container {
			display: grid;
			gap: 30px;
		}
		button {
			width: 100px;
		}
		.col {
			width: 120px;
			height: 120px;
			border: 2px solid white;
		}
		.game-brd {
			width: 20px;
		}
	}
</style>
