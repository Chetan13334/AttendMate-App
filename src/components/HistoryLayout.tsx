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
}) => {
  const handlePhotoError = () => {
    console.log("Error loading user photo, fallback to initials");
  };

  return (
    <>
      <IonToolbar />

      <IonContent fullscreen color="white" className="history-content">
        <div className="content-wrapper">

          {/* ---------------- HEADER ---------------- */}
          <div className="history-header">
            <div className="history-header-inner">
              <div className="user-section">
                {loading || photoLoading ? (
                  <Skeleton width="40px" height="40px" borderRadius="50%" />
                ) : userPhoto && !photoError ? (
                  <img
                    src={userPhoto}
                    alt="User"
                    className="user-avatar-img"
                    onError={handlePhotoError}
                  />
                ) : (
                  <div className="user-avatar">{initials}</div>
                )}

                {loading ? (
                  <Skeleton width="140px" height="16px" />
                ) : (
                  <IonText>
                    <h2 className="user-greeting">
                      Hello, {userName.split(" ")[0]}
                    </h2>
                    <p className="user-subtitle">Review your daily attendance.</p>
                  </IonText>
                )}
              </div>

              {/* ---------------- TODAY CARD ---------------- */}
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
                    {todayRecord?.duration === "N/A"
                      ? "00h 00m"
                      : todayRecord?.duration || "00h 00m"}
                  </h5>
                </div>
              </div>
            </div>
          </div>

          {/* ---------------- RANGE BUTTON ----------------
          <div className="range-container">
            <button className="modern-range-btn" onClick={() => setShowModal(true)}>
              <IonIcon icon={calendarOutline} className="range-icon" />

              <span className="range-text">
                {startDate.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}{" "}
                -{" "}
                {endDate.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </span>

              <IonIcon icon={chevronForwardOutline} className="range-icon" />
            </button>
          </div> */}

          {/* ---------------- RECORD LIST ---------------- */}
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

          {/* ---------------- MODAL (NO DATE PICKER) ---------------- */}
          <IonModal
            isOpen={showModal}
            onDidDismiss={() => setShowModal(false)}
            initialBreakpoint={0.35}
            breakpoints={[0, 0.35]}
            className="modern-modal"
          >
            <div className="modal-header">
              <h2>Select Date Range</h2>
              <button className="modal-close-btn" onClick={() => setShowModal(false)}>
                Done
              </button>
            </div>

            <div className="modal-body-no-picker">
              <p className="no-picker-text">Date picker removed.</p>
            </div>
          </IonModal>
        </div>
      </IonContent>
    </>
  );
};

export default HistoryLayout;
