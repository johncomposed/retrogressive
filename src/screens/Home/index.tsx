import React, { useEffect, useRef, useState } from 'react'
import cx, { ClassValue } from 'clsx';
import { Dialog } from '@headlessui/react'
import { useNavigate } from 'react-router-dom';
import { nanoid } from '~shared/index';
import { JoinGameForm } from './JoinGameForm';
import { useUser, useUserContext } from '~/api/userHooks';



export function ListActiveGames({ uid }) {

}


export function Signin() {

}

export function UserCard() {
  const [user, {isLoggedIn}] = useUser()


  // TODO: this is annoying to deal with without putting the LoggedInRoute as a wrapper. 
  if (isLoggedIn) return (
    <div className={cx(
      "flex items-center justify-start",
      "my-4 w-[500px] bg-white p-6 rounded-xl",
      "border-solid border-2 border-b-4 border-r-4 border-black"
    )}>
      <div className="avatar placeholder mr-4">
        <div className="bg-neutral text-neutral-content rounded-full w-24">
          <span className="text-3xl">❔</span>
        </div>
      </div>
      <div>
        <h1 className="text-xl font-bold">{user.data?.displayName || 'Anon Player'}</h1>
        <h2>id: {user.data?.uid}</h2>
      </div>
    </div>
  )

}


export default HomePage;
export function HomePage() {
  const [isJoinOpen, setIsJoinOpen] = useState(false)
  const navigate = useNavigate();

  function handleJoinSubmit(gameId) {
    if (gameId) {
      navigate(`/lobby/${gameId}`);
      return
    } 
    setIsJoinOpen(false)
  }

  return (
    <div className={cx(
      "flex flex-col items-center justify-end",
      " h-screen mx-auto  p-10",
      // "container bg-tan80s-100"
    )}>
      <h1 className=" text-7xl font-bold mt-40 mb-10">
        Retrogressive
      </h1>
      <div className='flex flex-col items-center flex-grow'>

        {isJoinOpen ? (
          <JoinGameForm onSubmit={handleJoinSubmit} />
        ) : (
          <button className={cx(
            "btn btn-lg btn-wide btn-primary brutal"
          )}
            onClick={() => setIsJoinOpen(true)}
          >Join a game</button>
        )}

        <button className={cx(
          "btn btn-lg btn-wide btn-secondary ",
          "brutal",
          "my-4"
        )}
        onClick={() => {
          navigate(`/lobby/${nanoid(6)}`);
        }}
        >Create lobby</button>

        <button className={cx(
          "btn btn-lg btn-wide btn-accent ",
          "brutal",
        )}>Rules</button>
      </div>

      <UserCard />
    </div>
  )
};
