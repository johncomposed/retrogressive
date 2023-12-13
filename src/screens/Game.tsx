import React, { FormEventHandler, useRef, useState } from 'react';
import { Head } from '~/components/Head';
import ToggleComponent from '~/components/toggle';
import { useParams } from 'react-router-dom';

import { useDatabase, useFunctions, useFirestore } from '~/lib/firebase';
import { ref } from "firebase/database";
import { useDatabaseSnapshot, useDatabaseSetMutation, useDatabaseValue } from "@react-query-firebase/database";

import { useFunctionsCall } from '@react-query-firebase/functions'
import cx from 'clsx';

import { useFirestoreDocument } from "@react-query-firebase/firestore";
import { doc, query, collection, limit, QuerySnapshot, DocumentData, Timestamp, DocumentReference } from "firebase/firestore";

import { Smiley } from './Index';
import { MutationObserverResult, UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import { GameDoc as _GameDoc, GamePlayerDoc as _GamePlayerDoc } from "~shared/index";
import { State } from 'xstate/lib/State';
type GameDoc = _GameDoc<Timestamp>
type GamePlayerDoc = _GamePlayerDoc<Timestamp>

function MutationStatus({ name = "", mutation, className = '' }: { name: string, className?: string, mutation: UseMutationResult | UseQueryResult }) {
  return <div title={`${name} ${mutation.status}`} className={cx(`h-4 w-4 mx-2 inline-block rounded-full `, {
    'bg-purple-600': mutation.status === 'idle',// mutation.isLoading || mutation.isIdle,
    'bg-blue-600': mutation.isLoading,
    'bg-green-600': mutation.isSuccess,
    'bg-red-600': mutation.isError,
    'bg-slate-500': mutation.isPaused
  }, className)} />
}

const makeFnCallDebug = (name, moreOpts = {}) => ({
  onSuccess(...args) {
    console.log(`${name} Success`, ...args);
  },
  onError(error) {
    console.error(`${name} error`, error);
  },
  onMutate(variables) {
    console.log(`${name} mutation (wow)`, variables);
  },
  ...moreOpts
})


const TabContent = ({ gameId, player, data }: { gameId: string, player: string, data: GameDoc }) => {
  const functions = useFunctions()
  const firestore = useFirestore()
  const ref = doc(firestore, 'games', gameId, 'players', player) as DocumentReference<GamePlayerDoc>;
  const playerDoc = useFirestoreDocument(['games', gameId, player, data.context.roundNumber], ref, {
    subscribe: true
  })

  const runGameFn = useFunctionsCall(functions, "runGame", {}, makeFnCallDebug(`runGame:${player}`));

  const disableBtn = runGameFn.isLoading || runGameFn.isError

  const state = State.from(data.state)

  const isPlaying = state.matches('round.playing')
  const playerData = playerDoc.data && playerDoc.data.data()
  console.log('playerdoc', playerDoc, playerDoc.data?.exists(), playerDoc.data?.data(), playerData)

  return (
    <div className='text-left'>
      <div className='flex flex-row items-center justify-end mb-2'>
        <MutationStatus name="playerdoc" mutation={playerDoc} />
        <MutationStatus name="rungame" mutation={runGameFn} />
      </div>
      
      {state.matches('idle') && (
        <button 
          className='btn btn-block btn-lg btn-primary' 
          disabled={disableBtn}
          onClick={() => {
            runGameFn.mutate({
              id: gameId,
              event: {type: 'START_GAME'}
            })
          }}
        >Start Game</button>
      )}



        {!playerData && (
          <span className="loading loading-spinner"></span>
        )}

        {playerData && playerData.hands && (
          <>
            <div 
              className='flex flex-row items-center justify-center w-full flex-wrap rounded-md bg-slate-100 mb-4' 
              style={{minHeight: '5rem'}} 
            >
              {playerData && playerData.hands.map((c) => (
                <button key={`card-${c}`} className={cx('btn btn-lg mx-1', {
                  'cursor-default btn-active': !isPlaying,
                  'btn-neutral': c[0] === 'C' || c[0] === 'S',
                  'btn-error': c[0] === 'D' || c[0] === 'H',
                })}
                  disabled={isPlaying && disableBtn}
                  onClick={() => {
                    isPlaying && runGameFn.mutate({
                      id: gameId,
                      event: { type: "PLAY_CARD", playerId: player, card: c }
                    })
                  }}
                >{c}</button>
              ))}
            </div>
          </>
        )}


      {isPlaying && (
        <div>playing</div>
      )}

      {state.matches('round.bidding') && (
        <div>
          <h3 className='text-2xl font-bold py-2'> Bidding </h3>
          <div className='flex flex-row flex-wrap items-center justify-center'>

            {Array.from({ length: data.context.cardsPerPlayer + 1 }, (_, bid) => (
              <button
                key={`bid-${bid}`}
                className={cx('btn btn-sm btn-square mx-1')}
                disabled={disableBtn}
                onClick={() => {
                  runGameFn.mutate({
                    id: gameId,
                    event: { type: "MAKE_BID", playerId: player, bid }
                  })
                }}
              >{bid}</button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}







function ActiveGame({ gameId, data }: { gameId: string, data: GameDoc }) {
  const [isPlayer, setPlayer] = useState(data.players[0])

  console.log('Game context', data)

  const trumpCard = data.context.trumpCard ?? ''
  return (
    <div className=' mt-10'>
      <h1 className='text-4xl font-bold pb-10'>Game found <span className="ml-4 badge badge-lg">{JSON.stringify(data.state)}</span></h1>
      
      
      <div className="indicator mb-12 w-full">
        <span className={cx("indicator-item badge", {
          'bg-slate-700 text-white': trumpCard[0] === 'C' || trumpCard[0] === 'S',
          ' bg-red-400': trumpCard[0] === 'D' || trumpCard[0] === 'H',
        } )}>
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
                    'bg-neutral text-white': card[0] === 'C' || card[0] === 'S',
                    ' bg-red-400': card[0] === 'D' || card[0] === 'H',
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
      
      
      <div role="tablist" className="tabs tabs-lifted">
        {data.players.map(p => {
          const tricksWon = data.context.trickWinners.filter(w => w===p).length
          const tricksBid = data.context.bids[p]
          return (
            <React.Fragment key={`tabFrag-${p}`}>
              <a key={`tab-${p}`} role="tab" className={cx(`tab indicator mr-4`, {
                'tab-active': p === isPlayer,
                'text-purple-800 underline': p === data.players[data.context.currentPlayerIndex]
              })} aria-label={`Player ${p}`}  onClick={() => setPlayer(p)} >
                  <span className='mx-2'>Player {p}</span>
                  <span className={cx("indicator-item badge ", {
                    'badge-success': tricksWon === tricksBid,
                    'badge-error': tricksWon > tricksBid,
                    // 'badge-primary': p !== data.players[data.context.currentPlayerIndex]
                  })}>{tricksWon}/{tricksBid}</span>
              </a>
              <div key={`tabcontent-${p}`}  role="tabpanel" className="tab-content bg-base-100 border-base-300 rounded-box p-6">
                {p === isPlayer && <TabContent gameId={gameId} player={p} data={data} />}
              </div>
            </React.Fragment>
          )
        })}
      </div>

      <div className="collapse  collapse-arrow mt-6 bg-base-200">
        <input type="checkbox" className="peer" defaultChecked={true} /> 
        <div className="collapse-title font-bold bg-slate-100 text-primary-content peer-checked:bg-slate-200">
          Game Context
        </div>
        <div className="collapse-content  bg-slate-50 peer-checked:bg-slate-100 "> 
          <pre><code>{JSON.stringify(data, null, 2)}</code></pre>
        </div>
      </div>
    </div>
  )
}


function Lobby({ gameId }) {
  const functions = useFunctions()
  const createGameMut = useFunctionsCall(functions, "createGame", {}, makeFnCallDebug('createGame'));

  console.log(createGameMut)

  return (
    <div className=' text-center mt-10'>
      <h1 className='text-4xl font-bold pb-4'>no game exists
        <MutationStatus name="createGameMut" mutation={createGameMut} />
      </h1>
      {createGameMut.isError && <pre className='text-red-800'>{JSON.stringify(createGameMut.error)}</pre>}
      <button
        className='btn btn-primary'
        disabled={createGameMut.isLoading || createGameMut.isError}
        onClick={() => createGameMut.mutate(
          // undefined
          { id: gameId, context: { players: ['a', 'b'], cardsPerPlayer: 7 } }
        )}
      > Create Game </button>
    </div>
  )
}


export function GameScreen() {
  const { gameId = 'default' } = useParams();
  const firestore = useFirestore()
  const ref = doc(firestore, 'games', gameId) as DocumentReference<GameDoc>;
  const gameDocument = useFirestoreDocument(['games', gameId], ref, {
    includeMetadataChanges: true,
    subscribe: true
  })

  return (
    <>
      <Head title="GamePage" />
      <nav className="navbar flex items-center justify-center">
        <h2 className="text-lg">Game Instance:
          <span className="ml-4 badge badge-accent badge-lg">{gameId}</span>
          <MutationStatus name="gamedoc" mutation={gameDocument} />
        </h2>
      </nav>
      <main className=' md:max-w-200 max-w-120 mx-auto px-4'>
        {gameDocument.isError && <pre className='text-red-800'>{JSON.stringify(gameDocument.error)}</pre>}
        {gameDocument.isLoading && <h1>Loading...</h1>}

        {gameDocument.isSuccess && !gameDocument.data?.exists() && (
          <Lobby gameId={gameId} />
        )}

        {gameDocument.isSuccess && gameDocument.data?.exists() && (
          <ActiveGame gameId={gameId} data={gameDocument.data.data()} />
        )}


        <Smiley />
      </main>
    </>
  );
}

export default GameScreen;
