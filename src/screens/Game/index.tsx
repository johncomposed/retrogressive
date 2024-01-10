import React, {useState} from 'react'
import cx, {ClassValue} from 'clsx';
import { useLocation, useParams } from 'react-router-dom';


export default GamePage;
export function GamePage() {
  const location = useLocation()
  const { gameId = 'default' } = useParams();



  return (
    <div>
      gamepage


    </div>
  )
};
