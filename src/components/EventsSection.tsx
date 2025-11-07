import React, { useEffect, useState } from "react";
import {
  IonCard,
  IonCardContent,
  IonText,
  IonIcon,
  IonGrid,
  IonRow,
  IonCol,
  IonSpinner,
} from "@ionic/react";
import { giftOutline, calendarOutline } from "ionicons/icons";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

/* ---------- Type Definitions ---------- */
interface EventData {
  id: string;
  event_title: string;
  event_theme?: string;
  event_date?: Date;
  created_at?: Date;
}

interface EmployeeData {
  id: string;
  Name: string;
  DateOfBirth?: Date;
  Photo?: string;
}

/* ---------- Component ---------- */
const EventsSection: React.FC = () => {
  const [events, setEvents] = useState<EventData[]>([]);
  const [birthdays, setBirthdays] = useState<EmployeeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [birthdayLoading, setBirthdayLoading] = useState(true);

  /* 🔹 Real-time Events Listener */
  useEffect(() => {
    const colRef = collection(db, "Events");

    const unsubscribe = onSnapshot(
      colRef,
      (snapshot) => {
        const list: EventData[] = snapshot.docs.map((doc) => {
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

        setEvents(list);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching events:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  /* 🎂 Real-time Birthdays Listener */
  useEffect(() => {
    const colRef = collection(db, "Employee_Details");

    const unsubscribe = onSnapshot(
      colRef,
      (snapshot) => {
        const list: EmployeeData[] = snapshot.docs.map((doc) => {
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

        // 🎉 Filter today's birthdays
        const today = new Date();
        const todayBirthdays = list.filter((emp) => {
          if (!emp.DateOfBirth) return false;
          const dob = emp.DateOfBirth;
          return (
            dob.getDate() === today.getDate() &&
            dob.getMonth() === today.getMonth()
          );
        });

        setBirthdays(todayBirthdays);
        setBirthdayLoading(false);
      },
      (error) => {
        console.error("Error fetching birthdays:", error);
        setBirthdayLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  /* 🗓️ Dynamic Month Range Logic */
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  const nextMonth = (currentMonth + 1) % 12;
  const nextMonthYear = nextMonth === 0 ? currentYear + 1 : currentYear;

  const includeNextMonth = today.getDate() >= 25; // Show next month's events starting from 25th

  const visibleEvents = events.filter((ev) => {
    if (!ev.event_date) return false;
    const evDate = new Date(ev.event_date);
    const month = evDate.getMonth();
    const year = evDate.getFullYear();

    if (month === currentMonth && year === currentYear) return true;
    if (includeNextMonth && month === nextMonth && year === nextMonthYear)
      return true;

    return false;
  });

  // ✅ Sort Events in Descending Order (latest date on top)
  const sortedEvents = [...visibleEvents].sort(
    (a, b) =>
      new Date(b.event_date!).getTime() - new Date(a.event_date!).getTime()
  );

  /* ---------- UI ---------- */
  return (
    <div
      style={{
        backgroundColor: "#ffffff",
        padding: "0 16px",
        marginTop: "16px",
        marginBottom: "100px",
      }}
    >
      {/* 🎂 Birthday Section */}
      {birthdayLoading ? (
        <div style={{ textAlign: "center", padding: "20px 0", color: "#777" }}>
          <IonSpinner name="crescent" />
          <p>Loading birthdays...</p>
        </div>
      ) : birthdays.length === 0 ? null : (
        birthdays.map((person) => (
          <IonCard
            key={person.id}
            style={{
              borderRadius: "20px",
              backgroundColor: "#FFF8E1",
              margin: "0 0 20px 0",
              width: "96%",
              marginLeft: "auto",
              marginRight: "auto",
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            }}
          >
            <IonCardContent style={{ padding: "18px" }}>
              <IonGrid>
                <IonRow className="ion-align-items-center">
                  <IonCol size="2">
                    <div
                      style={{
                        width: "40px",
                        height: "40px",
                        backgroundColor: "#FFCA28",
                        borderRadius: "8px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <IonIcon
                        icon={giftOutline}
                        style={{ fontSize: "26px", color: "#fff" }}
                      />
                    </div>
                  </IonCol>
                  <IonCol size="10">
                    <IonText>
                      <h3
                        style={{
                          margin: 0,
                          fontWeight: 700,
                          fontSize: "16px",
                          color: "#333",
                        }}
                      >
                        🎉 Happy Birthday, {person.Name}!
                      </h3>
                      <p
                        style={{
                          margin: "4px 0 0",
                          fontSize: "14px",
                          color: "#555",
                        }}
                      >
                        Wishing you a wonderful year ahead 🎂
                      </p>
                    </IonText>
                  </IonCol>
                </IonRow>
              </IonGrid>
            </IonCardContent>
          </IonCard>
        ))
      )}

      {/* 🗓️ Events Section */}
      <IonText>
        <h2
          style={{
            fontWeight: 700,
            fontSize: "18px",
            margin: "0 0 16px 0",
            color: "#000",
          }}
        >
          EVENTS {includeNextMonth ? "(This & Next Month)" : "(This Month)"}
        </h2>
      </IonText>

      {loading ? (
        <div style={{ textAlign: "center", padding: "40px 0", color: "#777" }}>
          <IonSpinner name="crescent" />
          <p>Loading events...</p>
        </div>
      ) : sortedEvents.length === 0 ? (
        <p
          style={{
            textAlign: "center",
            fontSize: "15px",
            color: "#777",
            marginTop: "10px",
          }}
        >
          No events found for this period.
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {sortedEvents.map((ev) => (
            <IonCard
              key={ev.id}
              style={{
                backgroundColor:
                  ev.event_theme === "yellow"
                    ? "#FFF8E1"
                    : ev.event_theme === "green"
                    ? "#E8F5E9"
                    : ev.event_theme === "red"
                    ? "#FFEBEE"
                    : "#E3F2FD",
                borderRadius: "20px",
                minHeight: "80px",
                display: "flex",
                alignItems: "center",
                padding: "0 16px",
                boxShadow: "0 3px 8px rgba(0,0,0,0.08)",
              }}
            >
              <IonGrid style={{ padding: "14px 0" }}>
                <IonRow className="ion-align-items-center">
                  <IonCol size="2">
                    <div
                      style={{
                        width: "40px",
                        height: "40px",
                        backgroundColor:
                          ev.event_theme === "yellow"
                            ? "#FFCA28"
                            : ev.event_theme === "green"
                            ? "#4CAF50"
                            : ev.event_theme === "red"
                            ? "#E53935"
                            : "#2196F3",
                        borderRadius: "8px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <IonIcon
                        icon={calendarOutline}
                        style={{ fontSize: "24px", color: "#fff" }}
                      />
                    </div>
                  </IonCol>
                  <IonCol size="10">
                    <IonText>
                      <p
                        style={{
                          margin: 0,
                          fontWeight: 600,
                          fontSize: "15px",
                          color: "#333",
                        }}
                      >
                        {ev.event_title}
                      </p>
                      {ev.event_date && (
                        <p
                          style={{
                            margin: "2px 0 0",
                            fontSize: "13px",
                            color: "#666",
                          }}
                        >
                          {new Date(ev.event_date).toDateString()}
                        </p>
                      )}
                    </IonText>
                  </IonCol>
                </IonRow>
              </IonGrid>
            </IonCard>
          ))}
        </div>
      )}
    </div>
  );
};

export default EventsSection;
