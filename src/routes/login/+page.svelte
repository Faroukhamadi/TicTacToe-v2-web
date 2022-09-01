<script lang="ts">
	import { goto } from '$app/navigation';
	import { name } from '../../stores';

	let playerName: string;
</script>

<input bind:value={playerName} />
<button
	on:click={async () => {
		console.log('player name: ', playerName);
		name.set(playerName);
		await goto('/');
	}}>submit</button
>
