import { useCallback, useEffect, useRef, useState } from 'react';
import { doc, DocumentData, Timestamp, DocumentReference } from "firebase/firestore";
import { ref, push, onDisconnect, set, serverTimestamp, DatabaseReference, update, get, remove, Database } from "firebase/database";

import { State } from 'xstate/lib/State';

import { StrictCard } from '~shared/retroMachine/types';
import { GameDoc as _GameDoc, GamePlayerDoc as _GamePlayerDoc } from "~shared/index";
import { isBidValid, isPlayValid } from '~shared/retroMachine/utils';


import { useFunctionsCall } from '@react-query-firebase/functions'
import { useDatabaseValue, useDatabaseUpdateMutation } from "@react-query-firebase/database";

import { useDatabase, useFunctions, useFirestore } from '~/lib/firebase';
import { useLoggedInUser } from './userHooks';
import { makeFnCallDebug } from './utils';
import { useMutation } from '@tanstack/react-query';

export type GameDoc = _GameDoc<Timestamp>
export type GamePlayerDoc = _GamePlayerDoc<Timestamp>


export type LobbyPlayerVal = {
  online?: boolean,
  locked?: boolean
}
export type LobbyVal = {
  gameId?: string // Once the gameId exists, that means the game's been created.
  cardsPerPlayer: number
  leader: string
  created: number
  players: Record<string, LobbyPlayerVal>
}

export const LOBBY_STRING = 'lobbies'
export const lobbyPath = (lobbyId, key?: keyof LobbyVal, player?: string) => [
  `/${LOBBY_STRING}`,
  lobbyId,
].concat(
  player && key === 'players' ?
    [key, player] :
    (key ? [key] : [])
).join('/')


export const useLobbyData = (lobbyId: string, subscribe = true) => {
  const db = useDatabase()
  const lobbyRef = ref(db, lobbyPath(lobbyId));
  const lobbyRes = useDatabaseValue<LobbyVal>([LOBBY_STRING, lobbyId], lobbyRef, {
    subscribe
  })

  return lobbyRes
}

export type LobbyActionTypes = 'join' | 'leave' | 'lock' | 'unlock'
export const updateLobbyPlayer = (db: Database, lobbyId, playerId) => {
  const lobbyRef = ref(db, lobbyPath(lobbyId));
  const lobbyPlayerRef = ref(db, lobbyPath(lobbyId, 'players', playerId));

  return async (type: LobbyActionTypes) => {
    const lobbylatest = await get(lobbyRef);
    const lobbyData: LobbyVal = lobbylatest.exists() ? lobbylatest.val() : {}
    const latest = await get(lobbyPlayerRef);
    const data: LobbyPlayerVal = latest.exists() ? latest.val() : { online: false, locked: false }
    const updateOrSet = latest.exists() ? update : set;

    if (type === 'lock') {
      return updateOrSet(lobbyPlayerRef, { locked: true });
    }

    if (type === 'unlock') {
      if (!latest.exists()) return;
      if (!data.online) return remove(lobbyPlayerRef);
      return updateOrSet(lobbyPlayerRef, { locked: false });
    }

    if (type === 'join') {
      if (!lobbyData.leader) await update(lobbyRef, {leader: playerId});
      return updateOrSet(lobbyPlayerRef, { online: true });
    }

    if (type === 'leave') {
      if (!latest.exists()) return;
      if (!data.locked) {
        if (lobbyData.leader === playerId) {
          const newLeader = Object.keys(lobbyData.players??{}).filter(k => k !== playerId)[0];
          await update(lobbyRef, {leader: newLeader??null});
        }
        return remove(lobbyPlayerRef)
      }
      return updateOrSet(lobbyPlayerRef, { online: false });
    }

    return;
  }
}


export const useLobbyPlayerActions = (lobbyId: string, playerId: string) => {
  // const lobby = useLobbyData(lobbyId, subscribe)
  const db = useDatabase()
  // const lobbyPlayerRef = ref(db, lobbyPath(lobbyId, 'players', playerId));
  const lobbyMut = useMutation<void, Error, LobbyActionTypes>(updateLobbyPlayer(db, lobbyId, playerId))

  return lobbyMut
}


export const useLobbyPlayerJoin = (lobbyId: string) => {
  const user = useLoggedInUser()
  const lobbyMut = useLobbyPlayerActions(lobbyId, user.uid)
  // todo: Funky ondisconnect stuff here.
  // const db = useDatabase()
  // const lobbyPlayerRef = ref(db, lobbyPath(lobbyId, 'players', user.uid));


  useEffect(() => {
    console.log('JOINED')
    lobbyMut.mutate('join');
    return () => {
      console.log('LEFT')
      lobbyMut.mutate('leave')
    }
  }, [lobbyId])

  return lobbyMut
}


// todo: might be nicer to make it clear how to call the startgame.
export const useStartGame = (lobbyId: string, debug = true) => {
  // const db = useDatabase()
  // const lobbyRef = ref(db, lobbyPath(lobbyId));
  const functions = useFunctions()
  const runGameFn = useFunctionsCall(functions, "startGame", {}, debug ? makeFnCallDebug(`startGame`) : {});

  return runGameFn
}



export const useLobbyUpdate = (lobbyId: string) => {
  const db = useDatabase()
  const lobbyRef = ref(db, lobbyPath(lobbyId));
  const lobbyUpdate = useDatabaseUpdateMutation(lobbyRef)

  return lobbyUpdate
}


