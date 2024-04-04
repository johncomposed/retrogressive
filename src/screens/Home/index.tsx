import React, { useEffect, useRef, useState } from 'react'
import cx, { ClassValue } from 'clsx';
import { Dialog } from '@headlessui/react'
import { useNavigate } from 'react-router-dom';
import { nanoid } from '~shared/index';



export function ListActiveGames({ uid }) {

}


export function Signin() {

}

type JoinGameFormProps = { className?: ClassValue; onSubmit: (id: string) => void }

export const JoinGameForm: React.FC<JoinGameFormProps> = ({ onSubmit, className }) => {
  const gameIdRef = useRef<HTMLInputElement>(null);
  const [idText, setIdText] = useState('')
  const [pasteBroken, setPasteBroken] = useState(false)

  // Focus on load
  useEffect(() => {
    gameIdRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(idText);
  };

  const paste = () => {
    navigator.clipboard.readText()
      .then(text => {
        if (gameIdRef.current) setIdText(text)
      })
      .catch(err => {
        console.error('Failed to read clipboard contents: ', err);
        if (gameIdRef.current) setPasteBroken(true);
      });
  }

  return (
    <form className={cx(
      "flex items-center",
      className
    )} onSubmit={handleSubmit}>
      <input
        name="gameId" type="text"
        ref={gameIdRef} placeholder='Game ID'
        value={idText} onChange={e => setIdText(e.target.value)}
        className={cx(
          "rounded-md border-2 p-[10px] font-bold brutal",
          "outline-none focus:shadow-none",
          "mr-6"
        )} />

      {idText ? (
        <button className={cx(
          "btn btn-circle btn-primary btn-md brutal",
        )} type="submit">
          {'⎆'}
        </button>
      ) : (
        <button
          type="button"
          disabled={pasteBroken}
          title={pasteBroken ? "Can't paste on your system for some reason" : "Click to paste"}
          onClick={paste}
          className={cx(
            "btn btn-circle btn-warning btn-md",
            "brutal"
          )}>
          {pasteBroken ? '🤷' : '📄'}
        </button>
      )}


    </form>
  );
};


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

      <div className={cx(
        "flex items-center justify-start",
        "mb-4 w-[500px] bg-white p-6 rounded-xl",
        "border-solid border-2 border-b-4 border-r-4 border-black"
      )}>
        <div className="avatar placeholder mr-4">
          <div className="bg-neutral text-neutral-content rounded-full w-24">
            <span className="text-3xl">❔</span>
          </div>
        </div>
        <div>
          <h1 className="text-xl font-bold">Display name</h1>
          <h2>id: blahblahblah</h2>
        </div>
      </div>
    </div>
  )
};
