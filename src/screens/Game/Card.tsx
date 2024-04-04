import React, { useState } from 'react'
import cx, { ClassValue } from 'clsx';
import { GameDoc } from '~shared/index';
import { MutationStatus, QueryStatus } from '~/components/ResultStatus';
import { State } from 'xstate';
import { useGameAction, useSudoPlayerData } from '~/api/gameHooks';
import { LooseCard } from '~shared/retroMachine/types';

export type CardProps = {
  isPlaying: boolean
  disableCard: boolean
  card: LooseCard
  totalCards: number
  cardIndex: number
  onClick: () => void
};

export default Card;
export function Card({ isPlaying, disableCard, card, totalCards, cardIndex, onClick }: CardProps) {
  const halfway = totalCards/2;
  const mult = cardIndex+0.5 - halfway;
  const deg = 5;
  const x= 30
  const y = 1;

  return (
    <button key={`card-${card}`} className={cx(
      'card',
      'flex justify-center items-center',
      'rounded-btn h-32 w-24 p-4 mx-2 text-md font-bold',
      {
        'cursor-default shadow-none': !isPlaying,
        'cursor-pointer shadow-md hover:brightness-90	': isPlaying,
        'bg-gray-800 text-white': card[0] === 'C',
        'bg-blue-950 text-white': card[0] === 'S',
        'bg-red-400': card[0] === 'D',
        'bg-pink-400': card[0] === 'H'
      })}
      style={{
        transform: [
          `rotate(calc(var(--r)*${deg*mult}deg))`,
          `translate(calc(var(--x)*${x*mult}px), calc(var(--y)*${y}px))`
        ].join(' ')        
      }}
      disabled={isPlaying && disableCard}
      onClick={onClick}
    >
      <span>{card}</span>
    </button>
  )
};
