import { Dialog } from '@headlessui/react';
import { Suspense, useEffect, useState } from 'react';
import { Outlet, RouteObject, useRoutes, BrowserRouter, Navigate, redirect, useLocation } from 'react-router-dom';
import { useAuthSignOut, useAuthUser } from "@react-query-firebase/auth";

const Loading = () => <p className="p-4 w-full h-full text-center">Loading...</p>;

import loadable from '@loadable/component'
import { useAuth } from '~/lib/firebase';


const IndexScreen = loadable(() => import('~/screens/Index'));
const GameScreen = loadable(() => import('~/screens/Game'));
const Page404Screen = loadable(() => import('~/screens/404'));
const SignInScreen = loadable(() => import('~/screens/SignIn'));

// import IndexScreen from '~/screens/Index'
// import GameScreen from '~/screens/Game'
// import Page404Screen from '~/screens/404'


function ProtectedRoute({children}) {
  const auth = useAuth()
  const user = useAuthUser(['user'], auth)
  const location = useLocation(); // <-- get current location being accessed

  useEffect(() => {
    console.log('userstatus', user.status, user.data)
  }, [user.status])

  if (user.isLoading) return <Loading />;
  if (user.isSuccess && user.data) return children;

  // return redirect("/signin")
  return (
    <Navigate to="/signin" state={{from: location }}  />
  )
}

function SignoutRoute() {
  const auth = useAuth()
  const user = useAuthUser(['user'], auth)
  const outMut = useAuthSignOut(auth);

  useEffect(() => {
    console.log('signout?', user.status, user.data, outMut.isLoading)
    if (user.status === 'success', user.data && !outMut.isLoading) {
      outMut.mutate();
    }
  }, [user.status])

  if (!outMut.isLoading && !user.isLoading && !user.data) return <Navigate to="/" />
  return <Loading />
}



function Layout() {
  return (
    <Outlet />
    // <div>
    //   <nav className="p-4 flex items-center justify-between">
    //     <span>Header</span>
    //   </nav>
    //   <Outlet />
    // </div>
  );
}

export const Router = () => {
  return (
    <BrowserRouter>
      <InnerRouter />
    </BrowserRouter>
  );
};

const InnerRouter = () => {
  const routes: RouteObject[] = [
    {
      path: '/',
      element: <Layout />,
      children: [
        {
          index: true,
          element: <IndexScreen />,
        },
        {
          path: '/signin',
          element: <SignInScreen />,
        },
        {
          path: '/signout',
          element: <SignoutRoute />
        },
        {
          path: '/game/:gameId?',
          element: <ProtectedRoute children={<GameScreen />} />
        },
        {
          path: '*',
          element: <Page404Screen />,
        },
      ],
    },
  ];
  const element = useRoutes(routes);
  return (
    <div>
      <Suspense fallback={<Loading />}>{element}</Suspense>
    </div>
  );
};
