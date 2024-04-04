import React, {useEffect} from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import cx, {ClassValue} from 'clsx';
import { FirebaseUser, UserDataProvider, useUser } from '~/api/userHooks';
import { Loading, LoadingProps } from '../Loading';

export type LoggedInRouteProps = {
  children?: React.ReactNode,
  navigateTo?: string
};

export const defaultLogProps = {
  navigateTo: '/signin'
}

export default LoggedInRoute;
export function LoggedInRoute({children, navigateTo}: LoggedInRouteProps = defaultLogProps) {
  const [user, {isLoggedIn}] = useUser()
  const location = useLocation(); // <-- get current location being accessed

  useEffect(() => {
    console.log('LoggedInRoute', user.status, user.data)
  }, [user.status])

  if (user.isLoading) return <Loading />;
  if (isLoggedIn) return (
    <UserDataProvider loading={<Loading />} user={isLoggedIn.toJSON() as FirebaseUser} >
      {children ?? <Outlet />}
    </UserDataProvider>
  );

  if (navigateTo) return (
    <Navigate to={navigateTo} state={{from: location }}  />
  )

  return <Loading />
};
