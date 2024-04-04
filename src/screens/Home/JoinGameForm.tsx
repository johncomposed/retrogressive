import React, { useEffect, useRef, useState } from 'react'
import cx, { ClassValue } from 'clsx';

export type JoinGameFormProps = { className?: ClassValue; onSubmit: (id: string) => void }

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