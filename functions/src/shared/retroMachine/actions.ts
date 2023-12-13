import { assign as _assign} from "xstate";
import {GameContext, GameEvent, CardSuit} from './types'
import {createShuffledDeck, dealCards, isBidValidOpts, isBidValid, calculateRoundPoints } from './utils'


// type _Assign = typeof _assign
// type AssignAlias<U extends EventObject> = typeof _assign<GameContext, U>;
const assign = _assign<GameContext, GameEvent>;


export const nextPlayer = assign((context) => {
  return {
    currentPlayerIndex: (context.currentPlayerIndex + 1) % context.players.length
  }
})

export const dealHand = assign((context, event) => {
  const shuffledDeck = createShuffledDeck();
  const [playerHands, remainingCards] = dealCards(
    shuffledDeck,
    context.cardsPerPlayer,
    context.players
  );
  const trumpCard = remainingCards[0];

  return {
    hands: playerHands,
    trumpCard
  };
})

export const recordBid = assign((context, event) => {
  if (event.type !== 'MAKE_BID') return {};

  return {
    bids: {
      ...context.bids,
      [event.playerId]: event.bid
    }
  }
})

export const playCard = assign((context, event) => {
  if (event.type !== 'PLAY_CARD') return {};

  const playerHand = context.hands[event.playerId] || [];
  return {
    currentTrick: {
      ...context.currentTrick,
      [event.playerId]: event.card
    },
    hands: {
      ...context.hands,
      [event.playerId]: playerHand.filter((card) => card !== event.card)
    },
    leadSuit: context.leadSuit === null
        ? event.card[0] as CardSuit
        : context.leadSuit
  };
})

export const scoreAndResetTrick = assign((context, event) => {
  const winnerId = Object.entries(context.currentTrick).sort(
    ([a, av], [b, bv]) => {
      if (!av || !bv) return 0;

      const led = context.leadSuit;
      const trumps = context.trumpCard[0];

      const aN = parseInt(av.slice(1), 10) +
        (av[0] === led ? 100 : av[0] === trumps ? 200 : 0);
      const bN = parseInt(bv.slice(1), 10) +
        (bv[0] === led ? 100 : bv[0] === trumps ? 200 : 0);

      return bN - aN;
    }
  )[0][0];

  return {
    currentTrick: {},
    leadSuit: null,
    currentPlayerIndex: context.players.indexOf(winnerId),
    trickWinners: context.trickWinners.concat(winnerId)
  };
})

export const updateScores = assign((context, event) => {
  return {
    scores: calculateRoundPoints({
      bids: context.bids, 
      trickWinners: context.trickWinners
    }, context.scores),
    history: context.history.concat({
      bids: context.bids,
      trickWinners: context.trickWinners
    })
  };
})


export const updateRound = assign((context, event) => {
  return {
    roundNumber: context.roundNumber + 1,
    cardsPerPlayer: context.cardsPerPlayer - 1,

    // setFirstBidder
    currentPlayerIndex: (context.roundNumber + 1) % context.players.length,

    // TODO: don't love this init here. But unclear if it should go in dealing or what.
    currentTrick: {},
    trickWinners: [],
    leadSuit: null,
    bids: {},
  };
})


