/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import {onRequest, onCall, HttpsError} from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import * as functions from "firebase-functions";
// import {onValueCreated} from "firebase-functions/v2/database"
import {onDocumentCreated} from "firebase-functions/v2/firestore";

import {initializeApp} from "firebase-admin/app"
import {getFirestore, FieldValue, Timestamp, DocumentReference, CollectionReference} from "firebase-admin/firestore"

import {getDatabase,} from "firebase-admin/database"

import { hello } from "./shared/hello";


import { gameMachine, GameContext, GameEvent, initGameContext, PlayerId } from "./shared/retroMachine/machine";
import { interpret, Event, State, StateValue } from "xstate";
// import { database } from "firebase-admin";
import { GameDoc as _GameDoc, GamePlayerDoc as _GamePlayerDoc } from "./shared";

initializeApp();
type GameDoc = _GameDoc<Timestamp>
type GamePlayerDoc = _GamePlayerDoc<Timestamp>


type RetroGameState = State<GameContext, GameEvent, any, any, any>

type WithoutFn<T> = {
  [K in keyof T]: T[K] extends Function ? never : K
}[keyof T];

type PropsWithoutFn<T> = Pick<T, WithoutFn<T>>;

type ArrToMap<T extends Array<{ [key: string]: any }>> = T extends Array<infer U> ? {
  [K in keyof U]: U[K][]
} : never;


type Serializable<T> = PropsWithoutFn<T> & {
  [P in keyof PropsWithoutFn<T>]: T[P] extends object ? Serializable<T[P]> : T[P];
};

console.log('MAYBE', hello())

/**
 * If I want more complicated storage of game state (including a growing history stack that i'll have to clean up eventually)
 * type GameStorage = Serializable<RetroGameState['toJSON']>
 * const serializeState = (state: RetroGameState): GameStorage => JSON.parse(JSON.stringify(state.toJSON()))
 * const toState = (state: GameStorage): RetroGameState => state;
 */


type GameMeta = {
  created: Timestamp
  lastUpdated: Timestamp,
  // events: GameEvent[]
}

type GameStorage = {
  state: RetroGameState['value'],
  context: GameContext,
} & Partial<GameMeta> // TODO: being lazy with types.


const serializeState = (state: RetroGameState): GameStorage => ({
  // TODO: I'd like to save the latest event and append it to a list of events. Including ones that didn't result in a change. 
  state: state.value,
  context: state.context
})

const toState = ({state, context}: GameStorage): RetroGameState => State.from(state,context)

const runGameTransition = async (loadedState: GameStorage, event: Event<GameEvent>) => {
  // console.log('STATE', gameMachine.initialState)
  // Create an instance of the machine
  const service = interpret(gameMachine);

  service.onTransition((state) => {
    console.log('TRANSITION', state.changed, state.value
    //, state.context
    );
  });


  console.log('STARTING', service.getSnapshot().changed)
  service.start(toState(loadedState)); // Set the start state

  console.log('STARTED', service.getSnapshot().changed)
  service.send(event);
  console.log('SENT', service.getSnapshot().changed)

  const newGameState = service.getSnapshot()
  service.stop();
  // const snap2 = serializeState(service.getSnapshot())


  console.log('STOPPED', service.getSnapshot().changed, newGameState.changed)
  return newGameState as RetroGameState
};

const parseContext = (gameContext: GameContext) => {
  const {hands, players, ...context} = gameContext
  return {
    hands,
    players,
    context
  }
}

type CreateGame = {
  id: string
  context?: Partial<GameContext> & {
    players: GameContext['players'];
    cardsPerPlayer?: GameContext['cardsPerPlayer']
  }
}
export const createGame = onCall<CreateGame>(async (req) => {
  const {data: {id, context}} = req;
  console.log('CALLED createGame', id, context)

  if (!id || !context) {
    throw new functions.https.HttpsError('invalid-argument', 'Send id and context');
  }

  if (!context.players || !context.players.length) {
    throw new functions.https.HttpsError('invalid-argument', 'Context needs players');
  }

  const gameDocRef = getFirestore()
    .collection("games")
    .doc(id) as DocumentReference<GameDoc>;

  const gameDoc = await gameDocRef.get();

  console.log('you exist?', gameDoc)

  if (gameDoc.exists) {
    throw new functions.https.HttpsError('already-exists', 'Game already exists, dummy');
  }

  const initGameDoc = {
    state: gameMachine.initialState.value,
    ...parseContext(initGameContext(context)),
    created: Timestamp.now(),
    lastUpdated: Timestamp.now(),
  }

  console.log('init game doc', initGameDoc)


  await gameDocRef.set(initGameDoc);

  // Make the player private docs
  const batch = getFirestore().batch();
  context.players.forEach(playerId => {
    const playerGameRef = getFirestore().doc(`games/${id}/players/${playerId}`) as DocumentReference<GamePlayerDoc>
    batch.set(playerGameRef, { hands: [] });
  });
  await batch.commit();
})

type GamePlayerDocGroup = {
  [K in keyof GamePlayerDoc]: Record<PlayerId, GamePlayerDoc[K]>
}

const getGamePlayerData = async (gameId: string) => {
  const playerDataCollection = await (getFirestore()
    .collection(`games/${gameId}/players`) as CollectionReference<GamePlayerDoc>)
    .get();

  const playerData: any = {}

  playerDataCollection.forEach((playerDoc) => {
    Object.entries(playerDoc.data()).forEach(([k, v]) => {
      playerData[k] = playerData[k] || {}
      playerData[k][playerDoc.id] = v;
    })

    // playerData[playerDoc.id] = playerDoc.data();
  });

  return playerData as GamePlayerDocGroup
}


type RunGame = {
  id: string
  event: Event<GameEvent>
}

// TODO: handle player auth ids
export const runGame = onCall<RunGame>(async (stuff) => {
  const {data: {id, event}} = stuff
  console.log('runGame', id, event)

  if (!id || !event) {
    throw new functions.https.HttpsError('invalid-argument', 'Send id and event');
  }

  const gameDocRef = await getFirestore()
        .collection("games")
        .doc(id) as DocumentReference<GameDoc>;

  const gameDoc = await gameDocRef.get();

  if (!gameDoc.exists) {
    throw new functions.https.HttpsError('not-found', 'Game not found');
  }

  const gameDocData = await gameDoc.data();

  if (!gameDocData) {
    throw new functions.https.HttpsError('not-found', 'Game data not found');
  }

  const state = gameDocData.state;
  const gamePlayerData = await getGamePlayerData(id);

  const context: GameContext = {
    ...gameDocData.context,
    players: gameDocData.players,
    ...gamePlayerData,
  }

  const newStateSnapshot = await runGameTransition({state, context}, event)

  if (newStateSnapshot.changed) {
    console.log('state changed')
    const {hands, players, context: newParsedContext} = parseContext(newStateSnapshot.context);
    const newState = newStateSnapshot.value;

    // console.log('latest', hands, players, newParsedContext, newState, context, gamePlayerData)

    // Check if hands changed. There's a better way to do this.
    const newPlayerHands = Object.keys(hands);
    const playerBatch = getFirestore().batch();
    newPlayerHands.forEach(playerId => {
      if (hands[playerId]?.length !== context.hands[playerId]?.length) {
        console.log('player hand changed:', playerId);
        const playerGameRef = getFirestore().doc(`games/${id}/players/${playerId}`) as DocumentReference<GamePlayerDoc>
        playerBatch.set(playerGameRef, { hands: hands[playerId] });
      }
    });
    await playerBatch.commit();

    const newWriteResult = await gameDocRef.update({
      context: newParsedContext,
      state: newState,
      players,
      lastUpdated: Timestamp.now()
    })

    return { status: 'success', data: {changed: true, state: newState, context: newParsedContext}}
  }

  console.log(`State hasn't changed`);
  // TODO: doesn't really make sense for it to say success here.
  return { status: 'success', data: {changed: false, state: state, context: gameDocData.context}}
});


export const helloWorld = onRequest((request, response) => {
  logger.info("Hello logs!", {structuredData: true});
  // response.send({status: 'success', data:{ho:'whatever?'}})
  response.json({msg: "Hello from Firebase!", data: {hi: "?"}});
});

export const helloWorldCall = onCall((data) => {
  logger.info("Hello call!", {structuredData: true});
  return {msg: "Hello from Firebase!", data: {hi: "?"}}
});


export const addmessage = onRequest(async (req, res) => {
  logger.info("msg: ", req.query, req.method, req.params, req.path, req.originalUrl, {structuredData: true});

  try {
    const original = req.query.text;
    // Push the new message into Firestore using the Firebase Admin SDK.
    const writeResult = await getFirestore()
        .collection("messages")
        .add({original: original});
    // Send back a message that we've successfully written the message
    res.json({result: `Message with ID: ${writeResult.id} added.`});

  } catch(e) {

    res.status(500).json({error: e})
  }

});

export const makeUppercase = onDocumentCreated("/messages/{documentId}", (event) => {
  if (!event.data) return;

  // Grab the current value of what was written to Firestore.
  const original = event.data.data().original;

  // Access the parameter `{documentId}` with `event.params`
  logger.log("Uppercasing", event.params.documentId, original);

  const uppercase = original.toUpperCase();

  // You must return a Promise when performing
  // asynchronous tasks inside a function
  // such as writing to Firestore.
  // Setting an 'uppercase' field in Firestore document returns a Promise.
  return event.data.ref.set({uppercase}, {merge: true});
})


export const smileyGenerator = functions.database.ref('/smile/{smileyId}/count').onCreate(async (snapshot, context) => {
  let count = snapshot.val()
  let smiles = '😊';
  while (count > 1) {
     smiles = smiles + '😊'
     count--
  }

  const setResult = await snapshot.ref.parent!.child('smileys').set(smiles)

  return {data: smiles}
})

