<script lang="ts">
	export let playerScore: number;
	export let AIScore: number;
	export let drawCount: number;
	export let mode: string;
</script>

<!-- TODO: make X or O dependent on player and opponent when I implement multiplayer -->
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
		{#if mode === 'easy'}
			<p>EASY AI(O)</p>
		{:else if mode === 'hard'}
			<p>UNBEATABLE AI(O)</p>
		{:else}
			<p>PLAYER2(O)</p>
		{/if}
		<p>{AIScore}</p>
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
</style>
