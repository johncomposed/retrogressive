import {PlayerId, RoundContext, RoundPoints, GameContext, BidEvent, PlayEvent, RoundEvent, GameEvent, StrictCard} from './types'

export type HasProps<T> = T & {
  [P in keyof T]: T[P] extends object ? HasProps<T[P]> : T[P];
};


// export const getInitialRoundContext = (roundContext: Partial<RoundContext> = {}): RoundContext => {
//   return {
//     ...roundContext
//   }

// }

export function isStrictCard(str: string): str is StrictCard {
  if (!str || str.length < 2) return false;
  const pattern = /^[HDCS](1[0-3]|[1-9])$/;
  return pattern.test(str)
}

export function createShuffledDeck() {
  const suits = ["H", "D", "C", "S"]; // Hearts, Diamonds, Clubs, Spades
  const deck = suits.flatMap((suit) =>
    Array.from({ length: 13 }, (_, i) => `${suit}${i + 1}`)
  );

  // Fisher-Yates shuffle algorithm
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }

  return deck as StrictCard[];
}

export function dealCards(deck: StrictCard[], cardsPerHand: number, playerIds: PlayerId[]) {
  const playerHands: Record<string, StrictCard[]> = {};
  const remainingCards = [...deck];

  playerIds.forEach((playerId) => {
    playerHands[playerId] = remainingCards.splice(0, cardsPerHand);
  });

  return [playerHands, remainingCards] as const;
}

export type isBidValidOpts = {
  roundNumber: number;
  cardsPerPlayer: number;
  players: PlayerId[];
  bids: Record<PlayerId, number>; 
}
export function isBidValid(opts: isBidValidOpts, event: { playerId: PlayerId; bid: number }) {
  const {roundNumber, cardsPerPlayer, players, bids} = opts;

  // Can't bid more than current cards per player
  if (event.bid > cardsPerPlayer) return false;

  // If the last person to bid (dealer) is restricted 
  // (e.g. it's not the last round and/or it hasn't gone around or whatever the rules are)
  const restrictDealerBid = roundNumber < players.length || cardsPerPlayer > 1;
  const bidArray = Object.values(bids).filter((b) => b !== undefined);

  if (restrictDealerBid && (players.length - bidArray.length) <= 1) {
    // Then the dealer can't bid an amount that makes it theoretically possible for everyone to make their bid.
    return cardsPerPlayer !== (bidArray.reduce((b, acc) => b + acc, 0) + event.bid);
  }

  return true;
}

export function calculateRoundPoints({bids, trickWinners}: RoundPoints, scores: Record<PlayerId, number> = {}) {
  const points = { ...scores };
  Object.keys(bids).forEach((playerId) => {
    const bid = bids[playerId];
    const tricksWon = trickWinners.filter((winner) => winner === playerId).length;

    if (bid === tricksWon) {
      // Player made their bid, score 10 points plus their bid
      points[playerId] = (points[playerId] || 0) + 10 + bid;
    } else {
      // Player missed their bid, score the difference as negative points
      points[playerId] = (points[playerId] || 0) - Math.abs(bid - tricksWon);
    }
  });

  return points;
}
