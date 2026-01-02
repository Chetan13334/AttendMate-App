const API_URL = import.meta.env.VITE_API_URL || "https://attendmate-backend.onrender.com/api";

const getToken = () => localStorage.getItem("employeeToken");

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

// Fetch EmployeeID from LocalStorage (API approach)
export const fetchEmployeeId = async (email?: string): Promise<string | null> => {
  const data = localStorage.getItem("employeeData");
  if (data) {
    try {
      const parsed = JSON.parse(data);
      return parsed.employeeId || parsed.id || null;
    } catch {
      return null;
    }
  }
  return null;
};

// Fetch History Range from API
export const fetchPastRecords = async (
  employeeId: string,
  startDate: Date,
  endDate: Date
): Promise<any[]> => {
  const token = getToken();
  if (!token) throw new Error("Not authorized");

  try {
    const startStr = startDate.toISOString().split('T')[0];
    const endStr = endDate.toISOString().split('T')[0];

    // Assuming backend accepts these query params
    const res = await fetch(`${API_URL}/attendance?startDate=${startStr}&endDate=${endStr}`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    if (!res.ok) {
      console.error("Failed to fetch history");
      return [];
    }

    const data = await res.json(); // Expecting array of objects

    // Map Backend Response to UI Structure
    // Backend likely returns: { date, checkInTime, checkOutTime, ... } 
    // We need to parse dates

    return data.map((record: any) => {
      const checkIn = record.checkInTime ? new Date(record.checkInTime) : null;
      const checkOut = record.checkOutTime ? new Date(record.checkOutTime) : null;
      const dateVal = record.date ? new Date(record.date) : new Date();

      return {
        date: dateVal,
        checkIn: checkIn ? checkIn.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Not marked",
        checkOut: checkOut ? checkOut.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Not marked",
        duration: checkIn && checkOut ? getDuration(checkIn, checkOut) : "N/A",
        checkInTime: checkIn,
        checkOutTime: checkOut
      };
    }).sort((a: any, b: any) => b.date.getTime() - a.date.getTime());

  } catch (err) {
    console.error("Error fetching history:", err);
    return [];
  }
};