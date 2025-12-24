import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut, 
  onAuthStateChanged,
  User,
  GoogleAuthProvider,
  signInWithPopup
} from "firebase/auth";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  updateDoc, 
  addDoc,
  deleteDoc,
  serverTimestamp,
  increment
} from "firebase/firestore";
import { Catalog } from "../types";

const firebaseConfig = {
  apiKey: "AIzaSyCu4pTY3ujtqeaiKHsy4Wt7SNVa2YPXt80",
  authDomain: "showcase-33628.firebaseapp.com",
  projectId: "showcase-33628",
  storageBucket: "showcase-33628.firebasestorage.app",
  messagingSenderId: "823140050392",
  appId: "1:823140050392:web:bd801392d993cbda65fead"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

const googleProvider = new GoogleAuthProvider();

export const signUpWithEmail = async (email: string, password: string, businessName: string, businessType: string, phone: string) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  await setDoc(doc(db, "businesses", userCredential.user.uid), {
    businessName, businessType, phone, email, createdAt: serverTimestamp(), plan: "free"
  });
  return { success: true, user: userCredential.user };
};

export const signInWithEmail = async (email: string, password: string) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return { success: true, user: userCredential.user };
};

export const signInWithGoogle = async () => {
  const result = await signInWithPopup(auth, googleProvider);
  const user = result.user;
  const docRef = doc(db, 'businesses', user.uid);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) {
    await setDoc(docRef, { businessName: user.displayName || "My Business", email: user.email, createdAt: serverTimestamp(), plan: "free" });
  }
  return user;
};

export const signOut = () => firebaseSignOut(auth);
export const subscribeToAuth = (callback: (user: User | null) => void) => onAuthStateChanged(auth, callback);

export const createCatalog = async (userId: string, catalogData: Omit<Catalog, 'id'>) => {
  const catalogRef = collection(db, 'catalogs');
  const docRef = await addDoc(catalogRef, { ...catalogData, userId, createdAt: Date.now(), lastUpdated: Date.now() });
  return docRef.id;
};

export const getCatalogs = async (userId: string) => {
  const q = query(collection(db, 'catalogs'), where('userId', '==', userId));
  const snap = await getDocs(q);
  return snap.docs.map(doc => ({ ...doc.data(), id: doc.id } as Catalog));
};

export const getCatalogById = async (id: string): Promise<Catalog | null> => {
  const docSnap = await getDoc(doc(db, 'catalogs', id));
  return docSnap.exists() ? { ...docSnap.data(), id: docSnap.id } as Catalog : null;
};

export const getCatalogBySlug = async (slug: string): Promise<Catalog | null> => {
  const q = query(collection(db, 'catalogs'), where('slug', '==', slug), where('isActive', '==', true));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return { ...snap.docs[0].data(), id: snap.docs[0].id } as Catalog;
};

export const updateCatalog = async (catalogId: string, data: Partial<Catalog>) => {
  const catalogRef = doc(db, 'catalogs', catalogId);
  await updateDoc(catalogRef, { ...data, lastUpdated: Date.now() });
};

export const trackEngagement = async (catalogId: string, eventType: string) => {
  const catalogRef = doc(db, 'catalogs', catalogId);
  await updateDoc(catalogRef, { [`engagementStats.${eventType}`]: increment(1) });
};

export const deleteCatalogData = async (catalogId: string) => {
  await deleteDoc(doc(db, 'catalogs', catalogId));
};