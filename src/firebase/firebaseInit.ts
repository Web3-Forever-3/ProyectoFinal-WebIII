import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  UserCredential,
} from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage"; // Importar métodos de Storage
import firebaseConfig from "./firebaseConfig";

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Exportar funciones de Firebase
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app); // Inicializar Storage
export const googleAuthProvider = new GoogleAuthProvider();

// Funciones adicionales para la autenticación y Firestore

// Registrar un nuevo usuario con email y contraseña
export const registerWithEmailPassword = async (
  email: string,
  password: string
) => {
  return createUserWithEmailAndPassword(auth, email, password);
};

// Inicio de sesión con Google
export const googleSignIn = async (): Promise<
  UserCredential & { additionalUserInfo?: { isNewUser: boolean } }
> => {
  const result = await signInWithPopup(auth, googleAuthProvider);
  return result; // Ahora TypeScript sabe que el resultado puede tener `additionalUserInfo`
};

// Guardar datos del usuario en Firestore
export const saveUserData = async (userId: string, userData: object) => {
  await setDoc(doc(db, "usuarios", userId), userData);
};

// Subir archivo a Firebase Storage
export const uploadFileToStorage = async (
  file: File,
  userId: string,
  fileName: string
): Promise<string> => {
  const storageRef = ref(storage, `usuarios/${userId}/${fileName}`);
  await uploadBytes(storageRef, file); // Subir archivo
  const fileURL = await getDownloadURL(storageRef); // Obtener URL pública
  return fileURL; // Devolver la URL del archivo
};
