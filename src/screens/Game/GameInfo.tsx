import React, {useState} from 'react'
import cx, {ClassValue} from 'clsx';

export type GameInfoProps = {
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

export const defaultGameInfoProps: Partial<GameInfoProps> = {

};


export default GameInfo;
export function GameInfo(props: GameInfoProps = defaultGameInfoProps) {
  const {className, onClick, children} = props;

  return (
    <div className={cx(className)}>
      <h1 tabIndex={0} className='underline' onClick={onClick}>GameInfo</h1>
      {children}
    </div>
  )
};
