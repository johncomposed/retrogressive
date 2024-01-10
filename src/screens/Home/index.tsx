import React, {useState} from 'react'
import cx, {ClassValue} from 'clsx';



export function ListActiveGames({uid}) {

}


export function Signin() {

}



export function JoinGameButton({onSubmit}) {
  const [inputOpen, setInputOpen] = useState(false)
  const [inputText, setInputText] = useState("")


  return (
    <div>
        <form onSubmit={onSubmit}>
          <input name="gameId" type="text"  />

        </form>
        <button onClick={() => setInputOpen(true)} className={cx(
          "btn btn-lg btn-wide btn-primary ",
          "border-solid border-2 border-b-4 border-r-4 border-black",
          "hover:border-2 hover:border-solid hover:border-b-4 hover:border-r-4 hover:border-black",
          )}>Join a game</button>
    </div>
  )



} 



export default HomePage;
export function HomePage() {

  return (
    <div className={cx(
      "flex flex-col items-center justify-end",
      " h-screen mx-auto  p-10",
      // "container bg-tan80s-100"
    )}>
      <h1 className=" text-7xl font-bold mt-40 mb-10">
          Retrogressive
      </h1>
      <div className='flex flex-col items-center flex-grow'>

        <button className={cx(
          "btn btn-lg btn-wide btn-primary ",
          "border-solid border-2 border-b-4 border-r-4 border-black",
          "hover:border-2 hover:border-solid hover:border-b-4 hover:border-r-4 hover:border-black",
          )}>Join a game</button>



        <button className={cx(
          "btn btn-lg btn-wide btn-secondary ",
          "border-solid border-2 border-b-4 border-r-4 border-black",
          "my-4"
          )}>Create lobby</button>
      <button className={cx(
          "btn btn-lg btn-wide btn-accent ",
          "border-solid border-2 border-b-4 border-r-4 border-black",
          )}>Rules</button>
      </div>



      <div className={cx(
        "flex items-center justify-start",
        "mb-4 w-[500px] bg-white p-6 rounded-xl",
        "border-solid border-2 border-b-4 border-r-4 border-black"
        )}>
          <div className="avatar placeholder mr-4">
            <div className="bg-neutral text-neutral-content rounded-full w-24">
              <span className="text-3xl">❔</span>
            </div>
          </div> 
          <div>
            <h1 className="text-xl font-bold">Display name</h1>
            <h2>id: blahblahblah</h2>
          </div>
        </div>
    </div>
  )
};
