import React from "react";
import {
  IonHeader,
  IonToolbar,
  IonContent,
  IonButton,
  IonText,
  IonIcon,
  IonModal,
  IonCard,
  IonCardContent,
} from "@ionic/react";
import {
  calendarOutline,
  logInOutline,
  logOutOutline,
  timeOutline,
  chevronForwardOutline,
} from "ionicons/icons";
import Skeleton from "../components/Skeleton";

interface HistoryLayoutProps {
  initials: string;
  userName: string;
  todayRecord: any;
  rangeLabel: string;     
  loading: boolean;
  records: any[];
  showModal: boolean;
  startDate: Date;
  endDate: Date;
  setShowModal: (v: boolean) => void;
  setStartDate: (v: Date) => void;
  setEndDate: (v: Date) => void;
}

const HistoryLayout: React.FC<HistoryLayoutProps> = ({
  initials,
  userName,
  todayRecord,
  rangeLabel,
  loading,
  records,
  showModal,
  startDate,
  endDate,
  setShowModal,
  setStartDate,
  setEndDate,
}) => {
  return (
    <>
      <style>
        {`
          ion-header, ion-toolbar {
            --background: transparent;
            --border-width: 0;
            box-shadow: none !important;
            border: none !important;
          }

          input[type="date"] {
            background-color: #ffffff !important;
            color: #000000 !important;
            border: 1px solid #dcdcdc;
            border-radius: 10px;
            height: 48px;
            width: 100%;
            font-size: 15px;
            padding: 0 12px;
            transition: border-color 0.2s ease-in-out;
          }

          input[type="date"]:focus {
            border-color: #4FC3F7;
            outline: none;
            box-shadow: 0 0 0 2px rgba(79,195,247,0.15);
          }

          @keyframes blink {
            0% { opacity: 0; }
            50% { opacity: 1; }
            100% { opacity: 0; }
          }
        `}
      </style>

      <IonHeader translucent={true}>
        <IonToolbar />
      </IonHeader>

      <IonContent fullscreen color="light">
        
        <div
          style={{
            backgroundColor: "#4FC3F7",
            padding: "12px 16px 10px",
            borderBottomLeftRadius: "18px",
            borderBottomRightRadius: "18px",
          }}
        >
          
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "10px",
            }}
          >
            {loading ? (
              <Skeleton
                width="40px"
                height="40px"
                borderRadius="50%"
                style={{ marginRight: "10px" }}
              />
            ) : (
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  background: "#ffffff",
                  color: "#0288D1",
                  fontWeight: "bold",
                  fontSize: "17px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: "10px",
                }}
              >
                {initials}
              </div>
            )}

            {loading ? (
              <div>
                <Skeleton width="120px" height="16px" style={{ marginBottom: "6px" }} />
                <Skeleton width="180px" height="14px" />
              </div>
            ) : (
              <IonText color="light">
                <h2
                  style={{
                    margin: 0,
                    fontSize: "16px",
                    fontWeight: 600,
                    color: "white",
                  }}
                >
                  Hello, {userName.split(" ")[0]}
                </h2>
                <p
                  style={{
                    margin: 0,
                    fontSize: "13px",
                    opacity: 0.9,
                    color: "#E1F5FE",
                  }}
                >
                  Review your daily attendance.
                </p>
              </IonText>
            )}
          </div>

         
          <div
            style={{
              background: "#ffffff",
              borderRadius: "12px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "10px 14px",
            }}
          >
            
            <div style={{ flex: 1, textAlign: "center" }}>
              <IonIcon icon={logInOutline} color="primary" />
              <p style={{ margin: "4px 0", fontSize: "12px", color: "#0288D1" }}>
                Check In
              </p>
              <h5 style={{ margin: 0, fontSize: "15px", color: "#01579B" }}>
                {todayRecord?.checkIn || "Not marked"}
              </h5>
            </div>

            <div style={{ width: "1px", height: "30px", background: "#dcdcdc" }} />

           
            <div style={{ flex: 1, textAlign: "center" }}>
              <IonIcon icon={logOutOutline} color="danger" />
              <p style={{ margin: "4px 0", fontSize: "12px", color: "#e53935" }}>
                Check Out
              </p>
              <h5 style={{ margin: 0, fontSize: "15px", color: "#c62828" }}>
                {todayRecord?.checkOut || "Not marked"}
              </h5>
            </div>

            <div style={{ width: "1px", height: "30px", background: "#dcdcdc" }} />

            
            <div style={{ flex: 1, textAlign: "center" }}>
              <IonIcon icon={timeOutline} color="medium" />
              <p
                style={{
                  margin: "4px 0",
                  fontSize: "12px",
                  color:
                    todayRecord?.checkOut === "Not marked" ? "#00BFA5" : "#0288D1",
                }}
              >
                {todayRecord?.checkOut === "Not marked"
                  ? "Ongoing Duration"
                  : "Total Duration"}
              </p>
              <h5
                style={{
                  margin: 0,
                  fontSize: "15px",
                  color:
                    todayRecord?.checkOut === "Not marked" ? "#00BFA5" : "#01579B",
                  fontWeight: todayRecord?.checkOut === "Not marked" ? 700 : 600,
                }}
              >
                {todayRecord?.duration === "N/A"
                  ? "00h 00m"
                  : todayRecord?.duration || "00h 00m"}
                {todayRecord?.checkOut === "Not marked" &&
                  todayRecord?.checkIn !== "Not marked" && (
                    <span
                      style={{
                        display: "inline-block",
                        marginLeft: "6px",
                        fontSize: "10px",
                        color: "#00BFA5",
                        animation: "blink 1s infinite",
                      }}
                    >
                      •
                    </span>
                  )}
              </h5>
            </div>
          </div>
        </div>

       
        <div style={{ background: "#f5f7fa", padding: "10px 16px 8px" }}>
          <IonButton
            expand="block"
            fill="solid"
            color="light"
            onClick={() => setShowModal(true)}
            style={{
              height: "48px",
              borderRadius: "12px",
              fontWeight: 600,
              "--color": "#0288D1",
            }}
          >
            <IonIcon slot="start" icon={calendarOutline} style={{ color: "#0288D1" }} />
            Timeline:{" "}
            {startDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}{" "}
            -{" "}
            {endDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            <IonIcon slot="end" icon={chevronForwardOutline} style={{ color: "#0288D1" }} />
          </IonButton>
        </div>

        
        <div style={{ background: "#f5f7fa", padding: "8px 16px 16px" }}>
          {loading ? (
            [...Array(6)].map((_, i) => (
              <IonCard
                key={i}
                style={{
                  borderRadius: "12px",
                  background: "#ffffff",
                  marginBottom: "10px",
                  boxShadow: "none",
                }}
              >
                <IonCardContent>
                  <div style={{ marginBottom: "6px" }}>
                    <Skeleton width="60%" height="14px" />
                  </div>
                  <div style={{ marginBottom: "6px" }}>
                    <Skeleton width="80%" height="12px" />
                  </div>
                  <div>
                    <Skeleton width="40%" height="12px" />
                  </div>
                </IonCardContent>
              </IonCard>
            ))
          ) : records.length > 0 ? (
            records.map((rec, i) => (
              <IonCard
                key={i}
                style={{
                  borderRadius: "12px",
                  background: "#ffffff",
                  marginBottom: "10px",
                  boxShadow: "none",
                }}
              >
                <IonCardContent>
                  <h3
                    style={{
                      margin: 0,
                      fontSize: "15px",
                      fontWeight: 600,
                      color: "#0288D1",
                    }}
                  >
                    {rec.date.toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "short",
                      day: "numeric",
                    })}
                  </h3>
                  <p style={{ fontSize: "13px", margin: "4px 0" }}>
                    In: {rec.checkIn} | Out: {rec.checkOut}
                  </p>
                  <p
                    style={{
                      fontSize: "13px",
                      fontWeight: 600,
                      color: "#01579B",
                    }}
                  >
                    Duration: {rec.duration === "N/A" ? "00h 00m" : rec.duration}
                  </p>
                </IonCardContent>
              </IonCard>
            ))
          ) : (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <IonIcon
                icon={timeOutline}
                style={{ fontSize: "46px", color: "#ccc", marginBottom: "16px" }}
              />
              <IonText color="medium">
                <h3 style={{ fontWeight: 600 }}>No Records Found</h3>
              </IonText>
            </div>
          )}
        </div>

        
        <IonModal
          isOpen={showModal}
          onDidDismiss={() => setShowModal(false)}
          initialBreakpoint={0.7}
          breakpoints={[0, 0.7, 1]}
        >
          <IonHeader>
            <IonToolbar style={{ backgroundColor: "#16a6e9ff", color: "white" }}>
              <IonText slot="start" style={{ padding: "12px", fontWeight: 600, color: "white" }}>
                Select Date Range
              </IonText>
              <IonButton
                slot="end"
                fill="clear"
                style={{ color: "white", fontWeight: 600 }}
                onClick={() => setShowModal(false)}
              >
                Done
              </IonButton>
            </IonToolbar>
          </IonHeader>

          <IonContent className="ion-padding">
            <p style={{ marginBottom: "8px", fontWeight: 600 }}>Start Date</p>
            <input
              type="date"
              value={startDate.toISOString().split("T")[0]}
              onChange={(e) => setStartDate(new Date(e.target.value))}
              max={new Date().toISOString().split("T")[0]}
            />

            <p style={{ marginBottom: "8px", marginTop: "20px", fontWeight: 600 }}>
              End Date
            </p>
            <input
              type="date"
              value={endDate.toISOString().split("T")[0]}
              onChange={(e) => setEndDate(new Date(e.target.value))}
              max={new Date().toISOString().split("T")[0]}
            />
          </IonContent>
        </IonModal>
      </IonContent>
    </>
  );
};

export default HistoryLayout;
