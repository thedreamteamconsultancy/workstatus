import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyCcDImXrQZLTc529DwWMJdfXUUVWWXeN64",
  authDomain: "workstatus-d9c7b.firebaseapp.com",
  projectId: "workstatus-d9c7b",
  storageBucket: "workstatus-d9c7b.firebasestorage.app",
  messagingSenderId: "948085345438",
  appId: "1:948085345438:web:637faee9e4fe46273c7f8f",
  measurementId: "G-796WT325L5"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
