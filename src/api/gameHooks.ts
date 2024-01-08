import { useCallback, useEffect, useRef, useState } from 'react';
import { doc, DocumentData, Timestamp, DocumentReference } from "firebase/firestore";
import { ref, push, onDisconnect, set, serverTimestamp, OnDisconnect } from "firebase/database";

import { State } from 'xstate/lib/State';

import { StrictCard } from '~shared/retroMachine/types';
import { GameDoc as _GameDoc, GamePlayerDoc as _GamePlayerDoc } from "~shared/index";
import { isBidValid, isPlayValid } from '~shared/retroMachine/utils';


import { useFunctionsCall } from '@react-query-firebase/functions'
import { useFirestoreDocumentData } from "@react-query-firebase/firestore";
import { useDatabaseSnapshot, useDatabaseSetMutation, useDatabaseValue } from "@react-query-firebase/database";

import { useDatabase, useFunctions, useFirestore } from '~/lib/firebase';
import { useLoggedInUser } from './userHooks';
import { makeFnCallDebug } from './utils';

export type GameDoc = _GameDoc<Timestamp>
export type GamePlayerDoc = _GamePlayerDoc<Timestamp>



export const gameStateMatches = (stateVal: GameDoc['state'], matches: string) => {
  const state = State.from(stateVal)
  return state.matches(matches)
}

export const validCards = (hand: GamePlayerDoc['hands'], gc: GameDoc['context']) => {
  // Note: since there's multiple decks this could result in an obj with fewer values than the hand array. 
  return Object.fromEntries(hand.map(card => [card, isPlayValid(card, hand, gc.leadSuit)]))
}

export const validBids = (gc: GameDoc) => {
  return Array.from({ length: gc.context.cardsPerPlayer + 1 }, (_, bid) => {
    return bid
  })
}


export const isActivePlayer = (gc: GameDoc, playerId) => gc.players[gc.context.currentPlayerIndex] === playerId;


export const useGameData = (gameId: string, subscribe=true) => {
  const firestore = useFirestore()
  const ref = doc(firestore, 'games', gameId) as DocumentReference<GameDoc>;
  const gameDocument = useFirestoreDocumentData(['games', gameId], ref, {
    includeMetadataChanges: subscribe, // TODO: Do I need this??
    subscribe
  })

  return gameDocument
}

export const usePlayerData = (gameId: string, subscribe=true) => {
  const user = useLoggedInUser()
  const firestore = useFirestore()
  const playerDocRef = doc(firestore, 'games', gameId, 'players', user.uid) as DocumentReference<GamePlayerDoc>;
  const playerDoc = useFirestoreDocumentData(['games', gameId, user.uid], playerDocRef, {
    subscribe
  })

  return playerDoc
}


export const useGameAction = (gameId: string, debug=false) => {
  const functions = useFunctions()
  const runGameFn = useFunctionsCall(functions, "runGame", {}, debug ? makeFnCallDebug(`runGame`) : {});

  const startGame = useCallback(() => {
    return runGameFn.mutate({id: gameId, event: { type: "START_GAME" }})
  }, [gameId])


  const playCard = useCallback((card: StrictCard) => {
    return runGameFn.mutate({id: gameId, event: { type: "PLAY_CARD", card }})
  }, [gameId])

  const makeBid = useCallback((bid: number) => {
    return runGameFn.mutate({id: gameId, event: { type: "MAKE_BID", bid }})
  }, [gameId])

  return [
    runGameFn,
    {
      startGame,
      playCard,
      makeBid
    }
  ] as const
}

// todo: STUB
// https://firebase.google.com/docs/reference/js/v8/firebase.database.OnDisconnect
export const usePlayerGamePresence = (gameId: string, setupDisconnect=false) => {
  const user = useLoggedInUser()
  const db = useDatabase()
  const onlineRef = ref(db, '.info/connected');
  const online = useDatabaseValue(["isOnline"], onlineRef, {subscribe: true});
  const playerOnlineRef = ref(db, `/games/${gameId}/users/${user.uid}}`);
  const disconnectRef = useRef<OnDisconnect | null>(null);

  useEffect(() => {
    if (!disconnectRef.current) {
      disconnectRef.current = onDisconnect(playerOnlineRef)
      disconnectRef.current.set(false)
    }
    set(playerOnlineRef, true);

    return () => {
      if (disconnectRef.current) {
        disconnectRef.current.cancel()
        set(playerOnlineRef, false);
      }
    }
  }, [gameId])


  return online
}


// todo: STUB
export const useOpponentGamePresence = (gameId: string, playerId: string) => {
  const db = useDatabase()
  const onlineRef = ref(db, '.info/connected');
  const online = useDatabaseValue(["isOnline"], onlineRef, {subscribe: true});
  return online
}





