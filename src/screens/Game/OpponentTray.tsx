import React, {useState} from 'react'
import cx, {ClassValue} from 'clsx';

export type OpponentTrayProps = {
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

export const defaultOpponentTrayProps: Partial<OpponentTrayProps> = {

};


export default OpponentTray;
export function OpponentTray(props: OpponentTrayProps = defaultOpponentTrayProps) {
  const {className, onClick, children} = props;

  return (
    <div className={cx(className)}>
      <h1 tabIndex={0} className='underline' onClick={onClick}>OpponentTray</h1>
      {children}
    </div>
  )
};
