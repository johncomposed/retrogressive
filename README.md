# Retrogressive (WIP)
Retrogressive is a trick-taking card game developed by my great uncle Johnny similar to ["Oh Hell"](https://en.wikipedia.org/wiki/Oh_hell). This is a wip web version of it using [XSTATE](https://stately.ai/docs/xstate) and firebase. 

It is very much a work in progress.

## In-progress screenshots

|   |  | |
| ------------- | ------------- | ----- |
| ![Home page](/src/assets/april-home.png?raw=true "Home")  | ![Lobby page](/src/assets/april-lobby.png?raw=true "Lobby")  | ![Playing page](/src/assets/april-playing.png?raw=true "Playing") |



## Set up

```shell
mv .env.local.example .env.local
npm run dev
npm run emulate
cd functions && npm run build:watch

```
- copy Firebase env values from Firebase Console, and paste them to `.env.local`.
- enable Google Auth in Firebase Console. ref: https://firebase.google.com/docs/auth/web/google-signin#before_you_begin
