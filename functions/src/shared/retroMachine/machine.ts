import { createMachine } from "xstate";
import { GameContext, GameEvent } from "./types";
export * from  "./types"

import {
  isValidBid,
  isBiddingComplete,
  isValidPlay,
  isTrickComplete,
  isRoundComplete,
  isGameOver,
} from './guards'

import {
  nextPlayer,
  dealHand,
  recordBid,
  playCard,
  scoreAndResetTrick,
  updateScores,
  updateRound,
} from './actions'

export const initGameContext = (ctx: Partial<GameContext> = {}): GameContext => {
  return {
    players: [],
    history: [],
    scores: {},

    cardsPerPlayer: 0, // TODO: Don't love default init nonsense.
    roundNumber: 0,
    currentPlayerIndex: 0,

    hands: {},
    trumpCard: 'S13', // TODO: Same default init issue
    bids: {},

    currentTrick: {},
    trickWinners: [],
    leadSuit: null,

    ...ctx
  }
}


export const gameMachine = createMachine<GameContext, GameEvent>({
  id: "game",
  initial: "idle",
  predictableActionArguments: true,
  preserveActionOrder: true,
  context: initGameContext(),
  states: {
    idle: {
      on: {
        START_GAME: "round"
      }
    },
    round: {
      id: 'round',
      initial: 'dealing',
      states: {
        dealing: {
          always: {
            target: "bidding",
            actions: "dealHand",
          }
        },
        bidding: {
          initial: "waitingForBid",
          states: {
            waitingForBid: {
              on: {
                MAKE_BID: {
                  cond: "isValidBid",
                  actions: "recordBid",
                  target: "checkBiddingComplete"
                },
              }
            },
            checkBiddingComplete: {
              always: [
                {
                  cond: "isBiddingComplete",
                  target: "#round.playing"
                },
                {
                  target: "waitingForBid",
                  actions: "nextPlayer"
                }
              ]
            }
          }
        },
        playing: {
          initial: "playingCards",
          states: {
            playingCards: {
              on: {
                PLAY_CARD: {
                  cond: "isValidPlay",
                  actions: "playCard",
                  target: "checkTrickComplete"
                }
              }
            },
            checkTrickComplete: {
              always: [
                {
                  cond: "isTrickComplete",
                  target: "trickComplete"
                },
                {
                  target: "playingCards",
                  actions: "nextPlayer"
                }
              ]
            },
            trickComplete: {
              // Logic to handle end of trick, such as determining the winner, goes here
              always: [
                {
                  target: "#round.roundComplete",
                  actions: "scoreAndResetTrick",
                  cond: "isRoundComplete"
                },
                {
                  target: "playingCards",
                  actions: "scoreAndResetTrick"
                }
              ]
            }
          }
        },
        roundComplete: {
          type: "final",
          data: context => ({
            bids: context.bids,
            trickWinners: context.trickWinners
          })
        }
      },
      onDone: {
        actions: "updateScores",
        target: "checkGameOver"
      }
    },
    checkGameOver: {
      always: [
        {
          cond: "isGameOver",
          target: "gameOver"
        },
        {
          target: "round",
          actions: "updateRound"
        }
      ]
    },
    gameOver: {
      type: "final",
      data: context => ({
        finalScores: context.scores,
        history: context.history
      })
    }
  }
}, {
  actions: {
    nextPlayer,
    dealHand,
    recordBid,
    playCard,
    scoreAndResetTrick,
    updateScores,
    updateRound,
  },
  guards: {
    isValidBid,
    isBiddingComplete,
    isValidPlay,
    isTrickComplete,
    isRoundComplete,
    isGameOver,
  }
});