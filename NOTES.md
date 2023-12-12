Now that all the emulators are built I should run:

`npm run build:watch` - Note the functions shell needs to reload to get the new built changes.
`firebase emulators:start`
`firebase functions:shell`

`smileyGenerator(4, {params: {"smileyId":"wow"}})`
`addmessage.get('hi?text=helloworld')` - uses the node requests api. Also has potential to be usable via those express wrappers i've written over the years for errors and stuff.


https://firebase.google.com/docs/functions/local-shell

See also https://medium.com/@moki298/test-your-firebase-cloud-functions-locally-using-cloud-functions-shell-32c821f8a5ce


```
runGame({data: {id: '2', context: {players: ['a', 'b'], cardsPerPlayer:3}, event: {type: 'START_GAME'}}}) 



```


Note on persistance: xstate 5 has a whole other setup for it. https://stately.ai/docs/persistence. Which doesn't have the context or anything but generally seems to make stuff easier. TODO on update to xstate5 

```
npm run dev
npm run emulate
cd functions && npm run build:watch
```