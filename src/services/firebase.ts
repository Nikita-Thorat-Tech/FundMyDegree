import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCzKPOXJj6ABTS9ugn_drYARpuL8YjqWwU",
  authDomain: "fundmydegree.firebaseapp.com",
  projectId: "fundmydegree",
  storageBucket: "fundmydegree.firebasestorage.app",
  messagingSenderId: "160796111487",
  appId: "1:160796111487:web:856c14424cd5288dbcc54a"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = () => signInWithPopup(auth, googleProvider);

export const loginWithEmail = (email: string, password: string) =>
  signInWithEmailAndPassword(auth, email, password);

export const registerWithEmail = async (
  email: string,
  password: string,
  name: string
) => {
  const result = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(result.user, { displayName: name });
  return result;
};

export const logout = () => signOut(auth);