/*
 * Copyright (c) 2016-present Invertase Limited & Contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this library except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

import {
  QueryKey,
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from "@tanstack/react-query";
import {
  Auth,
  AuthError,
  fetchSignInMethodsForEmail,
  UserCredential,
  getRedirectResult,
  PopupRedirectResolver,
  IdTokenResult,
  NextOrObserver, 
  User
} from "firebase/auth";

import { useSubscription } from "../utils/useSubscription";


export function useAuthFetchSignInMethodsForEmail(
  key: QueryKey,
  auth: Auth,
  email: string,
  useQueryOptions?: Omit<UseQueryOptions<string[], AuthError>, "queryFn">
): UseQueryResult<string[], AuthError> {
  return useQuery<string[], AuthError>({
    ...useQueryOptions,
    queryKey: useQueryOptions?.queryKey ?? key,
    async queryFn() {
      return fetchSignInMethodsForEmail(auth, email);
    },
  });
}

export function useAuthGetRedirectResult(
  key: QueryKey,
  auth: Auth,
  resolver?: PopupRedirectResolver,
  useQueryOptions?: Omit<
    UseQueryOptions<UserCredential | null, AuthError>,
    "queryFn"
  >
): UseQueryResult<UserCredential | null, AuthError> {
  return useQuery<UserCredential | null, AuthError>({
    ...useQueryOptions,
    queryKey: useQueryOptions?.queryKey ?? key,
    async queryFn() {
      return getRedirectResult(auth, resolver);
    },
  });
}

export function useAuthIdToken<R = { token: IdTokenResult }>(
  queryKey: QueryKey,
  auth: Auth,
  options: Omit<
    UseQueryOptions<{ token: IdTokenResult }, AuthError, R>,
    "queryFn"
  > = {}
): UseQueryResult<R, AuthError> {
  const subscribeFn = (
    callback: (data: { token: IdTokenResult } | null) => Promise<void>
  ) =>
    auth.onIdTokenChanged(async (data) => {
      const token = await data?.getIdTokenResult();

      return callback(token ? { token } : null);
    });

  return useSubscription<{ token: IdTokenResult }, AuthError, R>(
    queryKey,
    ["useAuthIdToken"],
    subscribeFn,
    options
  );
}

export function useAuthUser<R = User>(
  queryKey: QueryKey,
  auth: Auth,
  options: Omit<UseQueryOptions<User, AuthError, R>, "queryFn"> = {}
): UseQueryResult<R, AuthError> {
  const subscribeFn = (cb: NextOrObserver<User | null>) =>
    auth.onAuthStateChanged(cb);

  return useSubscription<User, AuthError, R>(
    queryKey,
    ["useAuthUser"],
    subscribeFn,
    options
  );
}
