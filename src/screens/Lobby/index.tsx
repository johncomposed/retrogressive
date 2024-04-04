import React, { useEffect, useState } from 'react'
import cx, { ClassValue } from 'clsx';
import { Navigate, useNavigate, useParams } from 'react-router-dom';

import { useFunctions } from '~/lib/firebase';
import { useFunctionsCall } from '~/lib/react-query-firebase/functions';
import { makeFnCallDebug } from '~/api/utils';
import { LobbyPlayerVal, useLobbyData, useLobbyPlayerJoin } from '~/api/lobbyHooks';
import { useLoggedInUser, useUserProfile } from '~/api/userHooks';
import { MutationStatus } from '~/components/ResultStatus';
import { useGameData } from '~/api/gameHooks';



function UserProfileRow({ userId }: LobbyPlayerVal & { userId: string }) {
  const { data, isLoading, status } = useUserProfile(userId)

  return (
    <li className="py-3 sm:py-4">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-green-300 flex items-center justify-center text-center">
            {data?.avatar}
          </div>
        </div>
        <div className="flex-1 min-w-0 ms-4">
          <p className="text-sm font-medium text-gray-900 truncate dark:text-white">
            {isLoading ? <span className="loading loading-dots loading-xs"></span> : data?.displayName}
          </p>
          <p className="text-sm text-gray-500 truncate dark:text-gray-400">
            {userId}
          </p>
        </div>
        <div className="inline-flex items-center text-base font-semibold text-gray-900 dark:text-white">
          <input type="checkbox" className="checkbox" />
        </div>
      </div>
    </li>

  )
}



export default LobbyPage;
export function LobbyPage() {
  const { gameId = 'default' } = useParams();
  const user = useLoggedInUser()
  const navigate = useNavigate();

  const gameData = useGameData(gameId)
  const lobbyData = useLobbyData(gameId)
  const functions = useFunctions()
  const createGameMut = useFunctionsCall(functions, "createGame", {}, makeFnCallDebug('createGame'));
  const [nPlayers, setNPlayers] = useState(2)
  const [nCards, setNCards] = useState(2)

  useLobbyPlayerJoin(gameId)


  console.log('lobbydata!', gameData, lobbyData.data, lobbyData)


  useEffect(() => {
    if (nPlayers > nCards) {
      setNCards(nPlayers)
    }
  }, [nPlayers, nCards])


  const isLeader = user.uid === lobbyData?.data?.leader

  if (gameData.data?.created) {
    return (
      <Navigate to={`/game/${gameId}`}  />
    )
  }


  return (
    <div className='my-10'>
      <h1 className='text-center text-4xl font-bold pb-4'>
        Lobby
        <span className='mx-2 underline'>{gameId}</span>
        <MutationStatus name="createGameMut" res={createGameMut} />
      </h1>

      {createGameMut.isError && <pre className='text-red-800'>{JSON.stringify(createGameMut.error)}</pre>}

      <div>
        <div className="w-full max-w-lg p-8 py-6 mt-6  m-auto bg-white border border-gray-200 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h5 className="text-xl font-bold leading-none">
              Players in Lobby
            </h5>
          </div>
          <div className="flow-root">
            <ul role="list" className="divide-y divide-gray-200 dark:divide-gray-700">
              {lobbyData.data?.players && Object.entries(lobbyData.data.players).map(([playerId, playerStatus]) => {
                return <UserProfileRow key={playerId} userId={playerId} {...playerStatus} />
              })}
            </ul>
          </div>
        </div>
      </div>


      {/* CONFIG */}
      <div>
        <div className="w-full max-w-lg p-8 py-6  my-12 mx-auto bg-white border border-gray-200 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h5 className="text-xl font-bold leading-none">
              Game Config
            </h5>

            <span title={
              isLeader? 'You are the lobby leader' : `Led by ${lobbyData.data?.leader}`
              } className="text-md font-medium select-none">
              {isLeader ? '🔓' : '🔒'}
            </span>
          </div>
          <div className="flow-root">
            <div className='flex flex-row w-full items-center justify-center gap-6 text-right my-6'>
              <label className="form-control max-w-xs w-24">
                <div className="label">
                  <span className="label-text">Players</span>
                </div>
                <input type="number"
                  className={cx("input input-bordered w-full max-w-xs")}
                  value={nPlayers}
                  onChange={(e) => setNPlayers(e.target.valueAsNumber)}
                />
              </label>
              <label className="form-control max-w-xs w-24">
                <div className="label">
                  <span className="label-text">Rounds</span>
                </div>
                <input type="number"
                  min={nPlayers}
                  className={cx("input input-bordered w-full max-w-xs")}
                  value={nCards}
                  onChange={(e) => {
                    if (e.target.valueAsNumber >= nPlayers) setNCards(e.target.valueAsNumber);
                  }}
                />
              </label>
            </div>
          </div>
        </div>
      </div>


      <div className='text-center'>
        <button
          className='btn btn-lg btn-primary'
          disabled={createGameMut.isLoading || createGameMut.isError || !lobbyData.data?.players}
          onClick={() => createGameMut.mutate(
            {
              id: gameId, context: {
                // players: Object.keys(lobbyData.data?.players??{}),
                players: Array.from({ length: nPlayers }, (_, i) => String.fromCharCode(97 + i)),
                cardsPerPlayer: nCards
              }
            }
          )}
        >
          Create Game
        </button>
      </div>
    </div>
  )
};
