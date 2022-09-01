<script lang="ts">
	export let playerScore: number;
	export let AIScore: number;
	export let drawCount: number;
	export let difficulty: string;
</script>

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
