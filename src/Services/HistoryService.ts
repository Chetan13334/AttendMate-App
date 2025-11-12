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
    console.error("Error fetching EmployeeID:", err);
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

    console.log("=== FETCHING RECORDS ===");
    console.log("Requested date range:", start.toISOString(), "to", end.toISOString());
    console.log("Start time:", start.getTime(), "End time:", end.getTime());
    console.log("Start date values - Year:", start.getFullYear(), "Month:", start.getMonth(), "Date:", start.getDate());
    console.log("End date values - Year:", end.getFullYear(), "Month:", end.getMonth(), "Date:", end.getDate());

    const current = new Date(start.getTime());
    console.log("Initial current date:", current.toISOString());
    console.log("Initial current date values - Year:", current.getFullYear(), "Month:", current.getMonth(), "Date:", current.getDate());

    // Log the comparison that's causing the issue
    console.log("=== DATE COMPARISON DEBUG ===");
    console.log("Start date as date object:", new Date(start.getFullYear(), start.getMonth(), start.getDate()).toISOString());
    console.log("End date as date object:", new Date(end.getFullYear(), end.getMonth(), end.getDate()).toISOString());
    
    let iteration = 0;
    while (current <= end) {
      iteration++;
      const dateKey = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(
        2,
        "0"
      )}-${String(current.getDate()).padStart(2, "0")}`;

      console.log(`Iteration ${iteration}:`);
      console.log(`  DateKey:`, dateKey);
      console.log(`  Current date:`, current.toISOString());
      console.log(`  Current values - Year:`, current.getFullYear(), "Month:", current.getMonth(), "Date:", current.getDate());
      console.log(`  Current time:`, current.getTime());
      console.log(`  End time:`, end.getTime());
      console.log(`  Current <= End:`, current.getTime() <= end.getTime());
      
      
      const currentDateOnly = new Date(current.getFullYear(), current.getMonth(), current.getDate());
      const endDateOnly = new Date(end.getFullYear(), end.getMonth(), end.getDate());
      console.log(`  Current date only:`, currentDateOnly.toISOString());
      console.log(`  End date only:`, endDateOnly.toISOString());
      console.log(`  Current date <= End date:`, currentDateOnly <= endDateOnly);

      const recordRef = DB.employeeRecord(dateKey, employeeId);
      const snap = await getDoc(recordRef);

      if (snap.exists()) {
        const data = snap.data();
        const checkIn = data.CheckIn ? data.CheckIn.toDate() : null;
        const checkOut = data.CheckOut ? data.CheckOut.toDate() : null;

        const recordDate = new Date(current.getTime());
        console.log("  Found record for date:", recordDate.toISOString());

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
      } else {
        console.log(`  No record found for dateKey:`, dateKey);
      }


      current.setDate(current.getDate() + 1);
      current.setHours(0, 0, 0, 0);
      console.log(`  Next date will be:`, current.toISOString());
      console.log(`  Next date values - Year:`, current.getFullYear(), "Month:", current.getMonth(), "Date:", current.getDate());
    }

    console.log("=== FETCH COMPLETE ===");
    console.log("Total records found:", allRecords.length);
    allRecords.forEach((record, index) => {
      console.log(`Record ${index}:`, record.date.toISOString());
    });

   
    return allRecords.sort((a, b) => b.date.getTime() - a.date.getTime());
  } catch (err) {
    console.error("Error fetching past records:", err);
    return [];
  }
};
