// Misc type helpers
export type WithoutFn<T> = {
  [K in keyof T]: T[K] extends Function ? never : K
}[keyof T];

export type PropsWithoutFn<T> = Pick<T, WithoutFn<T>>;

export type ArrToMap<T extends Array<{ [key: string]: any }>> = T extends Array<infer U> ? {
  [K in keyof U]: U[K][]
} : never;


export type Serializable<T> = PropsWithoutFn<T> & {
  [P in keyof PropsWithoutFn<T>]: T[P] extends object ? Serializable<T[P]> : T[P];
};


