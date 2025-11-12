import { DB } from "../config/databaseConfig";
import { query, where, onSnapshot, getDocs, getDoc } from "firebase/firestore";

/* ---------------- Utility ---------------- */
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

/* ---------------- Fetch Employee ID ---------------- */
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
    console.error("Error fetching EmployeeID:", err);
    return null;
  }
};

/* ---------------- Subscribe to Today's Record ---------------- */
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

/* ---------------- Fetch Past Records (timezone-safe) ---------------- */
export const fetchPastRecords = async (
  employeeId: string,
  startDate: Date,
  endDate: Date
): Promise<any[]> => {
  const allRecords: any[] = [];
  try {
    // ✅ Normalize to LOCAL midnight (not UTC)
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999); // include entire end day

    console.log("=== FETCHING RECORDS ===");
    console.log("Requested date range:", start.toISOString(), "to", end.toISOString());
    console.log("Start time:", start.getTime(), "End time:", end.getTime());

    const current = new Date(start.getTime());
    console.log("Initial current date:", current.toISOString());

    let iteration = 0;
    while (current <= end) {
      iteration++;
      const dateKey = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(
        2,
        "0"
      )}-${String(current.getDate()).padStart(2, "0")}`;

      console.log(`Iteration ${iteration}: Checking dateKey:`, dateKey, "for date:", current.toISOString());
      console.log(`Iteration ${iteration}: Current time:`, current.getTime(), "End time:", end.getTime());
      console.log(`Iteration ${iteration}: Current <= End:`, current.getTime() <= end.getTime());

      const recordRef = DB.employeeRecord(dateKey, employeeId);
      const snap = await getDoc(recordRef);

      if (snap.exists()) {
        const data = snap.data();
        const checkIn = data.CheckIn ? data.CheckIn.toDate() : null;
        const checkOut = data.CheckOut ? data.CheckOut.toDate() : null;

        const recordDate = new Date(current.getTime());
        console.log("Found record for date:", recordDate.toISOString());

        allRecords.push({
          date: recordDate,
          checkIn: checkIn
            ? checkIn.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            : "Not marked",
          checkOut: checkOut
            ? checkOut.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            : "Not marked",
          duration: checkIn && checkOut ? getDuration(checkIn, checkOut) : "N/A",
        });
      }

      // move to next LOCAL day safely
      current.setDate(current.getDate() + 1);
      current.setHours(0, 0, 0, 0);
      console.log(`Iteration ${iteration}: Next date will be:`, current.toISOString());
    }

    console.log("=== FETCH COMPLETE ===");
    console.log("Total records found:", allRecords.length);
    allRecords.forEach((record, index) => {
      console.log(`Record ${index}:`, record.date.toISOString());
    });

    // Since we're already iterating through the correct date range,
    // no additional filtering is needed
    return allRecords.sort((a, b) => b.date.getTime() - a.date.getTime());
  } catch (err) {
    console.error("Error fetching past records:", err);
    return [];
  }
};
