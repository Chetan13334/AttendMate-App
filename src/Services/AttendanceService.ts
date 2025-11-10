// src/services/attendanceService.ts
import { db } from '../firebase';
import {
  doc,
  setDoc,
  collection,
  query,
  getDocs,
  where,
  Timestamp,
  onSnapshot,
  getDoc,
} from 'firebase/firestore';

export const fetchEmployeeId = async (email: string) => {
  const q = query(collection(db, 'Employee_Details'), where('Email', '==', email));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;

  const empData = snapshot.docs[0].data();
  return (empData as any).EmployeeID;
};

export const fetchTodayRecord = async (today: string, empId: string) => {
  const recordRef = doc(db, 'Employee_CheckIn_CheckOut', today, 'employee_records', empId);
  const record = await getDoc(recordRef);
  return record.exists() ? record.data() : null;
};

export const saveCheckIn = async (today: string, empId: string, inside: boolean) => {
  const now = new Date();
  await setDoc(
    doc(db, 'Employee_CheckIn_CheckOut', today, 'employee_records', empId),
    { CheckIn: Timestamp.fromDate(now), LocationValid: inside },
    { merge: true }
  );
  return now;
};

export const saveCheckOut = async (today: string, empId: string, inside: boolean) => {
  const now = new Date();
  await setDoc(
    doc(db, 'Employee_CheckIn_CheckOut', today, 'employee_records', empId),
    { CheckOut: Timestamp.fromDate(now), LocationValid: inside },
    { merge: true }
  );
  return now;
};

export const listenToAttendance = (today: string, empId: string, callback: Function) => {
  const docRef = doc(db, 'Employee_CheckIn_CheckOut', today, 'employee_records', empId);
  return onSnapshot(docRef, (snapshot) => {
    callback(snapshot.exists() ? snapshot.data() : null);
  });
};
