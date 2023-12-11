import { GuardPredicate, ConditionPredicate } from "xstate";
import {GameContext, GameEvent} from './types'
import {isBidValid} from './utils'



// const guard = (fn: (context: GameContext, e: GameEvent) => boolean) => fn as any as GuardPredicate<GameContext, GameEvent>
// const guard = (fn: (context: GameContext, e: GameEvent) => boolean) => fn as any as ConditionPredicate<GameContext, GameEvent>
const guard = (fn: (context: GameContext, e: GameEvent, meta: any) => boolean) => {
  return ((context: GameContext, e: GameEvent, meta: any) => {
    const result = fn(context, e, meta)
    if (!result) {
      console.log('Guard failed', e, context, meta?.cond?.name || meta)
    }
    return result;
  }) as any as ConditionPredicate<GameContext, GameEvent>
}
  // fn as any as ConditionPredicate<GameContext, GameEvent>


export const isValidBid = guard((context, event) => {
  if (event.type !== "MAKE_BID") return false;
  // Check if this is the player that should be bidding
  const currentPlayerId = context.players[context.currentPlayerIndex];
  if (event.playerId !== currentPlayerId) return false;

  return isBidValid({
    roundNumber: context.roundNumber,
    cardsPerPlayer: context.cardsPerPlayer,
    players: context.players,
    bids: context.bids
  }, event);
})

export const isBiddingComplete = guard((context) => {
  return context.players.every(
    (playerId) => context.bids[playerId] !== undefined
  );
})

export const isValidPlay = guard((context, event) => {
  if (event.type !== 'PLAY_CARD') return false;
  const currentPlayerId = context.players[context.currentPlayerIndex];
  const playerHand = context.hands[currentPlayerId];
  const cardSuit = event.card.slice(0, 1);

  // Check if the player is the current player and if the card is in their hand
  const isCurrentPlayer = event.playerId === currentPlayerId;
  const hasCard = playerHand.includes(event.card);

  // If there's no lead suit, any card is valid
  if (context.leadSuit === null) {
    return isCurrentPlayer && hasCard;
  }

  // If the player has a card of the lead suit, they must play it
  const hasLeadSuit = playerHand.some(
    (card) => card.slice(0, 1) === context.leadSuit
  );
  const isFollowingSuit = cardSuit === context.leadSuit;
  return isCurrentPlayer && hasCard && (!hasLeadSuit || isFollowingSuit);
})

export const isTrickComplete = guard((context) => {
  return (
    Object.values(context.currentTrick).filter((c) => !!c).length ===
    Object.values(context.players).length
  );
  // return context.players.every(
  //   (playerId) => context.currentTrick[playerId] !== null
  // );
})

export const isRoundComplete = guard((context, events) => {
  return !Object.values(context.hands).reduce((l, hand) => hand.length + l, 0);
})

// TODO: Maybe I should make it so the game is over if the next round would result in 0 cards. 
// Just to prevent UI weirdness down the road.
export const isGameOver = guard((context) => {
  return context.cardsPerPlayer <= 1;
})
