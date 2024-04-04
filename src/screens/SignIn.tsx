import { useEffect, useState } from 'react';
import { Head } from '~/components/Head';
import cx from 'clsx';
import { useAuthSignInAnonymously, useAuthUser } from '@react-query-firebase/auth';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '~/lib/firebase';





export function SigninScreen() {
  const auth = useAuth()
  const anonMut = useAuthSignInAnonymously(auth);
  const user = useAuthUser(['user'], auth)
  const navigate = useNavigate()
  const location = useLocation(); // <-- get current location being accessed

  useEffect(() => {
    console.log(user.status, user.data)
  }, [user.status])
  
  useEffect(() => {
    if (anonMut.isSuccess && user.data) {
      console.log('anunmut success', user.data, location.state)
      navigate(location.state?.from || "/", {replace:true})
    }

  }, [anonMut.status, user.status])


  return (
    <main className='w-full lg:w-4/12 px-4 mx-auto pt-6'>
      <Head title="Signin" />
      <div className="relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded-lg bg-gray-200 border-0">
        <div className="rounded-t mb-0 px-6 py-6">
          <div className="text-center mb-3">
            <h6 className="text-gray-500 text-sm font-bold">Sign in anon</h6>
          </div>
          <div className="btn-wrapper text-center">
            <button className='btn btn-lg' disabled={anonMut.isLoading} onClick={() => anonMut.mutate()}>
              Sign in anon
            </button>
          </div>
          <hr className="mt-6 border-b-1 border-gray-300" />
        </div>
        <div className="flex-auto px-4 lg:px-10 py-10 pt-0">
          <div className="text-gray-400 text-center mb-3 font-bold">
            <small>Sign in with credentials</small>
          </div>
          <form>
            <div className="relative w-full mb-3">
              <label
                className="block uppercase text-gray-600 text-xs font-bold mb-2"
                htmlFor="grid-password"
              >
                Email
              </label>
              <input
                type="email"
                className="border-0 px-3 py-3 placeholder-gray-300 text-gray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                placeholder="Email"
              />
            </div>
            <div className="relative w-full mb-3">
              <label
                className="block uppercase text-gray-600 text-xs font-bold mb-2"
                htmlFor="grid-password"
              >
                Password
              </label>
              <input
                type="password"
                className="border-0 px-3 py-3 placeholder-gray-300 text-gray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                placeholder="Password"
              />
            </div>
            <div>
              <label className="inline-flex items-center cursor-pointer">
                <input
                  id="customCheckLogin"
                  type="checkbox"
                  className="form-checkbox border-0 rounded text-gray-700 ml-1 w-5 h-5 ease-linear transition-all duration-150"
                />
                <span className="ml-2 text-sm font-semibold text-gray-600">
                  Remember me
                </span>
              </label>
            </div>
            <div className="text-center mt-6">
              <button
                className="bg-gray-800 text-white active:bg-gray-600 text-sm font-bold uppercase px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 w-full ease-linear transition-all duration-150"
                type="button"
              >
                {" "}
                Sign In{" "}
              </button>
            </div>
          </form>
        </div>
      </div>

    </main>
  );
}

export default SigninScreen;

