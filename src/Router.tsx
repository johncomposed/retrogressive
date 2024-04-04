import { Suspense, useEffect, useState } from 'react';
import { createBrowserRouter, useLocation, createRoutesFromElements } from 'react-router-dom'
import {  RouterProvider, Route, Outlet, Navigate } from 'react-router-dom'
import HomePage from './screens/Home';
import GamePage from './screens/Game';
import LobbyPage from './screens/Lobby';
import SigninScreen from './screens/SignIn';

import OldGamePage from './screens/OldGame';


import LoggedInRoute from './components/Routes/LoggedInRoute';
import PlayerInGameRoute from './components/Routes/PlayerInGameRoute';


// todo: move to layout file
export function Layout() {
  // When location state comes in with a message, display the message. 
  return (
    <div className='bg-core80s-50'>
      <Outlet />
    </div>
  );
}


// todo: create error boundaries
export const router = createBrowserRouter(createRoutesFromElements(
  <Route path="/" element={<Layout />}>
    <Route index element={<HomePage />}/>

    {/* Old janky single page game */}
    <Route element={<LoggedInRoute />}>
      <Route path="/old/:gameId?" element={<OldGamePage />} />
    </Route>


    <Route element={<LoggedInRoute />}>
      <Route path="/game" element={<Navigate to="/" replace />}/>
      <Route element={<PlayerInGameRoute />}>
        <Route path="/game/:gameId" element={<GamePage />} />
      </Route>

      <Route path="/lobby/:gameId?" element={<LobbyPage />} />
    </Route>
    <Route path="/signin" element={<SigninScreen />} />
    <Route path="*" element={<Navigate to="/" replace state={{message: 'Page not found'}} />}/>
  </Route>
))





export function Router() {
  return (
    <RouterProvider router={router} />
  )
}
