<h1>Tic-Tac-Toe</h1>
<form action="/" enctype="multipart/form-data" method="post">
	<input spellcheck="false" autocomplete="off" placeholder="Player Name" name="name" />
	<button>submit</button>
</form>

<style>
	@import url('https://fonts.googleapis.com/css2?family=Caveat:wght@600&display=swap');

	h1 {
		color: white;
		font-family: 'Caveat', cursive;
		text-align: center;
		cursor: pointer;
		font-size: 100px;
	}
	:global(body) {
		background-color: black;
		/* height: 100vh; */
		width: 100vw;
	}
	form {
		/* height: 60vh; */
		width: 100vw;
		display: flex;
		justify-content: center;
		justify-content: center;
		align-items: center;
		gap: 10px;
	}
	input {
		min-width: 200px;
		min-height: 40px;
		border-radius: 7px;
		border: 1px solid white;
		text-indent: 20px;
		font-family: 'Caveat';
		font-size: x-large;
		outline: none;
	}
	button {
		min-width: 100px;
		min-height: 45px;
		border-radius: 7px;
		border: 1px solid grey;
		font-size: x-large;
		font-family: 'Caveat';
		cursor: pointer;
		background-color: white;
		transition: opacity 200ms ease-in-out;
	}
	button:hover {
		opacity: 0.8;
	}
	input::placeholder {
		font-family: 'Caveat';
	}
</style>
