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
import Skeleton from "./Skeleton";
import { fetchEvents, fetchBirthdays } from "../Services/EventService";
import type { EventData, EmployeeData } from "../Services/EventService";
import "../theme/components/EventSection.css";



const EventsSection: React.FC = () => {
  const [events, setEvents] = useState<EventData[]>([]);
  const [birthdays, setBirthdays] = useState<EmployeeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [birthdayLoading, setBirthdayLoading] = useState(true);

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const list = await fetchEvents();
        setEvents(list);
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setLoading(false);
      }
    };
    loadEvents();
  }, []);

  useEffect(() => {
    const loadBirthdays = async () => {
      try {
        // fetchBirthdays is now alias for fetchEmployees, returning all employees
        const list = await fetchBirthdays();

        const today = new Date();
        const todayBirthdays = list.filter((emp: EmployeeData) => {
          if (!emp.dateOfBirth) return false;
          const dob = new Date(emp.dateOfBirth);
          return (
            dob.getDate() === today.getDate() &&
            dob.getMonth() === today.getMonth()
          );
        });

        setBirthdays(todayBirthdays);
      } catch (error) {
        console.error("Error fetching birthdays:", error);
      } finally {
        setBirthdayLoading(false);
      }
    };
    loadBirthdays();
  }, []);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  const nextMonth = (currentMonth + 1) % 12;
  const nextMonthYear = nextMonth === 0 ? currentYear + 1 : currentYear;
  const includeNextMonth = today.getDate() >= 25;

  const visibleEvents = events.filter((ev) => {
    if (!ev.event_date) return false;
    const evDate = new Date(ev.event_date);
    evDate.setHours(0, 0, 0, 0);

 

    // Show only future events (including today)
    return evDate >= today;
  });

  const sortedEvents = [...visibleEvents].sort(
    (a, b) =>
      new Date(a.event_date!).getTime() - new Date(b.event_date!).getTime()
  );

  return (
    <div
      style={{
        backgroundColor: "#ffffff",
        padding: "0 14px",
        marginTop: "8px",
        marginBottom: "0px",
        paddingBottom: "0px",
        overflow: "hidden",
      }}
    >
      {birthdayLoading ? (
        <div>
          {[...Array(1)].map((_, index) => (
            <div key={index} className="birthday-new-card">

              <div style={{ minWidth: "72px", minHeight: "72px" }}>
                <Skeleton width="72px" height="72px" variant="circle" />
              </div>


              <div style={{ marginLeft: "14px", width: "100%" }}>
                <div style={{ marginBottom: "8px" }}>
                  <Skeleton width="150px" height="20px" />
                </div>
                <div style={{ marginBottom: "6px" }}>
                  <Skeleton
                    width="110px"
                    height="16px"
                  />
                </div>
                <Skeleton
                  width="180px"
                  height="14px"
                />
              </div>
            </div>
          ))}
        </div>
      ) : birthdays.length === 0 ? (
        <></>
      ) : (
        birthdays.map((person) => (
          <div key={person.id} className="birthday-new-card">
            <div className="birthday-photo-box">
              <img
                src={person.Photo}
                alt={person.Name}
                className="birthday-photo-img"
              />
            </div>

            <div className="birthday-text-box">
              <h2 className="birthday-big-title">HAPPY BIRTHDAY</h2>
              <p className="birthday-name-text">{person.Name}</p>
              <p className="birthday-wish-text">Wishing You a Great Day!</p>
            </div>
          </div>
        ))
      )}

      <IonText>
        <h2
          style={{
            fontWeight: 700,
            fontSize: "17px",
            margin: "10px 0 6px 0",
            color: "#000",
          }}
        >
        Upcoming Events
        </h2>
      </IonText>

      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {[...Array(5)].map((_, index) => (
            <div
              key={index}
              style={{
                background: "#E3F2FD",
                padding: "14px",
                borderRadius: "18px",
                display: "flex",
                alignItems: "center",
              }}
            >

              <div style={{ minWidth: "40px", minHeight: "40px" }}>
                <Skeleton width="40px" height="40px" borderRadius="8px" />
              </div>


              <div style={{ marginLeft: "14px", width: "100%" }}>
                <div style={{ marginBottom: "6px" }}>
                  <Skeleton width="150px" height="16px" />
                </div>
                <Skeleton
                  width="100px"
                  height="14px"
                />
              </div>
            </div>
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
