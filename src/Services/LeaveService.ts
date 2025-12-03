import {
  query,
  where,
  getDocs,
  setDoc,
  getDoc,
  collection,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import DB from "../config/databaseConfig";

export const fetchEmployeeId = async (email: string) => {
  const q = query(DB.collections.Employee_Details, where("Email", "==", email));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  return snapshot.docs[0].data().EmployeeID;
};

export const submitLeaveRequest = async (data: any) => {
  try {
    if (!data.email) return { success: false };

    const empId = await fetchEmployeeId(data.email);
    if (!empId) return { success: false };

    const cleanStart = data.startDate ? data.startDate.split("T")[0] : "";
    const cleanEnd = data.endDate ? data.endDate.split("T")[0] : "";

    const dateKey = cleanStart;

    const totalDays =
      Math.round(
        (new Date(cleanEnd).getTime() - new Date(cleanStart).getTime()) /
        (1000 * 60 * 60 * 24)
      ) + 1;

    await setDoc(
      DB.Leave.LeaveByEmpAndDate(empId, dateKey),
      {
        EmployeeID: empId,
        email: data.email,
        leaveType: data.leaveType,
        startDate: cleanStart,
        endDate: cleanEnd,
        totalDays: totalDays,
        reason: data.reason || "",
        status: "pending",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    return { success: true };
  } catch {
    return { success: false };
  }
};

export const getMyLeaveRequests = async (email: string) => {
  const empId = await fetchEmployeeId(email);
  if (!empId) return [];

  const datesRef = collection(DB.db, "Leave-req", empId, "dates");
  const snapshot = await getDocs(datesRef);

  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const listenToMyLeaveRequests = async (email: string, callback: Function) => {
  const empId = await fetchEmployeeId(email);
  if (!empId) return () => { };

  const datesRef = collection(DB.db, "Leave-req", empId, "dates");

  return onSnapshot(datesRef, (snapshot) => {
    const list = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));
    callback(list);
  });
};
