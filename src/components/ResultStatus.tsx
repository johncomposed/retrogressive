import * as React from 'react'
import { UseMutationResult, UseQueryResult } from "@tanstack/react-query"
import cx from 'clsx'

type StatusProps<T> = {
  name: string, 
  className?: string,
  res: T
} 

export function QueryStatus({ name = "", className = '', res }: StatusProps<UseQueryResult>) {
  return <div title={`${name} ${res.status}`} className={cx(`h-4 w-4 mx-2 inline-block rounded-full `, {
    'bg-pink-300': res.isInitialLoading,
    'bg-blue-600': res.isLoading,
    'bg-green-600': res.isSuccess,
    'bg-red-600': res.isError,
    'bg-slate-500': res.isPaused
  }, className)} />
}

export function MutationStatus({ name = "", res, className = '' }: StatusProps<UseMutationResult>) {
  return <div title={`${name} ${res.status}`} className={cx(`h-4 w-4 mx-2 inline-block rounded-full `, {
    'bg-purple-600': res.isIdle,
    'bg-blue-600': res.isLoading,
    'bg-green-600': res.isSuccess,
    'bg-red-600': res.isError,
    'bg-slate-500': res.isPaused
  }, className)} />
}



