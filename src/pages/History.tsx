import React, { useState, useEffect } from "react";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardContent,
  IonButton,
  IonText,
  IonIcon,
  IonGrid,
  IonRow,
  IonCol,
  IonModal,
  IonSpinner,
  IonAvatar,
} from "@ionic/react";
import {
  calendarOutline,
  logInOutline,
  logOutOutline,
  timeOutline,
} from "ionicons/icons";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { db } from "../firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";

const History: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [loading, setLoading] = useState(false);
  const [record, setRecord] = useState<{
    CheckIn?: string;
    CheckOut?: string;
  } | null>(null);
  const [employeeId, setEmployeeId] = useState<string | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);

  const userEmail = sessionStorage.getItem("userEmail");
  const userName = userEmail?.split("@")[0]?.replace(".", " ") || "Employee";

  // Generate initials (e.g., "Rohan Kumar" → "RK")
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const initials = getInitials(userName);

  // ─── Fetch Employee ID ────────────────────────────────
  useEffect(() => {
    const fetchEmployeeId = async () => {
      if (!userEmail) return;
      setLoading(true);
      try {
        const q = query(
          collection(db, "Employee_Details"),
          where("Email", "==", userEmail)
        );
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          const emp = snapshot.docs[0].data();
          setEmployeeId(emp.EmployeeID);
        }
      } catch (err) {
        console.error("Error fetching EmployeeID:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEmployeeId();
  }, [userEmail]);

  // ─── Fetch Attendance for selected date ───────────────
  const fetchAttendance = async (date: Date) => {
    if (!employeeId) return;
    setLoading(true);
    try {
      const dateKey = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

      const docRef = doc(
        db,
        "Employee_CheckIn_CheckOut",
        dateKey,
        "employee_records",
        employeeId
      );
      const recordSnap = await getDoc(docRef);

      if (recordSnap.exists()) {
        const data = recordSnap.data();
        const formatted = {
          CheckIn: data.CheckIn
            ? data.CheckIn.toDate().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "Not marked",
          CheckOut: data.CheckOut
            ? data.CheckOut.toDate().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "Not marked",
        };
        setRecord(formatted);
      } else {
        setRecord(null);
      }
    } catch (err) {
      console.error("Error fetching attendance:", err);
      setRecord(null);
    } finally {
      setLoading(false);
    }
  };

  // ─── Handle Date Selection ─────────────────────────────
  const handleDateChange = (value: any) => {
    const newDate = value as Date;
    setSelectedDate(newDate);
    setShowCalendar(false);
    fetchAttendance(newDate);
  };

  // ─── Load Today’s record initially ─────────────────────
  useEffect(() => {
    if (employeeId) fetchAttendance(selectedDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employeeId]);

  return (
    <IonPage>
      {/* Header */}
      <IonHeader translucent={true}>
        <IonToolbar color="light">
          <IonTitle style={{ fontWeight: 600, color: "#1a1a1a" }}>
            Attendance History
          </IonTitle>
        </IonToolbar>
      </IonHeader>

      {/* Content */}
      <IonContent
        fullscreen
        style={{
          "--background": "#f5f7fa",
        }}
      >
        <div style={{ padding: "16px", paddingTop: "calc(16px + var(--ion-safe-area-top))" }}>
          {/* Top Profile Card */}
          <IonCard
            style={{
              borderRadius: "16px",
              boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
              background: "#fff",
              marginBottom: "16px",
            }}
          >
            <IonCardContent style={{ textAlign: "center", padding: "20px" }}>
              {/* Initials Avatar */}
              <IonAvatar
                style={{
                  width: "68px",
                  height: "68px",
                  margin: "0 auto 12px",
                  background: "linear-gradient(135deg, #667eea, #764ba2)",
                  color: "white",
                  fontWeight: "bold",
                  fontSize: "24px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)",
                }}
              >
                {initials}
              </IonAvatar>

              <IonText>
                <h2 style={{ margin: "4px 0", color: "#222", fontWeight: 600 }}>
                  {userName}
                </h2>
                <p style={{ margin: 0, color: "#666", fontSize: "13.5px" }}>
                  {userEmail}
                </p>
              </IonText>

              {/* Date + Button */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: "18px",
                  background: "#f8f9fc",
                  padding: "10px 12px",
                  borderRadius: "12px",
                }}
              >
                <IonText>
                  <p style={{ margin: 0, color: "#333", fontWeight: 500, fontSize: "14px" }}>
                    {selectedDate.toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </IonText>
                <IonButton
                  fill="clear"
                  size="small"
                  onClick={() => setShowCalendar(true)}
                  style={{
                    "--color": "#4361ee",
                    fontWeight: 600,
                    fontSize: "13px",
                  }}
                >
                  <IonIcon slot="start" icon={calendarOutline} />
                  Change
                </IonButton>
              </div>
            </IonCardContent>
          </IonCard>

          {/* Attendance Cards */}
          {loading ? (
            <div style={{ textAlign: "center", marginTop: "40px" }}>
              <IonSpinner name="crescent" color="primary" />
              <p style={{ color: "#777", marginTop: "10px", fontSize: "14px" }}>
                Loading attendance...
              </p>
            </div>
          ) : record ? (
            <IonGrid>
              <IonRow>
                <IonCol size="6">
                  <IonCard
                    style={{
                      borderRadius: "14px",
                      background: "#f0f9f4",
                      border: "1px solid #a8e6cf",
                      textAlign: "center",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                    }}
                  >
                    <IonCardContent style={{ padding: "16px" }}>
                      <IonIcon
                        icon={logInOutline}
                        color="success"
                        style={{ fontSize: "26px", marginBottom: "6px" }}
                      />
                      <IonText color="success">
                        <h4 style={{ margin: "4px 0", fontSize: "14px" }}>Check In</h4>
                      </IonText>
                      <p style={{ fontSize: "16px", color: "#2e7d32", fontWeight: 600, margin: 0 }}>
                        {record.CheckIn}
                      </p>
                    </IonCardContent>
                  </IonCard>
                </IonCol>

                <IonCol size="6">
                  <IonCard
                    style={{
                      borderRadius: "14px",
                      background: "#fdf4f4",
                      border: "1px solid #ffccbc",
                      textAlign: "center",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                    }}
                  >
                    <IonCardContent style={{ padding: "16px" }}>
                      <IonIcon
                        icon={logOutOutline}
                        color="danger"
                        style={{ fontSize: "26px", marginBottom: "6px" }}
                      />
                      <IonText color="danger">
                        <h4 style={{ margin: "4px 0", fontSize: "14px" }}>Check Out</h4>
                      </IonText>
                      <p style={{ fontSize: "16px", color: "#c62828", fontWeight: 600, margin: 0 }}>
                        {record.CheckOut}
                      </p>
                    </IonCardContent>
                  </IonCard>
                </IonCol>
              </IonRow>
            </IonGrid>
          ) : (
            <div style={{ textAlign: "center", marginTop: "50px" }}>
              <IonIcon
                icon={timeOutline}
                style={{ fontSize: "42px", color: "#bbb", marginBottom: "12px" }}
              />
              <p style={{ color: "#888", fontSize: "14.5px" }}>
                No attendance record for this date.
              </p>
            </div>
          )}

          {/* Quick Calendar */}
          <IonCard
            style={{
              marginTop: "24px",
              borderRadius: "14px",
              background: "#fff",
              boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
            }}
          >
            <Calendar
              value={selectedDate}
              maxDate={new Date()}
              onChange={(date) => handleDateChange(date)}
              tileDisabled={({ date }) => date > new Date()}
              tileClassName={({ date }) =>
                date.toDateString() === selectedDate.toDateString()
                  ? "highlight-today"
                  : ""
              }
            />
          </IonCard>
        </div>

        {/* Full Calendar Modal */}
        <IonModal isOpen={showCalendar} onDidDismiss={() => setShowCalendar(false)}>
          <IonHeader>
            <IonToolbar color="light">
              <IonTitle>Select Date</IonTitle>
              <IonButton slot="end" fill="clear" onClick={() => setShowCalendar(false)}>
                Close
              </IonButton>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding">
            <Calendar
              onChange={(date) => handleDateChange(date)}
              value={selectedDate}
              maxDate={new Date()}
            />
          </IonContent>
        </IonModal>
      </IonContent>
    </IonPage>
  );
};

export default History;