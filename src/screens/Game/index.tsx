import React, { useState } from 'react'
import cx, { ClassValue } from 'clsx';
import { useLocation, useParams } from 'react-router-dom';
import { useGameData } from '~/api/gameHooks';
import { GameDoc } from '~shared/index';
import { useLoggedInUser } from '~/api/userHooks';
import Hand from './Hand';




function AllPlayers({ gameId, data }: { gameId: string, data: GameDoc }) {
  const [isPlayer, setPlayer] = useState(data.players[0])

  return (
    <div role="tablist" className="tabs tabs-lifted">
      {data.players.map(p => {
        const tricksWon = data.context.trickWinners.filter(w => w === p).length
        const tricksBid = data.context.bids[p]
        return (
          <React.Fragment key={`tabFrag-${p}`}>
            <a key={`tab-${p}`} role="tab" className={cx(`tab indicator mr-4`, {
              'tab-active': p === isPlayer,
              'text-green-800 underline': p === data.players[data.context.currentPlayerIndex]
            })} aria-label={`Player ${p}`} onClick={() => setPlayer(p)} >
              <span className='mx-2'>Player {p}</span>
              <span className={cx("indicator-item badge ", {
                'badge-success': tricksWon === tricksBid,
                'badge-error': tricksWon > tricksBid,
              })}> {tricksBid !== undefined && `${tricksWon}/${tricksBid}`}</span>
            </a>
            <div key={`tabcontent-${p}`} role="tabpanel" className="tab-content bg-base-100 border-base-300 rounded-box p-6">
              {p === isPlayer && <Hand gameId={gameId} player={p} data={data} />}
            </div>
          </React.Fragment>
        )
      })}
    </div>
  )
}

function GameTable({ gameId, data }: { gameId: string, data: GameDoc }) {
  const trumpCard = data.context.trumpCard ?? '';
  return (

    <div className="indicator mb-12 w-full">
      <span className={cx("indicator-item badge py-2", {
        'bg-gray-800 text-white': trumpCard[0] === 'C',
        'bg-blue-950 text-white': trumpCard[0] === 'S',
        'bg-red-400': trumpCard[0] === 'D',
        'bg-pink-400': trumpCard[0] === 'H'
      })}>
        {trumpCard}
      </span>
      <div className="w-full grid grid-cols-4 gap-4 place-items-center bg-green-100 rounded-md p-8 ">
        {data.players.map(p => {
          const card = data.context.currentTrick[p]
          return (
            <div key={`table-card-space-${p}`}
              className={cx(
                'rounded-md w-full py-4 px-8 min-h-64 bg-green-200 shadow-inner',
                ' flex flex-col justify-end '
              )} >
              {card && (
                <div className={cx('rounded-lg flex justify-center items-center h-40 text-lg font-bold', {
                  ' bg-gray-800 text-white': card[0] === 'C',
                  'bg-blue-950 text-white': card[0] === 'S',
                  ' bg-red-400': card[0] === 'D',
                  'bg-pink-400': card[0] === 'H'
                })}>
                  {card}
                </div>
              )}
              <h4 className='mt-6 text-sm text-green-500 text-right'>{p}</h4>
            </div>
          )
        })}
      </div>
    </div>
  )
}




export default GamePage;
export function GamePage() {
  const user = useLoggedInUser()
  const { gameId = 'default' } = useParams();
  const { isLoading, data } = useGameData(gameId)
  const playerId = user.uid;
  if (isLoading || !data) return <span>...</span>;

  const realPlayer = data.players.includes(playerId);

  return (
    <div className='my-10 md:max-w-200 max-w-120 mx-auto px-4'>
      <h1 className='text-4xl text-center font-bold pb-10'>
        Game {gameId}
      </h1>
      <GameTable gameId={gameId} data={data} />
      {!realPlayer && <AllPlayers gameId={gameId} data={data} />}
      {realPlayer && (
        <div className="w-full max-w-lg p-8 py-6  my-12 mx-auto bg-white border border-gray-200 rounded-lg shadow">
          <div className="flow-root">
            <Hand gameId={gameId} player={user.uid} data={data} />
          </div>
        </div>
      )}

    </div>
  )
};
