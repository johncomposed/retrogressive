import React, {useState} from 'react'
import cx, {ClassValue} from 'clsx';
import { GameDoc } from '~shared/index';
import { MutationStatus, QueryStatus } from '~/components/ResultStatus';
import { State } from 'xstate';
import { useGameAction, useSudoPlayerData } from '~/api/gameHooks';

export type HandProps = {
  className?: ClassValue
  data: GameDoc,
  player: string,
  gameId: string
}; 

export default Hand;
export function Hand(props: HandProps) {
  const {gameId, player, data, className} = props;
  const playerDoc = useSudoPlayerData(gameId, player, [data.context.roundNumber])
  const [runGameFn, {startGame, playCard, makeBid}] = useGameAction(gameId, player, true)

  const state = State.from(data.state)
  const playerData = playerDoc.data

  const isActivePlayer = data.players[data.context.currentPlayerIndex] === player;
  const disableBtn = !isActivePlayer || runGameFn.isLoading || runGameFn.isError

  const biddingPhase = state.matches('round.bidding')
  const playingPhase = state.matches('round.playing')
  const isPlaying = playingPhase && isActivePlayer;

  return (
    <div className='text-left'>
      <div className='flex flex-row items-center justify-between mb-6'>
        <h3 className='text-2xl font-bold flex-grow'>
          {biddingPhase && isActivePlayer && 'Bidding'}
          {biddingPhase && !isActivePlayer && 'Waiting for bidders'}
          {playingPhase && isActivePlayer && 'Playing'}
          {playingPhase && !isActivePlayer && 'Waiting for players'}
        </h3>
        <div>
          <QueryStatus name="playerdoc" res={playerDoc} />
          <MutationStatus name="rungame" res={runGameFn} />
        </div>
      </div>

      {state.matches('idle') && isActivePlayer && (
        <button
          className='btn btn-block btn-lg mb-6 btn-primary'
          disabled={disableBtn}
          onClick={() => startGame()}
        >Start Game</button>
      )}

      {!playerData && (
        <span className="loading loading-spinner"></span>
      )}

      {playerData && playerData.hands && (
        <>
          <div
            className={cx(
              'flex flex-row items-center justify-center inner-shadow w-full flex-wrap rounded-md bg-slate-200 mb-4 px-8', {
              'border border-green-400': isPlaying
            }
            )}
            style={{ minHeight: '6.8rem' }}
          >
            {playerData && playerData.hands.map((card) => (
              <button key={`card-${card}`} className={cx(
                'flex justify-center items-center',
                'rounded-btn h-20 w-16 p-4 mx-2 text-md font-bold',
                {
                  'cursor-default shadow-none': !isPlaying,
                  'cursor-pointer shadow-md hover:brightness-90	': isPlaying,
                  'bg-gray-800 text-white': card[0] === 'C',
                  'bg-blue-950 text-white': card[0] === 'S',
                  'bg-red-400': card[0] === 'D',
                  'bg-pink-400': card[0] === 'H'
                })}
                disabled={isPlaying && disableBtn}
                onClick={() => {
                  isPlaying && playCard(card)
                }}
              >{card}</button>
            ))}
          </div>
        </>
      )}

      {biddingPhase && (
        <div>
          <div className='flex flex-row flex-wrap items-center justify-center'>

            {Array.from({ length: data.context.cardsPerPlayer + 1 }, (_, bid) => (
              <button
                key={`bid-${bid}`}
                className={cx('btn btn-sm btn-square mx-1')}
                disabled={disableBtn}
                onClick={() => makeBid(bid)}
              >{bid}</button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
};
