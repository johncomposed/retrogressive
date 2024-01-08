import React, {useState} from 'react'
import cx, {ClassValue} from 'clsx';

export type LoadingProps = {
  className?: ClassValue
  absolute?: Boolean
  flex?: Boolean
  inline?: Boolean
}; 

export const defaultLoadingProps: LoadingProps = {
  className: 'loading-spinner loading-md',
  absolute: false,
  flex: false,
  inline: false,
};


export function Loading(props: LoadingProps = defaultLoadingProps) {
  const {className, absolute, flex, inline} = props;

  if (inline) return (
    <span className={cx('loading', className, {
      'absolute': absolute
    })} />
  );

  return (
    <div className={cx('w-full h-full text-center',  {
      'absolute': absolute,
      'flex items-center justify-center': flex
    })}>
      <span className={cx('loading', className)} />
    </div>
  )
};


