# About this directory

This is an updated version of react-query-firebase with @kaueDM 's [PR 61](https://github.com/invertase/react-query-firebase/pull/61) applied. 
Plus some cleanup. 

It is technically under a different license than the rest of the code, not that it matters too much. 


# Changelog
- Moved the files around to better fit this directory.
- Added unSub2 as a modification of the fix described in [PR 77](https://github.com/invertase/react-query-firebase/pull/77) and made useSubscription reference it. It appears to work.


# Other Notes
The useSubscription is the jankiest part of this. If I run into too much trouble, I'll probably investigate [simple alternatives mentioned here](https://github.com/invertase/react-query-firebase/issues/73) like: 
```ts
import { DocumentData, getDocs, onSnapshot, Query } from "firebase/firestore"
import { useEffect } from "react"
import { useQuery } from "react-query"

interface IProps {
   keyName: Partial<string[]>
   query: Query<DocumentData>
   subscribe?: boolean
}

export const useCustomFireStoreQuery = ({ keyName, query, subscribe = false }: IProps) => {
   const getQuery = useQuery(keyName, async () => {
       const snapshot = await getDocs(query)
       return snapshot
   })
   useEffect(() => {
       if (subscribe) {
           const unsub = onSnapshot(query, (doc) => {
               getQuery.refetch()
           })
           return () => unsub()
       }
   }, [subscribe, query])
   return getQuery
}
```
or 
```ts
import { DocumentData, getDocs, onSnapshot, DocumentReference } from "firebase/firestore"
import { useEffect } from "react"
import { useQuery } from "react-query"

interface IProps {
   keyName: Partial<string[]>
   docRef: DocumentReference<DocumentData>
   subscribe?: boolean
}

export const useFirestoreDocument = ({ keyName, docRef, subscribe = false }: IProps) => {
   const query = useQuery(keyName, async () => {
       const docSnap = await getDocs(docRef)
       return docSnap.data()
   })
   useEffect(() => {
       if (subscribe) {
           const unsub = onSnapshot(docRef, (doc) => {
               query.refetch()
           })
           return () => unsub()
       }
   }, [subscribe])

   return query;
}
```
