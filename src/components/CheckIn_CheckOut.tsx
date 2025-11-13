// src/components/CheckIn_CheckOut.tsx
import React, { useEffect, useState } from "react";
import {
  IonCard,
  IonCardContent,
  IonText,
  IonIcon,
  IonAlert,
  IonModal,
  IonButton,
  IonRippleEffect,
  IonSpinner,
} from "@ionic/react";
import { timeOutline, checkmarkCircle, checkmark, close } from "ionicons/icons";
import { Capacitor } from "@capacitor/core";
import { Skeleton } from "./ui/skeleton";

import { enableLocation, quickGeoCheck } from "../Services/LocationService";
import {
  fetchEmployeeId,
  fetchTodayRecord,
  listenToAttendance,
  saveCheckIn,
  saveCheckOut,
} from "../Services/AttendanceService";

import "../theme/components/CheckIn_CheckOut.css";

type Status = "not-checked" | "checked-in" | "checked-out";

const CheckIn_CheckOut: React.FC = () => {
  const [status, setStatus] = useState<Status>("not-checked");
  const [time, setTime] = useState("");
  const [currentTime, setCurrentTime] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [msg, setMsg] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [pendingAction, setPendingAction] = useState<(inside: boolean) => void>(() => () => {});
  const [employeeId, setEmployeeId] = useState("");
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showLocationAlert, setShowLocationAlert] = useState(false);
  const [showLocationChecking, setShowLocationChecking] = useState(false);
  const [showNoThanksAlert, setShowNoThanksAlert] = useState(false);

  const loggedInUserEmail = localStorage.getItem("userEmail") || "";
  const today = new Date().toISOString().split("T")[0];

  const isWeb = Capacitor.getPlatform() === "web";

  const formatTime = () =>
    new Date().toLocaleString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  useEffect(() => {
    setCurrentTime(formatTime());
    const timer = setInterval(() => setCurrentTime(formatTime()), 1000);
    return () => clearInterval(timer);
  }, []);

  // initial load
  useEffect(() => {
    const loadData = async () => {
      try {
        const empId = await fetchEmployeeId(loggedInUserEmail);
        if (!empId) {
          setLoading(false);
          return;
        }
        setEmployeeId(empId);
        const data = await fetchTodayRecord(today, empId);
        if (data) {
          if (data.CheckIn && !data.CheckOut) {
            setStatus("checked-in");
            setTime(data.CheckIn.toDate().toLocaleTimeString());
          } else if (data.CheckOut) {
            setStatus("checked-out");
            setTime(data.CheckOut.toDate().toLocaleTimeString());
          }
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [loggedInUserEmail]);

  // real-time listener -> updates UI only (no alerts)
  useEffect(() => {
    if (!employeeId) return;
    const unsubscribe = listenToAttendance(today, employeeId, (data: any) => {
      if (data) {
        if (data.CheckIn && !data.CheckOut) {
          setStatus("checked-in");
          setTime(data.CheckIn.toDate().toLocaleTimeString());
        } else if (data.CheckOut) {
          setStatus("checked-out");
          setTime(data.CheckOut.toDate().toLocaleTimeString());
        }
      } else {
        setStatus("not-checked");
      }
    });
    return () => unsubscribe();
  }, [employeeId, today]);

  const confirmAction = (action: (inside: boolean) => void, title: string) => {
    setPendingAction(() => action);
    setModalTitle(title);
    setShowModal(true);
  };

  // verify location and call pendingAction (if possible)
  const executeAction = async () => {
    setShowModal(false);
    setShowLocationChecking(true);
    try {
      const { success, inside } = await quickGeoCheck();
      setShowLocationChecking(false);

      if (!success) {
        // Could not obtain coords (GPS off or permission denied)
        setShowLocationAlert(true);
        return;
      }

      // run handler (handler will show success/warning)
      pendingAction?.(inside);
    } catch (err) {
      console.error("executeAction error:", err);
      setShowLocationChecking(false);
      setShowLocationAlert(true);
    }
  };

  const handleCheckIn = async (inside: boolean) => {
    if (!employeeId) return;
    setIsProcessing(true);
    if (!inside) {
      setMsg("Warning: Check-In Failed: You are not in the designated location!");
      setShowAlert(true);
      setIsProcessing(false);
      return;
    }
    const now = await saveCheckIn(today, employeeId, inside);
    setStatus("checked-in");
    setTime(now.toLocaleTimeString());
    setMsg("Success: Check-In Successful!");
    setShowAlert(true);
    setIsProcessing(false);
  };

  const handleCheckOut = async (inside: boolean) => {
    if (!employeeId) return;
    setIsProcessing(true);
    if (!inside) {
      setMsg("Warning: Check-Out Failed: You are not in the designated location!");
      setShowAlert(true);
      setIsProcessing(false);
      return;
    }
    const now = await saveCheckOut(today, employeeId, inside);
    setStatus("checked-out");
    setTime(now.toLocaleTimeString());
    setMsg("Success: Check-Out Successful!");
    setShowAlert(true);
    setIsProcessing(false);
  };

  const handleTap = () => {
    if (isProcessing) return;

    if (isWeb) {
      setMsg("Check-in/out requires GPS and is only available on the mobile app.");
      setShowAlert(true);
      return;
    }

    if (status === "not-checked") confirmAction(handleCheckIn, "Check In");
    else if (status === "checked-in") confirmAction(handleCheckOut, "Check Out");
  };

  // User chose "Turn On Location" in the alert -> try silent enable (no settings redirect),
  // then verify position and run pendingAction if available.
  const onTurnOnLocation = async () => {
    setShowLocationAlert(false);
    setShowLocationChecking(true);
    try {
      const enabled = await enableLocation();
      setShowLocationChecking(false);

      if (!enabled) {
        // silent enable failed -> show simple informational alert with OK (No buttons other than OK)
        setShowNoThanksAlert(true);
        return;
      }

      // enabled succeeded -> verify position now
      const { success, inside } = await quickGeoCheck();
      if (!success) {
        setMsg("Warning: Could not verify location after enabling location.");
        setShowAlert(true);
        return;
      }

      // Verified -> run handler
      pendingAction?.(inside);
    } catch (err) {
      console.error("onTurnOnLocation error:", err);
      setShowLocationChecking(false);
      setShowNoThanksAlert(true);
    }
  };

  // User selected Cancel/No Thanks from Turn On alert -> show the informational OK alert
  const onNoThanks = () => {
    setShowLocationAlert(false);
    setShowNoThanksAlert(true);
  };

  if (loading) {
    return (
      <IonCard className="checkin-card" style={{ padding: "20px", borderRadius: "20px", marginBottom: "12px" }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <Skeleton style={{ width: "70px", height: "70px", borderRadius: "50%" }} />
          <div style={{ marginLeft: "16px", width: "100%" }}>
            <Skeleton style={{ width: "150px", height: "22px" }} />
            <Skeleton style={{ width: "110px", height: "16px", marginTop: "10px" }} />
            <Skeleton style={{ width: "180px", height: "14px", marginTop: "6px" }} />
          </div>
        </div>
        <div style={{ marginTop: "20px" }}>
          <Skeleton style={{ width: "130px", height: "16px" }} />
          <Skeleton style={{ width: "90px", height: "14px", marginTop: "8px" }} />
        </div>
      </IonCard>
    );
  }

  return (
    <>
      {/* NOT CHECKED */}
      {status === "not-checked" && (
        <IonCard button onClick={handleTap} disabled={isProcessing} className="checkin-card ion-activatable ripple-parent">
          <div className="checkin-header">
            <div className="checkin-circle-outer">
              <div className="checkin-circle-inner">
                {isProcessing ? <IonSpinner name="crescent" color="light" /> : (
                  <IonText color="light" style={{ fontWeight: 700, fontSize: "16px" }}>CHECK IN</IonText>
                )}
              </div>
            </div>
            <h3 className="checkin-status">STATUS: Pending</h3>
            <p className="checkin-time">{currentTime}</p>
          </div>
          <IonRippleEffect />
        </IonCard>
      )}

      {/* CHECKED IN */}
      {status === "checked-in" && (
        <IonCard button onClick={handleTap} disabled={isProcessing} className="checkedin-card ion-activatable ripple-parent">
          <div className="checkedin-header">
            <IonIcon icon={timeOutline} className="checkedin-icon" />
            <IonText color="light">
              <h2>{isProcessing ? "PROCESSING..." : "CHECK OUT"}</h2>
              <p>Tap to end your shift</p>
            </IonText>
            <div className="checkedin-badge">
              {isProcessing ? <IonSpinner name="crescent" color="primary" /> : <IonIcon icon={checkmarkCircle} className="checkedin-badge-icon" />}
            </div>
          </div>
          <IonCardContent className="checkedin-content">
            <h4>STATUS: Checked In</h4>
            <p>{time}</p>
          </IonCardContent>
          <IonRippleEffect />
        </IonCard>
      )}

      {/* CHECKED OUT */}
      {status === "checked-out" && (
        <IonCard className="checkedout-card">
          <div className="checkedout-header">
            <IonIcon icon={timeOutline} className="checkedout-icon" />
            <IonText color="light">
              <h2>DAY COMPLETE</h2>
              <p>Great job! See you tomorrow</p>
            </IonText>
          </div>
          <IonCardContent className="checkedout-content">
            <h4>STATUS: Checked Out</h4>
            <p>{time}</p>
          </IonCardContent>
        </IonCard>
      )}

      {/* CONFIRM MODAL */}
      <IonModal isOpen={showModal} onDidDismiss={() => setShowModal(false)} backdropDismiss={false} mode="ios" className="confirm-modal">
        <div className="confirm-modal-content">
          <IonIcon icon={timeOutline} className="modal-icon" />
          <h2>Confirm {modalTitle}</h2>
          <p>Are you sure you want to proceed?</p>
          <div className="modal-buttons">
            <IonButton color="success" onClick={executeAction} disabled={isProcessing}>
              {isProcessing ? <IonSpinner name="crescent" slot="start" /> : <IonIcon icon={checkmark} slot="start" />}
              {isProcessing ? "Processing..." : "Confirm"}
            </IonButton>
            <IonButton fill="outline" color="medium" onClick={() => setShowModal(false)} disabled={isProcessing}>
              <IonIcon icon={close} slot="start" /> Cancel
            </IonButton>
          </div>
        </div>
      </IonModal>

      {/* LOCATION CHECKING (spinner) */}
      <IonModal isOpen={showLocationChecking} backdropDismiss={false} mode="ios" className="confirm-modal">
        <div className="confirm-modal-content">
          <IonSpinner name="crescent" color="primary" className="location-spinner" />
          <h2>Checking Location</h2>
          <p>Please wait while we verify your location...</p>
        </div>
      </IonModal>

      {/* LOCATION ALERT: Turn On / Cancel */}
      <IonAlert
        isOpen={showLocationAlert}
        header="Location Required"
        message="Location is off. Please turn on location to continue."
        buttons={[
          {
            text: "Turn On Location",
            cssClass: "alert-button-success",
            handler: () => onTurnOnLocation(),
          },
          {
            text: "Cancel",
            role: "cancel",
            handler: () => onNoThanks(),
          },
        ]}
      />

      {/* NO THANKS informational alert with OK button */}
      <IonAlert
        isOpen={showNoThanksAlert}
        header="Location Required"
        message="To check-in you must turn on the location."
        buttons={[
          {
            text: "OK",
            role: "cancel",
            handler: () => setShowNoThanksAlert(false),
          },
        ]}
        onDidDismiss={() => setShowNoThanksAlert(false)}
      />

      {/* FINAL ALERT MODAL (success / warning) */}
      <IonModal isOpen={showAlert} onDidDismiss={() => setShowAlert(false)} backdropDismiss={false} mode="ios" className="confirm-modal">
        <div className="alert-modal-content alert-modal-inner">
          {(() => {
            const isBlocking = msg.includes("requires GPS") || msg.includes("not supported");
            const isWarning = msg.includes("Warning") || msg.includes("Failed");
            const failedClass = isBlocking || isWarning ? "alert-failed" : "alert-success";
            const titleClass = isBlocking || isWarning ? "alert-failed-title" : "alert-success-title";

            return (
              <>
                <div className={`alert-icon-container ${failedClass}`}>
                  <IonIcon icon={isBlocking || isWarning ? close : checkmark} className="alert-icon" style={{ fontSize: "34px", color: "#fff" }} />
                </div>

                <h2 className={`alert-modal-title ${titleClass}`}>
                  {isBlocking ? "Action Required" : isWarning ? "Action Failed" : "Success"}
                </h2>

                <p className="alert-modal-message">{msg.replace(/Warning:|Success:|Action Required:/g, "").trim()}</p>

                <IonButton expand="block" color={isBlocking || isWarning ? "danger" : "success"} onClick={() => setShowAlert(false)} className="alert-ok-btn">
                  OK
                </IonButton>
              </>
            );
          })()}
        </div>
      </IonModal>
    </>
  );
};

export default CheckIn_CheckOut;
