import React, {useState} from 'react'
import cx, {ClassValue} from 'clsx';
import ConfigPanel from './ConfigPanel';
import LobbyPlayer from './LobbyPlayer';



export default LobbyPage;
export function LobbyPage() {

  return (
    <div>
      <h1 className='underline' >LobbyPage</h1>
      

      <ConfigPanel />

      <div>
        Players in lobby.
        {[].map((p, i) => {
         return <LobbyPlayer />
        })}
      </div>

      <div>
        Start Button
      </div>

    </div>
  )
};
