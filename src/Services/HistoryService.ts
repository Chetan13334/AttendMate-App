import { DB } from "../config/databaseConfig";
import { query, where, onSnapshot, getDocs, getDoc } from "firebase/firestore";


export const getInitials = (name: string) =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

export const getDuration = (checkIn: Date, checkOut: Date) => {
  const diffMs = checkOut.getTime() - checkIn.getTime();
  const hrs = Math.floor(diffMs / 3600000);
  const mins = Math.floor((diffMs % 3600000) / 60000);
  return `${hrs}h ${mins}m`;
};


export const fetchEmployeeId = async (email: string): Promise<string | null> => {
  try {
    const q = query(DB.collections.Employee_Details, where("Email", "==", email));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const emp = snapshot.docs[0].data();
      return emp.EmployeeID || null;
    }
    return null;
  } catch (err) {

    return null;
  }
};


export const subscribeToTodayRecord = (
  employeeId: string,
  onUpdate: (data: { checkIn: Date | null; checkOut: Date | null }) => void,
  onDelete: () => void
) => {
  const today = new Date();
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(today.getDate()).padStart(2, "0")}`;

  const todayRef = DB.employeeRecord(todayKey, employeeId);

  const unsubscribe = onSnapshot(todayRef, (snap) => {
    if (!snap.exists()) return onDelete();
    const data = snap.data();
    onUpdate({
      checkIn: data.CheckIn ? data.CheckIn.toDate() : null,
      checkOut: data.CheckOut ? data.CheckOut.toDate() : null,
    });
  });

  return unsubscribe;
};


export const fetchPastRecords = async (
  employeeId: string,
  startDate: Date,
  endDate: Date
): Promise<any[]> => {
  const allRecords: any[] = [];
  try {

    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);



    const current = new Date(start.getTime());




    let iteration = 0;
    while (current <= end) {
      iteration++;
      const dateKey = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(
        2,
        "0"
      )}-${String(current.getDate()).padStart(2, "0")}`;




      const currentDateOnly = new Date(current.getFullYear(), current.getMonth(), current.getDate());
      const endDateOnly = new Date(end.getFullYear(), end.getMonth(), end.getDate());

      const recordRef = DB.employeeRecord(dateKey, employeeId);
      const snap = await getDoc(recordRef);

      if (snap.exists()) {
        const data = snap.data();
        const checkIn = data.CheckIn ? data.CheckIn.toDate() : null;
        const checkOut = data.CheckOut ? data.CheckOut.toDate() : null;

        const recordDate = new Date(current.getTime());


        allRecords.push({
          date: recordDate,
          checkIn: checkIn
            ? checkIn.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            : "Not marked",
          checkOut: checkOut
            ? checkOut.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            : "Not marked",
          duration: checkIn && checkOut ? getDuration(checkIn, checkOut) : "N/A",
          checkInTime: checkIn,
          checkOutTime: checkOut,
        });
      } else {

      }


      current.setDate(current.getDate() + 1);
      current.setHours(0, 0, 0, 0);

    }


    allRecords.forEach((record, index) => {

    });


    return allRecords.sort((a, b) => b.date.getTime() - a.date.getTime());
  } catch (err) {

    return [];
  }
};