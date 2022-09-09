<script lang="ts">
	export let playerScore: number;
	export let AIScore: number;
	export let drawCount: number;

	export let mode: string;

	export let player1Score: number;
	export let player2Score: number;
	export let tie: number;

	export let player1Name: string;
	export let player2Name: string;
</script>

<!-- TODO: make X or O dependent on player and opponent when I implement multiplayer -->
<div class="footer-container">
	<div class="score-container">
		<p>{mode === 'multiplayer' ? player1Name : 'PLAYER1(X)'}</p>
		<p>{mode === 'multiplayer' ? player1Score : playerScore}</p>
	</div>
	<div class="score-container">
		<p>TIE</p>
		<p>{mode === 'multiplayer' ? tie : drawCount}</p>
	</div>
	<div class="score-container">
		{#if mode === 'easy'}
			<p>EASY AI(O)</p>
			<p>{AIScore}</p>
		{:else if mode === 'hard'}
			<p>UNBEATABLE AI(O)</p>
			<p>{AIScore}</p>
		{:else}
			<p>{mode === 'multiplayer' ? player2Name : 'PLAYER2(O)'}</p>
			<p>{player2Score}</p>
		{/if}
	</div>
</div>

<style>
	.score-container {
		color: white;
		cursor: default;
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

	@media only screen and (min-width: 320px) and (max-width: 480px) {
		.footer-container {
			display: flex;
			flex-direction: column;
			gap: 20px;
		}
	}
</style>
