# Retrogressive

# TODOS
## General Flow
- Should I make the state after a round wait for an event? 
  - Maybe I could reuse a voting system for dealing the next hand. 
  - Otherwise I have to figure out some way of making it a smoother transition to the next hand on the client.

## Lobby
- Edit machine to allow voting to start

## UI
- Rough layout
- Edge states
- Animations
- Tighter UI fixes





## Motivation

Improve building your faster **prototyping** by using Vite, TypeScript, React, TailwindCSS, Firebase.

This starter uses following libraries:

- Vite
- React
  - React Router
- TypeScript
- Tailwind CSS
  - daisyUI
- Firebase(v9, modular)
- ESLint

## Set up

```shell
mv .env.local.example .env.local
yarn
yarn dev
```
- copy Firebase env values from Firebase Console, and paste them to `.env.local`.
- enable Google Auth in Firebase Console. ref: https://firebase.google.com/docs/auth/web/google-signin#before_you_begin
