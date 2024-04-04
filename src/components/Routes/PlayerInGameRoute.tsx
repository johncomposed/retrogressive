import React, {useEffect} from 'react'
import { Navigate, Outlet, useLocation, useParams  } from 'react-router-dom';
import { useLoggedInUser, useUser } from '~/api/userHooks';
import { Loading, LoadingProps } from '~/components/Loading';
import { GameDoc, useGameData } from '~/api/gameHooks';
import { User } from 'firebase/auth';


export function playerInGameIssue(gameId: string, user: User, gameData?: GameDoc) {
  if (!gameId || !gameData) return `Game ${gameId} not found`

  // TODO: Once the user uid works then comment this out.
  //if (!gameData.players.includes(user.uid)) return `${user.uid} is not a player in game ${gameId}`
  // `Game ${gameId} has already completed` // Actually it's fine if it's completed.
  return ""
}


export default PlayerInGameRoute;
export function PlayerInGameRoute() {
  const { gameId } = useParams();
  const [userReq] = useUser(); // todo - shouldn't need this

  const user = useLoggedInUser();
  const gameReq = useGameData(gameId!, false);
  const location = useLocation();

  if (userReq.isLoading || gameReq.isLoading) return <Loading />;
  const issueMsg = playerInGameIssue(gameId!, user, gameReq.data,);

  console.log('issue', issueMsg);
  if (!issueMsg) return <Outlet />;
  return (
    <Navigate to="/" state={{from: location, message: issueMsg }}  />
  )
};
