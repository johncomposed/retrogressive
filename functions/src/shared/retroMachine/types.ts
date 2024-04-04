import type { State } from "xstate";

export type PlayerId = string;
export type LooseCard = string;

export type CardSuit = 'H' | 'D' | 'S' | 'C';
export type CardValue = '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | '11' | '12' | '13';
export type StrictCard = `${CardSuit}${CardValue}`;


export type RoundPoints = {
  bids: Record<PlayerId, number>;
  trickWinners: PlayerId[];
  // bots: PlayerId[]; 
};

  // TODO: For clarity it would make sense to put this into a round inside Game or something like that
  // But since xstate does shallow merge I'll tradeoff clarity for dev speed right now.
export interface RoundContext {
  //firstBidder: ctx.round.roundNumber % ctx.players.length
  hands: Record<PlayerId, StrictCard[]>; // Record player IDs to their hands of Cards
  trumpCard: StrictCard;
  bids: Record<PlayerId, number>;

  //TODO: Should maybe check the order of the players in my currentTrick obj to get the winner
  currentTrick: Record<PlayerId, StrictCard | null>; // Record player IDs to the Card they played this trick. 
  trickWinners: PlayerId[];
  leadSuit: CardSuit | null; // The suit of the first Card played in the current trick
}

export interface GameContext extends RoundContext {
  players: PlayerId[];
  history: RoundPoints[];
  scores: Record<PlayerId, number>;

  cardsPerPlayer: number;
  roundNumber: number;
  currentPlayerIndex: number;
}

export type GenericGameState = State<GameContext, GameEvent, any, any, any>

export type BidEvent =
  | { type: "MAKE_BID"; playerId: PlayerId; bid: number }
  // | { type: "MAKE_RANDOM_BID"; PlayerId: string };

export type PlayEvent = 
  | { type: "PLAY_CARD"; playerId: PlayerId; card: StrictCard }
  // | { type: "PLAY_RANDOM_CARD"; PlayerId: string };

export type RoundEvent =
  | { type: "START_ROUND" }
  | { type: "BIDS_COMPLETE" }
  | { type: "PLAY_COMPLETE" }
  | PlayEvent
  | BidEvent;


export type GameEvent =
  | RoundEvent
  | { type: "START_GAME" }
  | {
      type: "ROUND_ENDED";
      bids: Record<PlayerId, number>;
      trickWinners: PlayerId[];
    };



    