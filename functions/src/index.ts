import {onCall, HttpsError} from "firebase-functions/v2/https";
import {initializeApp} from "firebase-admin/app"
import {getFirestore, Timestamp, DocumentReference} from "firebase-admin/firestore"

// import {getDatabase,} from "firebase-admin/database"
// import * as logger from "firebase-functions/logger";
// import * as functions from "firebase-functions";
// import {onValueCreated} from "firebase-functions/v2/database"
// import {onDocumentCreated} from "firebase-functions/v2/firestore";
import { Event } from "xstate";

import { GameDoc, getGamePlayerData, runGameTransition } from "./GameUtils";
import { GAME_COLLECTION, gameDocPath, playerDocPath, GamePlayerDoc, omit } from "./shared";
import { hello } from "./shared/hello";
import { gameMachine, GameContext, GameEvent, initGameContext, PlayerId } from "./shared/retroMachine/machine";


initializeApp();
console.log('Shared directory still works:', hello())




type CreateGame = {
  id: string
  context?: Partial<GameContext> & {
    players: GameContext['players'];
    cardsPerPlayer?: GameContext['cardsPerPlayer']
  }
}
export const createGame = onCall<CreateGame>(async (req) => {
  const {data: {id, context}} = req;

  if (!id || !context) {
    throw new HttpsError('invalid-argument', 'Send id and context');
  }

  if (!context.players || !context.players.length) {
    throw new HttpsError('invalid-argument', 'Context needs players');
  }

  const gameDocRef = getFirestore().collection(GAME_COLLECTION)
    .doc(id) as DocumentReference<GameDoc>;

  const gameDoc = await gameDocRef.get();

  if (gameDoc.exists) {
    throw new HttpsError('already-exists', 'Game already exists, dummy');
  }

  const initGameDoc = {
    state: gameMachine.initialState.value,
    players: context.players,
    context: omit(initGameContext(context), 'hands', 'players'),
    created: Timestamp.now(),
    lastUpdated: Timestamp.now(),
  }

  console.log('init game doc', initGameDoc)
  const batch = getFirestore().batch();

  batch.set(gameDocRef, initGameDoc);

  // Make the player private docs
  context.players.forEach(playerId => {
    const playerGameRef = getFirestore()
      .doc(playerDocPath(id, playerId)) as DocumentReference<GamePlayerDoc>
    batch.set(playerGameRef, { hands: [] });
  });

  await batch.commit();

  return { status: 'success', data: initGameDoc}
})



type RunGame = {
  id: string
  event: Event<GameEvent>
}

// TODO: handle player auth ids
export const runGame = onCall<RunGame>(async (stuff) => {
  const {data: {id, event}} = stuff
  console.log('runGame', id, event)

  if (!id || !event) {
    throw new HttpsError('invalid-argument', 'Send id and event');
  }

  const gameDocRef = await getFirestore()
    .collection(GAME_COLLECTION)
    .doc(id) as DocumentReference<GameDoc>;

  const gameDoc = await gameDocRef.get();
  const gameDocData = await gameDoc.data();

  if (!gameDoc.exists || !gameDocData) {
    throw new HttpsError('not-found', 'Game not found');
  }

  const state = gameDocData.state;
  const gamePlayerData = await getGamePlayerData(id);

  const context = {
    ...gameDocData.context,
    players: gameDocData.players,
    ...gamePlayerData,
  }

  const newStateSnapshot = await runGameTransition({state, context}, event)

  if (newStateSnapshot.changed) {
    console.log('state changed')
    const { players, hands } = newStateSnapshot.context
    const newParsedContext = omit(newStateSnapshot.context, 'hands', 'players');
    const newState = newStateSnapshot.value;
    const stateChangeBatch = getFirestore().batch();

    // Check if hands changed. 
    // TODO: There's a better way to do this.
    const newPlayerHands = Object.keys(hands);
    newPlayerHands.forEach(playerId => {
      if (hands[playerId]?.length !== context.hands[playerId]?.length) {
        console.log('player hand changed:', playerId);
        const playerGameRef = getFirestore().doc(playerDocPath(id, playerId)) as DocumentReference<GamePlayerDoc>
        stateChangeBatch.set(playerGameRef, { hands: hands[playerId] });
      }
    });

    const newWriteResult = await stateChangeBatch.update(gameDocRef, {
      context: newParsedContext,
      state: newState,
      players,
      lastUpdated: Timestamp.now()
    })

    await stateChangeBatch.commit();

    return { status: 'success', data: {changed: true, state: newState, context: newParsedContext}}
  }

  console.log(`State hasn't changed`);
  // TODO: doesn't really make sense for it to say success here.
  return { status: 'success', data: {changed: false, state: state, context: gameDocData.context}}
});


export * from './exampleFns'
