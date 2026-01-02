import React from "react";
import {
  IonContent,
  IonText,
  IonIcon,
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

import Skeleton from "./Skeleton";
import Header from "../components/AppHeader";
import DateFilterModal from "../components/DateFilterModal";
import "../theme/components/HistoryLayout.css";
import AppRefresher from "../components/Models/AppRefresher";
interface HistoryLayoutProps {
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
  liveDuration?: string;
}

const HistoryLayout: React.FC<HistoryLayoutProps> = ({
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
  liveDuration = "00h 00m",
}) => {
  const refreshHistoryData = async () => {
    window.location.reload();
  };
  return (
    <>
      <Header />

      <IonContent color="white" className="history-content">
        <AppRefresher onRefresh={refreshHistoryData} />
        <div className="content-wrapper">

          <div className="history-header">
            <div className="history-header-inner">
              <div className="user-section">
                <IonText>
                  <h2 className="user-greeting">Hello, {userName.split(" ")[0]}</h2>
                  <p className="user-subtitle">Review your daily attendance.</p>
                </IonText>
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
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
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
          <button className="date-range-btn" onClick={() => setShowModal(true)}>
            <IonIcon icon={calendarOutline} className="range-btn-icon" />
            <span>{rangeLabel}</span>
            <IonIcon icon={chevronForwardOutline} className="range-btn-icon" />
          </button>

          <div className="records-container">


            {loading ? (
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
                        {(() => {
                          const isToday =
                            new Date().toDateString() === rec.date.toDateString();

                          const isActive =
                            isToday &&
                            todayRecord?.checkInTime &&
                            !todayRecord?.checkOutTime;

                          if (isActive) {
                            return (
                              <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                                <div className="blinking-dot"></div>
                                {liveDuration}
                              </div>
                            );
                          }

                          return rec.duration === "N/A" ? "00h 00m" : rec.duration;
                        })()}
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

          <DateFilterModal
            showModal={showModal}
            startDate={startDate}
            endDate={endDate}
            setShowModal={setShowModal}
            setStartDate={setStartDate}
            setEndDate={setEndDate}
          />
        </div>
      </IonContent>
    </>
  );
};

export default HistoryLayout;
