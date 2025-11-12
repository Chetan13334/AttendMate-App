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
import "../theme/components/HistoryLayout.css";

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
      <IonHeader translucent>
        <IonToolbar />
      </IonHeader>

      <IonContent fullscreen color="light">
        {/* Header */}
        <div className="history-header">
          <div className="user-section">
            {loading ? (
              <Skeleton width="40px" height="40px" borderRadius="50%" />
            ) : (
              <div className="user-avatar">{initials}</div>
            )}
            {loading ? (
              <Skeleton width="140px" height="16px" />
            ) : (
              <IonText color="light">
                <h2 className="user-greeting">Hello, {userName.split(" ")[0]}</h2>
                <p className="user-subtitle">Review your daily attendance.</p>
              </IonText>
            )}
          </div>

          {/* Today Summary Card */}
          <div className="today-card">
            <div className="today-item">
              <IonIcon icon={logInOutline} color="primary" />
              <p className="today-label in">Check In</p>
              <h5 className="today-time in">
                {todayRecord?.checkIn || "Not marked"}
              </h5>
            </div>

            <div className="divider" />

            <div className="today-item">
              <IonIcon icon={logOutOutline} color="danger" />
              <p className="today-label out">Check Out</p>
              <h5 className="today-time out">
                {todayRecord?.checkOut || "Not marked"}
              </h5>
            </div>

            <div className="divider" />

            <div className="today-item">
              <IonIcon icon={timeOutline} color="medium" />
              <p
                className={`today-label ${
                  todayRecord?.checkOut === "Not marked" ? "ongoing" : "total"
                }`}
              >
                {todayRecord?.checkOut === "Not marked"
                  ? "Ongoing Duration"
                  : "Total Duration"}
              </p>
              <h5
                className={`today-time ${
                  todayRecord?.checkOut === "Not marked" ? "ongoing" : "total"
                }`}
              >
                {todayRecord?.duration === "N/A"
                  ? "00h 00m"
                  : todayRecord?.duration || "00h 00m"}
                {todayRecord?.checkOut === "Not marked" &&
                  todayRecord?.checkIn !== "Not marked" && (
                    <span className="blink-dot">•</span>
                  )}
              </h5>
            </div>
          </div>
        </div>

        {/* Range Button */}
        <div className="range-container">
          <IonButton
            expand="block"
            fill="solid"
            color="light"
            onClick={() => setShowModal(true)}
            className="range-btn"
          >
            <IonIcon slot="start" icon={calendarOutline} className="range-icon" />
            Timeline:{" "}
            {startDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}{" "}
            -{" "}
            {endDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            <IonIcon
              slot="end"
              icon={chevronForwardOutline}
              className="range-icon"
            />
          </IonButton>
        </div>

        {/* Record List */}
        <div className="records-container">
          {loading ? (
            [...Array(3)].map((_, i) => (
              <IonCard key={i} className="record-card">
                <IonCardContent>
                  <Skeleton width="60%" height="14px" />
                  <Skeleton width="80%" height="12px" />
                  <Skeleton width="40%" height="12px" />
                </IonCardContent>
              </IonCard>
            ))
          ) : records.length > 0 ? (
            records.map((rec, i) => (
              <IonCard key={i} className="record-card">
                <IonCardContent>
                  <h3 className="record-date">
                    {rec.date.toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "short",
                      day: "numeric",
                    })}
                  </h3>
                  <p className="record-info">
                    In: {rec.checkIn} | Out: {rec.checkOut}
                  </p>
                  <p className="record-duration">
                    Duration: {rec.duration === "N/A" ? "00h 00m" : rec.duration}
                  </p>
                </IonCardContent>
              </IonCard>
            ))
          ) : (
            <div className="no-records">
              <IonIcon icon={timeOutline} className="no-records-icon" />
              <IonText color="medium">
                <h3 className="no-records-text">No Records Found</h3>
              </IonText>
            </div>
          )}
        </div>

        {/* Date Filter Modal */}
        <IonModal
          isOpen={showModal}
          onDidDismiss={() => setShowModal(false)}
          initialBreakpoint={0.7}
          breakpoints={[0, 0.7, 1]}
        >
          <IonHeader>
            <IonToolbar className="modal-toolbar">
              <IonText slot="start" className="modal-title">
                Select Date Range
              </IonText>
              <IonButton
                slot="end"
                fill="clear"
                className="modal-done"
                onClick={() => {
                  console.log("Done button clicked, closing modal");
                  setShowModal(false);
                }}
              >
                Done
              </IonButton>
            </IonToolbar>
          </IonHeader>

          <IonContent className="ion-padding">
            <p className="modal-label">Start Date</p>
            <input
              type="date"
              value={startDate.toISOString().split("T")[0]}
              onChange={(e) => {
                const newDate = new Date(e.target.value);
                newDate.setHours(0, 0, 0, 0);
                console.log("Setting start date to:", newDate.toISOString());
                setStartDate(newDate);
              }}
              max={new Date().toISOString().split("T")[0]}
            />

            <p className="modal-label end">End Date</p>
            <input
              type="date"
              value={endDate.toISOString().split("T")[0]}
              onChange={(e) => {
                const newDate = new Date(e.target.value);
                newDate.setHours(23, 59, 59, 999);
                console.log("Setting end date to:", newDate.toISOString());
                setEndDate(newDate);
              }}
              max={new Date().toISOString().split("T")[0]}
            />
          </IonContent>
        </IonModal>
      </IonContent>
    </>
  );
};

export default HistoryLayout;
