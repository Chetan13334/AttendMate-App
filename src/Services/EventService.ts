import { onSnapshot } from "firebase/firestore";
import { DB } from "../config/databaseConfig";


export interface EventData {
  id: string;
  event_title: string;
  event_theme?: string;
  event_date?: Date;
  created_at?: Date;
}

export interface EmployeeData {
  id: string;
  Name: string;
  DateOfBirth?: Date;
  Photo?: string;
}


export const subscribeToEvents = (
  onUpdate: (events: EventData[]) => void,
  onError?: (err: any) => void
) => {
  const unsubscribe = onSnapshot(
    DB.collections.Events,
    (snapshot) => {
      const events: EventData[] = snapshot.docs.map((doc) => {
        const data = doc.data();
        const event_date = data.event_date?.toDate
          ? data.event_date.toDate()
          : data.event_date;
        const created_at = data.created_at?.toDate
          ? data.created_at.toDate()
          : data.created_at;

        return {
          id: doc.id,
          event_title: data.event_title || "Untitled Event",
          event_theme: data.event_theme || "blue",
          event_date,
          created_at,
        };
      });
      onUpdate(events);
    },
    (err) => onError?.(err)
  );
  return unsubscribe;
};


export const subscribeToBirthdays = (
  onUpdate: (birthdays: EmployeeData[]) => void,
  onError?: (err: any) => void
) => {
  const unsubscribe = onSnapshot(
    DB.collections.Employee_Details,
    (snapshot) => {
      const employees: EmployeeData[] = snapshot.docs.map((doc) => {
        const data = doc.data();
        const dob = data.DateOfBirth?.toDate
          ? data.DateOfBirth.toDate()
          : data.DateOfBirth
          ? new Date(data.DateOfBirth)
          : null;

        return {
          id: doc.id,
          Name: data.Name || "Unknown",
          DateOfBirth: dob || undefined,
          Photo: data.Photo || "",
        };
      });

      const today = new Date();
      const todayBirthdays = employees.filter((emp) => {
        if (!emp.DateOfBirth) return false;
        const dob = emp.DateOfBirth;
        return dob.getDate() === today.getDate() && dob.getMonth() === today.getMonth();
      });

      onUpdate(todayBirthdays);
    },
    (err) => onError?.(err)
  );
  return unsubscribe;
};


export const getVisibleEvents = (events: EventData[]): EventData[] => {
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  const nextMonth = (currentMonth + 1) % 12;
  const nextMonthYear = nextMonth === 0 ? currentYear + 1 : currentYear;
  const includeNextMonth = today.getDate() >= 25;

  const filtered = events.filter((ev) => {
    if (!ev.event_date) return false;
    const evDate = new Date(ev.event_date);
    const month = evDate.getMonth();
    const year = evDate.getFullYear();

    if (month === currentMonth && year === currentYear) return true;
    if (includeNextMonth && month === nextMonth && year === nextMonthYear)
      return true;
    return false;
  });

  return filtered.sort(
    (a, b) =>
      new Date(b.event_date!).getTime() - new Date(a.event_date!).getTime()
  );
};
