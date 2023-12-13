import { FirebaseApp, initializeApp } from 'firebase/app';
import { getAuth, Auth, connectAuthEmulator } from 'firebase/auth';
import { connectFirestoreEmulator, getFirestore } from "firebase/firestore";
// import { connectStorageEmulator, getStorage } from "firebase/storage";
import { connectDatabaseEmulator, getDatabase } from 'firebase/database';
import { connectFunctionsEmulator, getFunctions } from "firebase/functions";



let firebaseApp: FirebaseApp;
const useEmulator = () => import.meta.env.VITE_USE_FIREBASE_EMULATOR;

export const setupFirebase = () => {
  try {
    firebaseApp = initializeApp({
      apiKey: import.meta.env.VITE_FIREBASE_APIKEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTHDOMAIN,
      databaseURL: import.meta.env.VITE_FIREBASE_DATABASEURL,
      projectId: import.meta.env.VITE_FIREBASE_PROJECTID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGEBUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGINGSENDERID,
      appId: import.meta.env.VITE_FIREBASE_APPID,
    });
  } catch (error) {
    console.error({error})
    return false;
  }

  return firebaseApp;
};

let auth: Auth;
let firestore: ReturnType<typeof getFirestore>;
// let storage: ReturnType<typeof getStorage>;
let database: ReturnType<typeof getDatabase>
let functions: ReturnType<typeof getFunctions>

export const useAuth = () => {
  auth = getAuth(firebaseApp);
  if (useEmulator()) {
    connectAuthEmulator(auth, 'http://localhost:9099');
  }
  return auth;
};

export const useFirestore = () => {
  if (!firestore) {
    firestore = getFirestore();
    if (useEmulator()) {
      connectFirestoreEmulator(firestore, 'localhost', 8080);
    }
  }
  return firestore;
};

export const useFunctions = () => {
  if (!functions) {
    functions = getFunctions();
    if (useEmulator()) {
      connectFunctionsEmulator(functions, 'localhost', 5001);
    }
  }
  return functions;
};

// export const useStorage = () => {
//   if (!storage) {
//     storage = getStorage();
//     if (useEmulator()) {
//       connectStorageEmulator(storage, 'localhost', 9199);
//     }
//   }
//   return storage;
// };

export const useDatabase = () => {
  if (!database) {
    database = getDatabase();
    if (useEmulator()) {
      connectDatabaseEmulator(database, 'localhost', 9000);
    }
  }
  return database;
};


