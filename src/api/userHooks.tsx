import {useAuth, useFirestore} from '~/lib/firebase'
import { useAuthSignOut, useAuthUser } from "@react-query-firebase/auth";
import { DocumentReference, collection, doc, query, where } from 'firebase/firestore';
import { useFirestoreDocumentData } from '~/lib/react-query-firebase/firestore';
import { createContext, useContext, ReactNode } from 'react';
import { User } from 'firebase/auth';

export type UserProfile = {
  avatar: string
  displayName: string
}
export type FirebaseUser = Pick<User, 
  'uid' | 'displayName' | 'email' | 
  'emailVerified' | 'phoneNumber' | 
  'photoURL' | 'tenantId' | 'isAnonymous'
> & { createdAt: string, lastLoginAt: string}

export type UserData = FirebaseUser & {profile: UserProfile}
export const UserContext = createContext<UserData | null>(null);

export const UserProvider = ({ children, user }: { children: ReactNode, user: UserData | null }) => {
  return (
    <UserContext.Provider value={user}>
      {children}
    </UserContext.Provider>
  );
};

export const UserDataProvider = (props: {children: ReactNode, loading: ReactNode, user: FirebaseUser}) => {
  const {user, loading, children} = props;
  const {isLoading, data} = useUserProfile(user.uid, true)
  if (!data) return loading;

  // TODO: handle this mess T_T
  
  const userdata = user as UserData
  userdata.profile = data;

  return (
    <UserContext.Provider value={userdata}>
      {children}
    </UserContext.Provider>
  )
}

export const useUserContext = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUserContext must be used within a UserProvider');
  }
  return context;
};

export const useUser = () => {
  const auth = useAuth();
  const user = useAuthUser(['user'], auth)

  window['user'] = user;
  return [user, {
    isLoggedIn: user.isSuccess && user.data,
  }] as const
}

export const useLoggedInUser = () => {
  const user = useUserContext();
  return user!;
}


export const useUserProfile = (userId: string, subscribe=false) => {
  const firestore = useFirestore()
  const ref = doc(firestore, 'users', userId) as DocumentReference<UserProfile>;
  const userDoc = useFirestoreDocumentData(['users', userId], ref, {
    subscribe
  })

  return userDoc
}

