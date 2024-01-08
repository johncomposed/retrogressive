import {useAuth} from '~/lib/firebase'
import { useAuthSignOut, useAuthUser } from "@react-query-firebase/auth";


export const useUser = () => {
  const auth = useAuth();
  const user = useAuthUser(['user'], auth)

  return [user, {
    isLoggedIn: user.isSuccess && user.data,
  }] as const
}

// TODO: do a better check with isLoggedinContext
export const useLoggedInUser = () => {
  const auth = useAuth();
  const user = useAuthUser(['user'], auth)

  if (!user.data) {
    console.error('useLoggedInUser should never not have data!?!?!', user);
  }

  return user.data!;
}


