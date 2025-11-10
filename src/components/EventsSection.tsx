import React, { useEffect, useState } from "react";
import {
  IonCard,
  IonCardContent,
  IonText,
  IonIcon,
  IonGrid,
  IonRow,
  IonCol,
} from "@ionic/react";
import { giftOutline, calendarOutline } from "ionicons/icons";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { Skeleton } from "../components/ui/skeleton";

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

  /* 🗓️ Dynamic Month Logic (with future-only filtering) */
  const today = new Date();
  today.setHours(0, 0, 0, 0); // normalize time for comparison

  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  const nextMonth = (currentMonth + 1) % 12;
  const nextMonthYear = nextMonth === 0 ? currentYear + 1 : currentYear;
  const includeNextMonth = today.getDate() >= 25;

  const visibleEvents = events.filter((ev) => {
    if (!ev.event_date) return false;
    const evDate = new Date(ev.event_date);
    evDate.setHours(0, 0, 0, 0);

    // ❌ skip past events
    if (evDate < today) return false;

    // ✅ current month
    if (evDate.getMonth() === currentMonth && evDate.getFullYear() === currentYear)
      return true;

    // ✅ next month (only after 25th)
    if (
      includeNextMonth &&
      evDate.getMonth() === nextMonth &&
      evDate.getFullYear() === nextMonthYear
    )
      return true;

    return false;
  });

  // Sort ascending (nearest event first)
  const sortedEvents = [...visibleEvents].sort(
    (a, b) =>
      new Date(a.event_date!).getTime() - new Date(b.event_date!).getTime()
  );

  /* ---------- UI ---------- */
  return (
    <div
      style={{
        backgroundColor: "#ffffff",
        padding: "0 14px",
        marginTop: "8px",
        marginBottom: "80px",
      }}
    >
      {/* 🎂 Birthday Section */}
      {birthdayLoading ? (
        <div>
          {[...Array(2)].map((_, index) => (
            <IonCard
              key={index}
              style={{
                borderRadius: "18px",
                backgroundColor: "#FFF8E1",
                marginBottom: "6px",
                boxShadow: "0 3px 8px rgba(0,0,0,0.05)",
              }}
            >
              <IonCardContent style={{ padding: "10px" }}>
                <IonGrid>
                  <IonRow className="ion-align-items-center">
                    <IonCol size="2">
                      <Skeleton style={{ width: "36px", height: "36px", borderRadius: "8px" }} />
                    </IonCol>
                    <IonCol size="10">
                      <Skeleton
                        style={{ width: "130px", height: "14px", marginBottom: "4px" }}
                      />
                      <Skeleton style={{ width: "160px", height: "12px" }} />
                    </IonCol>
                  </IonRow>
                </IonGrid>
              </IonCardContent>
            </IonCard>
          ))}
        </div>
      ) : (
        birthdays.map((person) => (
          <IonCard
            key={person.id}
            style={{
              borderRadius: "18px",
              backgroundColor: "#FFF8E1",
              marginBottom: "6px",
              boxShadow: "0 3px 8px rgba(0,0,0,0.05)",
            }}
          >
            <IonCardContent style={{ padding: "10px" }}>
              <IonGrid>
                <IonRow className="ion-align-items-center">
                  <IonCol size="2">
                    <div
                      style={{
                        width: "36px",
                        height: "36px",
                        backgroundColor: "#FFCA28",
                        borderRadius: "8px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <IonIcon
                        icon={giftOutline}
                        style={{ fontSize: "22px", color: "#fff" }}
                      />
                    </div>
                  </IonCol>
                  <IonCol size="10">
                    <IonText>
                      <h3
                        style={{
                          margin: 0,
                          fontWeight: 700,
                          fontSize: "15px",
                          color: "#333",
                        }}
                      >
                        🎉 Happy Birthday, {person.Name}!
                      </h3>
                      <p
                        style={{
                          margin: "2px 0 0",
                          fontSize: "13px",
                          color: "#555",
                        }}
                      >
                        Have an amazing day 🎂
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
            fontSize: "17px",
            margin: "10px 0 6px 0",
            color: "#000",
          }}
        >
          EVENTS {includeNextMonth ? "(This & Next Month)" : "(This Month)"}
        </h2>
      </IonText>

      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {[...Array(3)].map((_, index) => (
            <IonCard
              key={index}
              style={{
                backgroundColor: "#E3F2FD",
                borderRadius: "18px",
                minHeight: "54px",
                padding: "6px 10px",
                marginBottom: "4px",
                boxShadow: "0 3px 8px rgba(0,0,0,0.05)",
              }}
            >
              <IonGrid style={{ padding: "6px 0" }}>
                <IonRow className="ion-align-items-center">
                  <IonCol size="2">
                    <Skeleton style={{ width: "36px", height: "36px", borderRadius: "8px" }} />
                  </IonCol>
                  <IonCol size="10">
                    <Skeleton
                      style={{ width: "120px", height: "14px", marginBottom: "3px" }}
                    />
                    <Skeleton style={{ width: "90px", height: "12px" }} />
                  </IonCol>
                </IonRow>
              </IonGrid>
            </IonCard>
          ))}
        </div>
      ) : sortedEvents.length === 0 ? (
        <p
          style={{
            textAlign: "center",
            fontSize: "14px",
            color: "#777",
            marginTop: "4px",
          }}
        >
          No upcoming events found.
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
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
                borderRadius: "18px",
                minHeight: "54px",
                marginBottom: "4px",
                boxShadow: "0 3px 8px rgba(0,0,0,0.05)",
              }}
            >
              <IonGrid style={{ padding: "8px 6px" }}>
                <IonRow className="ion-align-items-center">
                  <IonCol size="2">
                    <div
                      style={{
                        width: "36px",
                        height: "36px",
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
                        style={{ fontSize: "22px", color: "#fff" }}
                      />
                    </div>
                  </IonCol>
                  <IonCol size="10">
                    <IonText>
                      <p
                        style={{
                          margin: 0,
                          fontWeight: 600,
                          fontSize: "14px",
                          color: "#333",
                        }}
                      >
                        {ev.event_title}
                      </p>
                      {ev.event_date && (
                        <p
                          style={{
                            margin: "1px 0 0",
                            fontSize: "12.5px",
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