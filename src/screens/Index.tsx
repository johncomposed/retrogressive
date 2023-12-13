import { FormEventHandler, useRef, useState } from 'react';
import { Head } from '~/components/Head';
import ToggleComponent from '~/components/toggle';
import { useDatabase, useFunctions } from '~/lib/firebase';
import { ref } from "firebase/database";
import { useDatabaseSnapshot, useDatabaseSetMutation } from "@react-query-firebase/database";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import { useFunctionsCall } from '@react-query-firebase/functions'
import cx from 'clsx';

import {hello} from '~shared/hello'


interface FormElements extends HTMLFormControlsCollection {
  amount: HTMLInputElement
}

interface SmileyForm extends HTMLFormElement {
 readonly elements: FormElements
}

function MutationStatus({name="", mutation}: any) {
  return <div title={`${name} ${mutation.status}`} className={cx(`h-4 w-4 mx-2 rounded-full `, {
    'bg-purple-600': mutation.isIdle,
    'bg-blue-600': mutation.isLoading,
    'bg-green-600': mutation.isSuccess,
    'bg-red-600': mutation.isError,
    'bg-slate-500': mutation.isPaused
  })} />
}

export function Smiley() {
  const functions = useFunctions()
  const mutation = useFunctionsCall(functions, "helloWorld");

  console.log(mutation)

  // console.log(dbRef.parent)
 
  return (
    <div>
    <button className="flex flex-row items-center" onClick={() => mutation.mutate(undefined)}>
      <>
    Hello <MutationStatus name="hello" mutation={mutation}/> 
    </> </button>

    <div className='flex flex-row items-center'>
    </div>
    hi


    </div>
  )


}





function Index() {
  return (
    <main>
      <Head title="TOP PAGE" />
      <div className="hero min-h-screen">
        <div className="text-center hero-content">
          <div>
            <h1 className="text-3xl font-bold">
              Retrogressive
            </h1>
            <p className="mt-4 text-lg">
              A curious game. {hello()}
            </p>
            <Smiley />
            <ToggleComponent />
            <ReactQueryDevtools position="bottom-right" panelPosition="right" />

          </div>
        </div>
      </div>
    </main>
  );
}

export default Index;

/**
 * 
 * @returns   const mutation = useFunctionsCall(functions, "helloWorld", {},   {
    onSuccess(...args) {
      console.log("hello updated...", ...args);
    },
    onError(error) {
      console.error("Failed to say hello...", error);
    },
    onMutate(variables) {
      console.log("Updating hello with variables?", variables);
    },
  });










function Smiley() {
  const database = useDatabase()
  const functions = useFunctions()
  // const mutationSmile = useFunctionsCall(functions, "smileyGenerator");
  const mutation = useFunctionsCall(functions, "helloWorld");
  const dbRef = ref(database, `/smile/default/count`);

  // const dbRef = ref(database, `/smile/default/count`);
  const smiles = useDatabaseSnapshot(["smiles", "defau"], dbRef.parent!, {
    subscribe: true,
  });
  const mutationSmile = useDatabaseSetMutation(dbRef);


  const onSubmit:FormEventHandler<SmileyForm> = (e) => {
    e.preventDefault();
    mutationSmile.mutate(e.currentTarget.elements.amount.value)
  }


  console.log(mutation)

  // console.log(dbRef.parent)
 
  return (
    <div>
    <button className="flex flex-row items-center" onClick={() => mutation.mutate(undefined)}><>Hello <MutationStatus name="hello" mutation={mutation}/> </> </button>

    <div className='flex flex-row items-center'>
      <MutationStatus name="smiles" mutation={smiles}/>
      <h2>Smileys</h2> <MutationStatus name="smileMuta" mutation={mutationSmile}/>
      <form onSubmit={onSubmit}><input disabled={mutationSmile.isLoading} name="amount" type="number" placeholder="how many?" /></form>
    </div>
    hi
    {smiles.isLoading && 'loading'}
    {smiles.data && JSON.stringify(smiles.data.val(), null, 2)}
    {mutationSmile.isError && <pre>{mutationSmile.error.message}</pre>}

    </div>
  )


}


 */
