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


export const GAME_COLLECTION = "games"
export const gameDocPath = (gameId: string) => `${GAME_COLLECTION}/${gameId}`;
export const playerDocPath = (gameId: string, p?: PlayerId) => gameDocPath(gameId).concat(
  '/players',
  p ? `/${p}`: ''
);


export const omit = <T extends object, K extends keyof T>(obj: T, ...keys: K[]): Omit<T, K> => {
  const newObj = { ...obj }
  keys.forEach((key) => delete newObj[key])
  return newObj
}



// Just a copy of nanoid, a tiny non-secure uuid thing.
let urlAlphabet = 'useandom26T198340PX75pxJACKVERYMINDBUSHWOLFGQZbfghjklqvwyzrict'
export const nanoid = (size = 21) => {
  let id = ''
  let i = size
  while (i--) {
    id += urlAlphabet[(Math.random() * 64) | 0]
  }
  return id;
}
  
