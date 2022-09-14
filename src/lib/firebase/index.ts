import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import type { FirebaseOptions } from 'firebase/app';
import type { FirebaseApp } from 'firebase/app';

export const firebaseConfig: FirebaseOptions = {
	apiKey: 'AIzaSyDtY5nhWddcLCbZMsydQLYpB-tZcLYJbxo',
	authDomain: 'multiplayer-tictactoe-26d27.firebaseapp.com',
	databaseURL: 'https://multiplayer-tictactoe-26d27-default-rtdb.europe-west1.firebasedatabase.app',
	projectId: 'multiplayer-tictactoe-26d27',
	storageBucket: 'multiplayer-tictactoe-26d27.appspot.com',
	messagingSenderId: '894035868216',
	appId: '1:894035868216:web:132b78fdafd3ed596184cd',
	measurementId: 'G-QB7VFQFE3X'
};

const app: FirebaseApp = initializeApp(firebaseConfig, 'tic-tac-toe');

export const auth = getAuth(app);
export const db = getDatabase(app);

export const signIn = async (): Promise<void> => {
	console.log('sign in getting called');
	await signInAnonymously(auth);
};
