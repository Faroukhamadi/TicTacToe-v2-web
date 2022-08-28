<script lang="ts">
	import findBestMove from '../utils/findBestMove';

	let board = [
		['x', 'o', 'x'],
		['o', 'o', 'x'],
		['_', '_', '_']
	];

	let bestMove = findBestMove(board);
	console.log(bestMove);
</script>

<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>
