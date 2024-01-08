import React, {useState} from 'react'
import cx, {ClassValue} from 'clsx';

export type LobbyPlayerProps = {
  className?: ClassValue
  children?: React.ReactNode
  childElement?: React.JSX.Element
  style?: React.CSSProperties
  onClick?: React.MouseEventHandler<HTMLElement>
  // onClick?(event: React.MouseEvent<HTMLButtonElement>): void

  onChange?: React.FormEventHandler<HTMLInputElement>
  // onChange?(event: React.ChangeEvent<HTMLInputElement>): void
  // onChange?: React.ChangeEventHandler<HTMLInputElement>
}; //& React.ComponentPropsWithoutRef<"button">

export const defaultLobbyPlayerProps: Partial<LobbyPlayerProps> = {

};


export default LobbyPlayer;
export function LobbyPlayer(props: LobbyPlayerProps = defaultLobbyPlayerProps) {
  const {className, onClick, children} = props;

  return (
    <div className={cx(className)}>
      <h1 tabIndex={0} className='underline' onClick={onClick}>LobbyPlayer</h1>
      {children}
    </div>
  )
};
