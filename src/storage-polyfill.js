import { doc, getDoc, setDoc } from "firebase/firestore";
import { db, auth } from "./firebase";

function personalRef(key) {
  const uid = auth.currentUser ? auth.currentUser.uid : "anonymous";
  return doc(db, "users", uid, "storage", key);
}

function sharedRef(key) {
  return doc(db, "shared_storage", key);
}

window.storage = {
  async get(key, shared) {
    try {
      const ref = shared ? sharedRef(key) : personalRef(key);
      const snap = await getDoc(ref);
      if (!snap.exists()) return null;
      return { key, value: snap.data().value, shared: !!shared };
    } catch (e) {
      return null;
    }
  },

  async set(key, value, shared) {
    try {
      const ref = shared ? sharedRef(key) : personalRef(key);
      await setDoc(ref, { value });
      return { key, value, shared: !!shared };
    } catch (e) {
      return null;
    }
  },
};
