import { ref, onValue, push, onDisconnect, set, serverTimestamp } from "firebase/database";
import { useDatabase, useFunctions, useFirestore, useAuth } from '~/lib/firebase';
import { useAuthUser } from '~/lib/react-query-firebase/auth';
import { useDatabaseSnapshot } from "@react-query-firebase/database";
import { useEffect } from "react";


export function setupPresenceHook() {
  const db = useDatabase()
  const onlineRef = ref(db, '.info/connected');
  const online = useDatabaseSnapshot(["isOnline"], onlineRef, {subscribe: true});
  const user = useAuthUser(['user'], useAuth())

  const loggedIn = !user.isLoading && user.data;
  const userId = user.data?.uid;
  const isOnline = online.data?.val();



  useEffect(() => {
    console.log(online.status, isOnline, userId);
    if (online.status === 'success' && isOnline && userId) {
      const myConnectionsRef = ref(db, `users/${userId}/connections`);
      const lastOnlineRef = ref(db, `users/${userId}/lastOnline`);
  
        // We're connected (or reconnected)! Do anything here that should happen only if online (or on reconnect)
        const con = push(myConnectionsRef);
        // When I disconnect, remove this device
        onDisconnect(con).remove();
        // Add this device to my connections list
        // this value could contain info about the device or a timestamp too
        set(con, true);
    
        // When I disconnect, update the last time I was seen online
        onDisconnect(lastOnlineRef).set(serverTimestamp());
    }
  }, [online.status, isOnline, userId])

  console.log('PRESENCE', online, loggedIn,  online.data?.val(), userId)

}

export function usePresence() {

}