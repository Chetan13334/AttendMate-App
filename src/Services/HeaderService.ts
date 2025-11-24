import { db } from "../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

export const fetchHeaderUserData = async (email: string) => {
  try {
    const q = query(
      collection(db, "Employee_Details"),
      where("Email", "==", email)
    );

    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      const data = snapshot.docs[0].data();
      return {
        photo: data.Photo || null,
        name: data.Name || null
      };
    }

    return { photo: null, name: null };
  } catch (err) {
    return { photo: null, name: null };
  }
};
