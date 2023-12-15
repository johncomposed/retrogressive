import { State, Event, interpret } from "xstate";
import { gameMachine } from "./shared/retroMachine/machine";
import { GameEvent, GameContext, GenericGameState, PlayerId } from "./shared/retroMachine/types";
import { gameDocPath, GameDoc as _GameDoc, GamePlayerDoc as _GamePlayerDoc, playerDocPath } from "./shared";

import {getFirestore, FieldValue, Timestamp, DocumentReference, CollectionReference} from "firebase-admin/firestore"

export type GameDoc = _GameDoc<Timestamp>
export type GamePlayerDoc = _GamePlayerDoc<Timestamp>
export type GamePlayerDocGroup = {
  [K in keyof GamePlayerDoc]: Record<PlayerId, GamePlayerDoc[K]>
}
export type ParsedGameDoc = {
  state: GenericGameState['value'],
  context: GameContext
}


export const toState = ({state, context}: ParsedGameDoc): GenericGameState => State.from(state,context)


export const getGamePlayerData = async (gameId: string) => {
  const playerDataCollection = await (getFirestore()
    .collection(playerDocPath(gameId)) as CollectionReference<GamePlayerDoc>)
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


export const runGameTransition = async (loadedState: ParsedGameDoc, event: Event<GameEvent>) => {
  // Create an instance of the machine
  const service = interpret(gameMachine);

  service.onTransition((state) => {
    console.log('TRANSITION', state.changed, state.value);
  });

  console.log('STARTING', service.getSnapshot().changed)
  service.start(toState(loadedState)); // Set the start state

  console.log('STARTED', service.getSnapshot().changed)
  service.send(event);
  console.log('SENT', service.getSnapshot().changed)

  const newGameState = service.getSnapshot()
  service.stop();

  console.log('STOPPED', service.getSnapshot().changed, newGameState.changed)
  return newGameState as GenericGameState
};
