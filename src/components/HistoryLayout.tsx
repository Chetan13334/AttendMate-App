import React from "react";
import {
  IonToolbar,
  IonContent,
  IonText,
  IonIcon,
  IonModal,
  IonCard,
  IonCardContent,
  IonButton,
} from "@ionic/react";

import {
  calendarOutline,
  logInOutline,
  logOutOutline,
  timeOutline,
  chevronForwardOutline,
} from "ionicons/icons";

import Skeleton from "./Skeleton";
import Header from "../components/AppHeader";
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
  userPhoto?: string | null;
  photoLoading?: boolean;
  photoError?: boolean;
  liveDuration?: string; // Add liveDuration property
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
  userPhoto,
  photoLoading,
  photoError,
  liveDuration = "00h 00m", // Default value for liveDuration
}) => {
  const handlePhotoError = () => console.log("User photo failed");

  return (
    <>
     

      <IonContent color="white" className="history-content" scrollEvents={true}>

        <div className="content-wrapper">
          <Header />
          {/* HEADER */}
          <div className="history-header">
            <div className="history-header-inner">

              <div className="user-section">
                {loading || photoLoading ? (
                  <IonText>
                    <h2 className="user-greeting">Hello, {userName.split(" ")[0]}</h2>
                    <p className="user-subtitle">Review your daily attendance.</p>
                  </IonText>
                ) : (
                  <IonText>
                    <h2 className="user-greeting">Hello, {userName.split(" ")[0]}</h2>
                    <p className="user-subtitle">Review your daily attendance.</p>
                  </IonText>
                )}
              </div>

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
                  <p className="today-label total">Duration</p>
                  <h5 className="today-time total">
                    {todayRecord?.checkInTime && !todayRecord?.checkOutTime ? (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div className="blinking-dot"></div>
                        {liveDuration}
                      </div>
                    ) : todayRecord?.duration === "N/A" ? (
                      "00h 00m"
                    ) : (
                      todayRecord?.duration || "00h 00m"
                    )}
                  </h5>
                </div>
              </div>



            </div>
          </div>

          {/* RECORD LIST */}
          <div className="records-container">

            {/* Modern Button */}
            <button
              className="date-range-btn"
              onClick={() => setShowModal(true)}
            >
              <IonIcon icon={calendarOutline} className="range-btn-icon" />
              <span>{rangeLabel}</span>
              <IonIcon icon={chevronForwardOutline} className="range-btn-icon" />
            </button>

            {loading ? (
              // Show skeleton loaders when loading
              <>
                {[...Array(5)].map((_, i) => (
                  <IonCard key={i} className="record-modern-card">
                    <IonCardContent>
                      <div className="record-header">
                        <Skeleton width="120px" height="16px" />
                        <Skeleton width="60px" height="20px" borderRadius="999px" />
                      </div>
                      <div className="record-divider"></div>
                      <div className="record-row-modern">
                        <div className="rec-col">
                          <Skeleton width="80px" height="14px" />
                        </div>
                        <div className="rec-col">
                          <Skeleton width="80px" height="14px" />
                        </div>
                      </div>
                    </IonCardContent>
                  </IonCard>
                ))}
              </>
            ) : records.length > 0 ? (
              records.map((rec, i) => (
                <IonCard key={i} className="record-modern-card">
                  <IonCardContent>

                    <div className="record-header">
                      <h3 className="record-date-modern">
                        {rec.date.toLocaleDateString("en-US", {
                          weekday: "long",
                          month: "short",
                          day: "numeric",
                        })}
                      </h3>
                      <div className="record-duration-pill">
                        {rec.duration === "N/A" ? "00h 00m" : rec.duration}
                      </div>
                    </div>

                    <div className="record-divider"></div>

                    <div className="record-row-modern">
                      <div className="rec-col">
                        <IonIcon icon={logInOutline} className="rec-icon in-color" />
                        <span className="rec-label">In:</span>
                        <span className="rec-value">{rec.checkIn}</span>
                      </div>

                      <div className="rec-col">
                        <IonIcon icon={logOutOutline} className="rec-icon out-color" />
                        <span className="rec-label">Out:</span>
                        <span className="rec-value">{rec.checkOut}</span>
                      </div>
                    </div>

                  </IonCardContent>
                </IonCard>
              ))
            ) : (
              <div className="no-records-modern">
                <IonIcon icon={timeOutline} className="no-records-modern-icon" />
                <h3>No Records Found</h3>
              </div>
            )}

          </div>

          {/* MODAL */}
          <IonModal
            isOpen={showModal}
            onDidDismiss={() => setShowModal(false)}
            initialBreakpoint={0.55}
            breakpoints={[0, 0.55, 0.75]}
            className="popup-modal"
          >
            <div className="popup-container">

              <div className="popup-body">

                {/* START DATE */}
                <div className="popup-field">
                  <label>Start Date</label>
                  <input
                    type="date"
                    value={startDate.toISOString().split("T")[0]}
                    onChange={(e) => {
                      const d = new Date(e.target.value);
                      d.setHours(0, 0, 0, 0);
                      setStartDate(d);
                    }}
                    className="popup-date-input"
                  />
                </div>

                {/* END DATE */}
                <div className="popup-field">
                  <label>End Date</label>
                  <input
                    type="date"
                    value={endDate.toISOString().split("T")[0]}
                    onChange={(e) => {
                      const d = new Date(e.target.value);
                      d.setHours(23, 59, 59, 999);
                      setEndDate(d);
                    }}
                    className="popup-date-input"
                  />
                </div>

                {/* DONE BUTTON */}
                <IonButton expand="block" className="popup-done-btn" onClick={() => setShowModal(false)}>
                  Done
                </IonButton>

              </div>
            </div>
          </IonModal>

        </div>
      </IonContent>
    </>
  );
};

export default HistoryLayout;