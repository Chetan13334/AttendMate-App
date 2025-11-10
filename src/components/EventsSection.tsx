import React, { useState, useEffect } from "react";
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

import {
  subscribeToEvents,
  subscribeToBirthdays,
  getVisibleEvents,
  EventData,
  EmployeeData,
} from "../Services/EventService";

import "../theme/components/EventSection.css"; 

const EventsSection: React.FC = () => {
  const [events, setEvents] = useState<EventData[]>([]);
  const [birthdays, setBirthdays] = useState<EmployeeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [birthdayLoading, setBirthdayLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeToEvents(
      (data) => {
        setEvents(data);
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching events:", err);
        setLoading(false);
      }
    );
    return () => unsub();
  }, []);

  useEffect(() => {
    const unsub = subscribeToBirthdays(
      (data) => {
        setBirthdays(data);
        setBirthdayLoading(false);
      },
      (err) => {
        console.error("Error fetching birthdays:", err);
        setBirthdayLoading(false);
      }
    );
    return () => unsub();
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
    <div className="events-wrapper">
      
      {birthdayLoading ? (
        [...Array(2)].map((_, index) => (
          <IonCard key={index} className="birthday-card">
            <IonCardContent className="birthday-card-content">
              <IonGrid>
                <IonRow className="ion-align-items-center">
                  <IonCol size="2">
                    <Skeleton width="36px" height="36px" borderRadius="8px" />
                  </IonCol>
                  <IonCol size="10">
                    <Skeleton width="130px" height="14px" style={{ marginBottom: "4px" }} />
                    <Skeleton width="160px" height="12px" />
                  </IonCol>
                </IonRow>
              </IonGrid>
            </IonCardContent>
          </IonCard>
        ))
      ) : (
        birthdays.map((person) => (
          <IonCard key={person.id} className="birthday-card">
            <IonCardContent className="birthday-card-content">
              <IonGrid>
                <IonRow className="ion-align-items-center">
                  <IonCol size="2">
                    <div className="birthday-icon">
                      <IonIcon icon={giftOutline} className="birthday-icon-inner" />
                    </div>
                  </IonCol>
                  <IonCol size="10">
                    <IonText>
                      <h3 className="birthday-title">🎉 Happy Birthday, {person.Name}!</h3>
                      <p className="birthday-msg">Have an amazing day 🎂</p>
                    </IonText>
                  </IonCol>
                </IonRow>
              </IonGrid>
            </IonCardContent>
          </IonCard>
        ))
      )}

      
      <IonText>
        <h2 className="event-header">
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
                    <Skeleton width="36px" height="36px" borderRadius="8px" />
                  </IonCol>
                  <IonCol size="10">
                    <Skeleton
                      width="120px"
                      height="14px"
                      style={{ marginBottom: "3px" }}
                    />
                    <Skeleton width="90px" height="12px" />
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
        visibleEvents.map((ev) => {
          const theme = getThemeClass(ev.event_theme);
          return (
            <IonCard key={ev.id} className={`event-card ${theme}-theme`}>
              <IonGrid className="event-grid">
                <IonRow className="ion-align-items-center">
                  <IonCol size="2">
                    <div className={`event-icon ${theme}-theme`}>
                      <IonIcon icon={calendarOutline} className="event-icon-inner" />
                    </div>
                  </IonCol>
                  <IonCol size="10">
                    <IonText>
                      <p className="event-title">{ev.event_title}</p>
                      {ev.event_date && (
                        <p className="event-date">
                          {new Date(ev.event_date).toDateString()}
                        </p>
                      )}
                    </IonText>
                  </IonCol>
                </IonRow>
              </IonGrid>
            </IonCard>
          );
        })
      )}
    </div>
  );
};

export default EventsSection;
