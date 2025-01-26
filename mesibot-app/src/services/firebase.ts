import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../firebaseConfig";

export const uploadRecording = async (file: File) => {
  if (!file) {
    return null;
  }

  const storageRef = ref(storage, `intros/${file.name}`); // Create a reference
  const snapshot = await uploadBytes(storageRef, file); // Upload file
  const downloadURL = await getDownloadURL(snapshot.ref); // Get file URL

  console.log("✅ Uploaded file URL:", downloadURL);
  return downloadURL;
};
