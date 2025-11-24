import {
  setDoc,
  query,
  getDocs,
  where,
  Timestamp,
  onSnapshot,
  getDoc,
} from "firebase/firestore";
import { DB } from "../config/databaseConfig";

export const fetchEmployeeId = async (email: string) => {
  const q = query(DB.collections.Employee_Details, where("Email", "==", email));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  const empData = snapshot.docs[0].data();
  return (empData as any).EmployeeID;
};

export const fetchTodayRecord = async (today: string, empId: string) => {
  const recordRef = DB.employeeRecord(today, empId);
  const record = await getDoc(recordRef);
  return record.exists() ? record.data() : null;
};

export const saveCheckIn = async (today: string, empId: string, inside: boolean) => {
  const now = new Date();
  await setDoc(
    DB.employeeRecord(today, empId),
    { CheckIn: Timestamp.fromDate(now), LocationValid: inside },
    { merge: true }
  );
  return now;
};

export const saveCheckOut = async (today: string, empId: string, inside: boolean) => {
  const now = new Date();
  await setDoc(
    DB.employeeRecord(today, empId),
    { CheckOut: Timestamp.fromDate(now), LocationValid: inside },
    { merge: true }
  );
  return now;
};

export const listenToAttendance = (today: string, empId: string, callback: Function) => {
  const docRef = DB.employeeRecord(today, empId);
  return onSnapshot(docRef, (snapshot) => {
    callback(snapshot.exists() ? snapshot.data() : null);
  });
};
