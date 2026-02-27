// firebase.js
// ─────────────────────────────────────────────────────────────────────────────
// Firebase config uses environment variables set on Netlify.
// NEVER paste your real keys directly here.
// ─────────────────────────────────────────────────────────────────────────────

import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  deleteDoc,
  serverTimestamp,
  runTransaction,
  orderBy,
  onSnapshot,
} from "firebase/firestore";

// ── FIREBASE CONFIG (uses Netlify environment variables) ──────────────────────
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// ── INIT ──────────────────────────────────────────────────────────────────────
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);


// ══════════════════════════════════════════════════════════════════════════════
// AUTH SERVICES
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Register a new user with email + password.
 * Creates a Firestore profile doc and sends email verification.
 */
export async function registerUser(email, password, gamertag) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  const uid = cred.user.uid;

  // Send verification email
  await sendEmailVerification(cred.user);

  // Create Firestore profile
  await setDoc(doc(db, "users", uid), {
    uid,
    email,
    name: gamertag.toUpperCase(),
    role: "user",
    emailVerified: false,
    registrations: [],
    createdAt: serverTimestamp(),
  });

  return cred.user;
}

/**
 * Sign in an existing user.
 * Returns the Firestore user profile.
 */
export async function loginUser(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  const profile = await getUserProfile(cred.user.uid);
  return { firebaseUser: cred.user, profile };
}

/**
 * Sign out the current user.
 */
export async function logoutUser() {
  await signOut(auth);
}

/**
 * Subscribe to auth state changes.
 * Callback receives { firebaseUser, profile } or null when logged out.
 */
export function onAuthChange(callback) {
  return onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      const profile = await getUserProfile(firebaseUser.uid);
      callback({ firebaseUser, profile });
    } else {
      callback(null);
    }
  });
}


// ══════════════════════════════════════════════════════════════════════════════
// USER SERVICES
// ══════════════════════════════════════════════════════════════════════════════

/** Fetch a user's Firestore profile by UID */
export async function getUserProfile(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? snap.data() : null;
}

/** Fetch all users (admin only) */
export async function getAllUsers() {
  const snap = await getDocs(collection(db, "users"));
  return snap.docs.map(d => d.data());
}

/** Update a user's role */
export async function setUserRole(uid, role) {
  await updateDoc(doc(db, "users", uid), { role });
}

/** Delete a user profile (admin only) */
export async function deleteUserProfile(uid) {
  await deleteDoc(doc(db, "users", uid));
}


// ══════════════════════════════════════════════════════════════════════════════
// TOURNAMENT SERVICES
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Real-time listener for all tournaments.
 * Calls callback(tournaments[]) whenever data changes.
 */
export function subscribeTournaments(callback) {
  const q = query(collection(db, "tournaments"), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  });
}

/** Create a new tournament (admin only) */
export async function createTournament(data, adminUid) {
  const ref = await addDoc(collection(db, "tournaments"), {
    ...data,
    filled: 0,
    createdBy: adminUid,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

/** Update an existing tournament (admin only) */
export async function updateTournament(tournamentId, data) {
  await updateDoc(doc(db, "tournaments", tournamentId), data);
}

/** Delete a tournament and all its registrations (admin only) */
export async function deleteTournament(tournamentId) {
  const q = query(
    collection(db, "registrations"),
    where("tournamentId", "==", tournamentId)
  );
  const snap = await getDocs(q);
  const deletes = snap.docs.map(d => deleteDoc(d.ref));
  await Promise.all(deletes);
  await deleteDoc(doc(db, "tournaments", tournamentId));
}


// ══════════════════════════════════════════════════════════════════════════════
// REGISTRATION SERVICES
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Register a user for a tournament.
 * Uses a Firestore transaction to safely increment the filled count.
 */
export async function registerForTournament(tournamentId, user) {
  const tournamentRef = doc(db, "tournaments", tournamentId);
  const userRef = doc(db, "users", user.uid);

  // Check for existing registration
  const existing = await getDocs(query(
    collection(db, "registrations"),
    where("userId", "==", user.uid),
    where("tournamentId", "==", tournamentId)
  ));
  if (!existing.empty) throw new Error("Already registered for this tournament.");

  await runTransaction(db, async (tx) => {
    const tSnap = await tx.get(tournamentRef);
    if (!tSnap.exists()) throw new Error("Tournament not found.");

    const t = tSnap.data();
    if (t.filled >= t.slots) throw new Error("Tournament is full.");
    if (t.status !== "open" && t.status !== "upcoming") {
      throw new Error("Registration is not open for this tournament.");
    }

    tx.update(tournamentRef, { filled: t.filled + 1 });

    const uSnap = await tx.get(userRef);
    const currentRegs = uSnap.data()?.registrations || [];
    tx.update(userRef, { registrations: [...currentRegs, tournamentId] });
  });

  await addDoc(collection(db, "registrations"), {
    userId: user.uid,
    userEmail: user.email,
    userName: user.name,
    tournamentId,
    registeredAt: serverTimestamp(),
    status: "confirmed",
  });
}

/**
 * Cancel a user's registration for a tournament.
 */
export async function cancelRegistration(tournamentId, userId) {
  const tournamentRef = doc(db, "tournaments", tournamentId);
  const userRef = doc(db, "users", userId);

  const q = query(
    collection(db, "registrations"),
    where("userId", "==", userId),
    where("tournamentId", "==", tournamentId)
  );
  const snap = await getDocs(q);
  if (snap.empty) throw new Error("Registration not found.");

  await runTransaction(db, async (tx) => {
    const tSnap = await tx.get(tournamentRef);
    const t = tSnap.data();
    tx.update(tournamentRef, { filled: Math.max(0, t.filled - 1) });

    const uSnap = await tx.get(userRef);
    const regs = (uSnap.data()?.registrations || []).filter(id => id !== tournamentId);
    tx.update(userRef, { registrations: regs });
  });

  await deleteDoc(snap.docs[0].ref);
}

/**
 * Get all registrations for a tournament (admin view).
 */
export async function getTournamentRegistrations(tournamentId) {
  const q = query(
    collection(db, "registrations"),
    where("tournamentId", "==", tournamentId),
    orderBy("registeredAt", "asc")
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

/**
 * Get all tournaments a user is registered for.
 */
export async function getUserRegistrations(userId) {
  const q = query(
    collection(db, "registrations"),
    where("userId", "==", userId),
    orderBy("registeredAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}
