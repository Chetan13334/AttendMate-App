import { db } from "../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

export const fetchUserProfile = async (email: string) => {
  try {
    const q = query(
      collection(db, "Employee_Details"),
      where("Email", "==", email)
    );

    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      return snapshot.docs[0].data();
    }

    return null;
  } catch (error) {
    
    return null;
  }
};
