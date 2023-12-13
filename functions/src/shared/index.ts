import { StateValue } from "xstate";
import { GameContext, GameEvent, PlayerId } from "./retroMachine/machine";

export type BasicTimestamp = {
  nanoseconds: number
  seconds: number
}

export type GameDoc<Timestamp extends BasicTimestamp = BasicTimestamp> = {
  context: Omit<GameContext, "hands" | "players">;
  players: GameContext['players'];
  state: StateValue;
  created: Timestamp;
  lastUpdated: Timestamp;
}

export type GamePlayerDoc<Timestamp extends BasicTimestamp = BasicTimestamp> = {
  hands: GameContext["hands"][string]
}




