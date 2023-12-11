/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import {onRequest, onCall} from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import * as functions from "firebase-functions";
// import {onValueCreated} from "firebase-functions/v2/database"
import {onDocumentCreated} from "firebase-functions/v2/firestore";

import {initializeApp} from "firebase-admin/app"
import {getFirestore, FieldValue, Timestamp} from "firebase-admin/firestore"

import {getDatabase,} from "firebase-admin/database"

import { hello } from "./shared/hello";


import { gameMachine, GameContext, GameEvent, initGameContext } from "./shared/retroMachine/machine";
import { interpret, Event, State } from "xstate";
// import { database } from "firebase-admin";


initializeApp();
type RetroGameState = State<GameContext, GameEvent, any, any, any>

type WithoutFn<T> = {
  [K in keyof T]: T[K] extends Function ? never : K
}[keyof T];

type PropsWithoutFn<T> = Pick<T, WithoutFn<T>>;


export type Serializable<T> = PropsWithoutFn<T> & {
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
  // events: GameEvent[]
}

type GameStorage = {
  state: RetroGameState['value'],
  context: GameContext,
  lastUpdated: Timestamp,
} & Partial<GameMeta> // TODO: being lazy with types.


const serializeState = (state: RetroGameState): GameStorage => ({
  // TODO: I'd like to save the latest event and append it to a list of events. Including ones that didn't result in a change. 
  state: state.value,
  context: state.context,
  lastUpdated: Timestamp.now()
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

type RunGame = {
  id: string
  event?: Event<GameEvent>
  context?: Partial<GameContext>
}

export const runGame = onCall<RunGame>(async (stuff) => {
  const {data: {id, event, context: initContext }} = stuff
  console.log('runGame', id, event, initContext)
  if (!id) return {err: 'no id'};

  const gameDoc = await getFirestore()
        .collection("games")
        .doc(id);

  const gameDocData = await gameDoc.get();

  const gameState = gameDocData.exists ? gameDocData.data() as GameStorage : {
    ...serializeState(gameMachine.initialState),
    context: initGameContext(initContext)
  };

  // logger.info(gameState, {structuredData: true});

  const newStateSnapshot = await runGameTransition(gameState, event || 'START_GAME')

  if (newStateSnapshot.changed) {
    console.log('state changed')
    const newStateDoc = serializeState(newStateSnapshot)
    const newWriteResult = await gameDocData.exists ? gameDoc.update(newStateDoc) : gameDoc.set({
      ...newStateDoc,
      created: Timestamp.now()
    });
    return newStateDoc
  }

  console.log(`State hasn't changed`)  
  return gameState
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

