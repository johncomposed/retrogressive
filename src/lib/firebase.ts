import { FirebaseApp, initializeApp } from 'firebase/app';
import { getAuth, Auth, connectAuthEmulator } from 'firebase/auth';
import { connectFirestoreEmulator, getFirestore } from "firebase/firestore";
// import { connectStorageEmulator, getStorage } from "firebase/storage";
import { connectDatabaseEmulator, getDatabase } from 'firebase/database';
import { connectFunctionsEmulator, getFunctions } from "firebase/functions";



let firebaseApp: FirebaseApp;
export const useEmulator = () => (import.meta.env.VITE_USE_FIREBASE_EMULATOR || '').trim().toLowerCase() === 'true';

export const setupFirebase = () => {
  try {
    const env = import.meta.env;
    const firebaseConfig = {
      apiKey: env.VITE_FIREBASE_APIKEY,
      authDomain: env.VITE_FIREBASE_AUTHDOMAIN,
      databaseURL: env.VITE_FIREBASE_DATABASEURL,
      projectId: env.VITE_FIREBASE_PROJECTID,
      storageBucket: env.VITE_FIREBASE_STORAGEBUCKET,
      messagingSenderId: env.VITE_FIREBASE_MESSAGINGSENDERID,
      appId: env.VITE_FIREBASE_APPID,
    }

    firebaseApp = initializeApp(firebaseConfig.projectId.startsWith('demo-') ? 
      Object.keys(firebaseConfig).reduce((prev, k) => {
        prev[k] = k === 'projectId' ? firebaseConfig[k] : 'example_dummy_apikey';
        return prev;
      }, {}) : 
      firebaseConfig
    );
  } catch (error) {
    console.error({error})
    return false;
  }

  return firebaseApp;
};

export const defaultEmHost = 'localhost'
export const emulatorConfig = {
  "auth": {
    "host": "127.0.0.1",
    "port": 9099
  },
  "functions": {
    "port": 5001
  },
  "firestore": {
    "port": 8080
  },
  "database": {
    "port": 9000
  },
  "hosting": {
    "port": 5000
  },
}

let auth: Auth;
let firestore: ReturnType<typeof getFirestore>;
// let storage: ReturnType<typeof getStorage>;
let database: ReturnType<typeof getDatabase>
let functions: ReturnType<typeof getFunctions>


export const useAuth = () => {

  if (!auth) {
    if (useEmulator()) {
      auth = getAuth(firebaseApp);
      connectAuthEmulator(auth, `http://${emulatorConfig.auth.host || defaultEmHost}:${emulatorConfig.auth.port}`, {disableWarnings: false});
    } else {
      auth = getAuth(firebaseApp);
    }
    
  }
  return auth;
};

export const useFirestore = () => {
  if (!firestore) {
    firestore = getFirestore();
    if (useEmulator()) {
      connectFirestoreEmulator(firestore, defaultEmHost, emulatorConfig.firestore.port);
    }
  }
  return firestore;
};

export const useFunctions = () => {
  if (!functions) {
    functions = getFunctions();
    if (useEmulator()) {
      connectFunctionsEmulator(functions, defaultEmHost, emulatorConfig.functions.port);
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
      connectDatabaseEmulator(database, defaultEmHost, emulatorConfig.database.port);
    }
  }
  return database;
};

