const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const getToken = (): string | null => localStorage.getItem("employeeToken");

const getEmployeeData = () => {
  const data = localStorage.getItem("employeeData");
  if (!data) return null;

  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
};

export const fetchEmployeeId = async (email: string): Promise<string | null> => {
  const employeeData = getEmployeeData();
  if (!employeeData) return null;

  return (
    employeeData.employeeId ||
    employeeData.EmployeeID ||
    employeeData.employee_id ||
    employeeData.id ||
    null
  );
};

export const fetchTodayRecord = async (today: string, empId: string) => {
  const token = getToken();
  if (!token) throw new Error("Not authorized");

  const url = `${API_URL}/attendance/${empId}?from=${today}&to=${today}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    if (response.status === 401) throw new Error("Not authorized");
    throw new Error("Failed to fetch record");
  }

  const responseData = await response.json();
  const records = Array.isArray(responseData) ? responseData : [];

  const todayRecord = records.find((r: any) => r.date === today);
  if (!todayRecord) return null;

  return {
    CheckIn: todayRecord.checkInTime
      ? { toDate: () => new Date(todayRecord.checkInTime) }
      : null,
    CheckOut: todayRecord.checkOutTime
      ? { toDate: () => new Date(todayRecord.checkOutTime) }
      : null,
    LocationValid: true,
  };
};

export const saveCheckIn = async (
  today: string,
  empId: string,
  inside: boolean
): Promise<Date> => {
  const token = getToken();
  if (!token) throw new Error("Not authorized");

  const now = new Date();
  const time = now.toTimeString().split(" ")[0];

  const response = await fetch(`${API_URL}/attendance/check-in`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      employeeId: empId,
      date: today,
      time,
    }),
  });

  if (!response.ok) {
    if (response.status === 401) throw new Error("Not authorized");
    throw new Error("Check-in failed");
  }

  return now;
};

export const saveCheckOut = async (
  today: string,
  empId: string,
  inside: boolean
): Promise<Date> => {
  const token = getToken();
  if (!token) throw new Error("Not authorized");

  const now = new Date();
  const time = now.toTimeString().split(" ")[0];

  const response = await fetch(`${API_URL}/attendance/check-out`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      employeeId: empId,
      date: today,
      time,
    }),
  });

  if (!response.ok) {
    if (response.status === 401) throw new Error("Not authorized");
    throw new Error("Check-out failed");
  }

  return now;
};

export const listenToAttendance = (
  today: string,
  empId: string,
  callback: Function
) => {
  let isCancelled = false;

  const fetchAndUpdate = async () => {
    if (isCancelled) return;
    try {
      const data = await fetchTodayRecord(today, empId);
      callback(data);
    } catch {}
  };

  fetchAndUpdate();
  const intervalId = setInterval(fetchAndUpdate, 30000);

  return () => {
    isCancelled = true;
    clearInterval(intervalId);
  };
};
