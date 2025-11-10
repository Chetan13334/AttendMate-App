import { query, where, onSnapshot, getDocs, getDoc } from "firebase/firestore";
import { DB } from "../config/databaseConfig";


export const getInitials = (name: string): string =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

export const getDuration = (checkIn: Date, checkOut: Date): string => {
  const diffMs = checkOut.getTime() - checkIn.getTime();
  const hrs = Math.floor(diffMs / (1000 * 60 * 60));
  const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  return `${hrs}h ${mins}m`;
};

export const fetchEmployeeId = async (userEmail: string): Promise<string | null> => {
  try {
    const q = query(DB.collections.Employee_Details, where("Email", "==", userEmail));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const emp = snapshot.docs[0].data();
      return emp.EmployeeID;
    }
    return null;
  } catch (err) {
    console.error("Error fetching EmployeeID:", err);
    return null;
  }
};

export const subscribeToTodayRecord = (
  employeeId: string,
  onUpdate: (data: any) => void,
  onDelete?: () => void
) => {
  const today = new Date();
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(
    today.getDate()
  ).padStart(2, "0")}`;

  const todayRef = DB.employeeRecord(todayKey, employeeId);

  const unsub = onSnapshot(todayRef, (snap) => {
    if (!snap.exists()) {
      onDelete?.();
      return;
    }

    const data = snap.data();
    const checkIn = data.CheckIn ? data.CheckIn.toDate() : null;
    const checkOut = data.CheckOut ? data.CheckOut.toDate() : null;
    onUpdate({ checkIn, checkOut });
  });

  return unsub;
};

export const fetchPastRecords = async (
  employeeId: string,
  startDate: Date,
  endDate: Date
): Promise<any[]> => {
  const allRecords: any[] = [];
  try {
    const current = new Date(startDate);
    while (current <= endDate) {
      const dateKey = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(
        2,
        "0"
      )}-${String(current.getDate()).padStart(2, "0")}`;

      const recordRef = DB.employeeRecord(dateKey, employeeId);
      const snap = await getDoc(recordRef);

      if (snap.exists()) {
        const data = snap.data();
        const checkIn = data.CheckIn ? data.CheckIn.toDate() : null;
        const checkOut = data.CheckOut ? data.CheckOut.toDate() : null;

        allRecords.push({
          date: new Date(current),
          checkIn: checkIn
            ? checkIn.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            : "Not marked",
          checkOut: checkOut
            ? checkOut.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            : "Not marked",
          duration: checkIn && checkOut ? getDuration(checkIn, checkOut) : "N/A",
        });
      }

      current.setDate(current.getDate() + 1);
    }
    return allRecords.sort((a, b) => b.date.getTime() - a.date.getTime());
  } catch (err) {
    console.error("Error fetching past records:", err);
    return [];
  }
};
