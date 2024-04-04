import { getFirestore } from "firebase-admin/firestore";
import { logger } from "firebase-functions/v1";
import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { onRequest, onCall } from "firebase-functions/v2/https";
import * as functions from "firebase-functions";

export const helloWorld = onRequest((request, response) => {
  logger.info("Hello logs!", {structuredData: true});
  // response.send({status: 'success', data:{ho:'whatever?'}})
  response.json({msg: "Hello from Firebase!", data: {hi: "?"}});
});

export const helloWorldCall = onCall((data) => {
  logger.info("Hello call!", {structuredData: true});
  return {msg: "Hello from Firebase!", data: {hi: "?"}}
});


export const addmessage = onRequest(async (req, res) => {
  logger.info("msg: ", req.query, req.method, req.params, req.path, req.originalUrl, {structuredData: true});

  try {
    const original = req.query.text;
    // Push the new message into Firestore using the Firebase Admin SDK.
    const writeResult = await getFirestore()
        .collection("messages")
        .add({original: original});
    // Send back a message that we've successfully written the message
    res.json({result: `Message with ID: ${writeResult.id} added.`});

  } catch(e) {

    res.status(500).json({error: e})
  }

});

export const makeUppercase = onDocumentCreated("/messages/{documentId}", (event) => {
  if (!event.data) return;

  // Grab the current value of what was written to Firestore.
  const original = event.data.data().original;

  // Access the parameter `{documentId}` with `event.params`
  logger.log("Uppercasing", event.params.documentId, original);

  const uppercase = original.toUpperCase();

  // You must return a Promise when performing
  // asynchronous tasks inside a function
  // such as writing to Firestore.
  // Setting an 'uppercase' field in Firestore document returns a Promise.
  return event.data.ref.set({uppercase}, {merge: true});
})


export const smileyGenerator = functions.database.ref('/smile/{smileyId}/count').onCreate(async (snapshot, context) => {
  let count = snapshot.val()
  let smiles = '😊';
  while (count > 1) {
     smiles = smiles + '😊'
     count--
  }

  const setResult = await snapshot.ref.parent!.child('smileys').set(smiles)

  return {data: smiles}
})


