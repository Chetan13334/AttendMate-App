import React, { useEffect, useState } from "react";
import {
  IonCard,
  IonCardContent,
  IonText,
  IonIcon,
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
const SKELETON_TRANSITION_MS = 300;

const CheckIn_CheckOut: React.FC = () => {
  const [status, setStatus] = useState<Status>("not-checked");
  const [time, setTime] = useState("");
  const [currentTime, setCurrentTime] = useState("");

  const [loading, setLoading] = useState(true);
  const [statusLoading, setStatusLoading] = useState(true);

  const [showAlert, setShowAlert] = useState(false);
  const [msg, setMsg] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [modalTitle, setModalTitle] = useState("");

  const [isProcessing, setIsProcessing] = useState(false);
  const [employeeId, setEmployeeId] = useState("");

  const [pendingAction, setPendingAction] = useState<(inside: boolean) => void>(() => () => { });
  const [showLocationAlert, setShowLocationAlert] = useState(false);
  const [showLocationChecking, setShowLocationChecking] = useState(false);
  const [showNoThanksAlert, setShowNoThanksAlert] = useState(false);

  const loggedInUserEmail = localStorage.getItem("userEmail") || "";
  const today = new Date().toISOString().split("T")[0];

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

  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      try {
        const empId = await fetchEmployeeId(loggedInUserEmail);
        if (!empId) {
          if (!cancelled) {
            setEmployeeId("");
            setLoading(false);
            setStatusLoading(false);
            setStatus("not-checked");
          }
          return;
        }

        if (!cancelled) setEmployeeId(empId);

        const data = await fetchTodayRecord(today, empId);

        if (!cancelled) {
          let newStatus: Status = "not-checked";
          let newTime = "";

          if (data) {
            if (data.CheckIn && !data.CheckOut) {
              newStatus = "checked-in";
              newTime = data.CheckIn.toDate().toLocaleTimeString();
            } else if (data.CheckOut) {
              newStatus = "checked-out";
              newTime = data.CheckOut.toDate().toLocaleTimeString();
            }
          }

          setStatus(newStatus);
          setTime(newTime);
        }
      } catch (e: any) {
        setMsg(`Error loading attendance data: ${e.message || "Unknown error"}`);
        setShowAlert(true);
      } finally {
        if (!cancelled) {
          setLoading(false);
          setStatusLoading(false);
        }
      }
    };

    loadData();
    return () => {
      cancelled = true;
    };
  }, [loggedInUserEmail, today]);

  useEffect(() => {
    if (!employeeId) return;
    const unsub = listenToAttendance(today, employeeId, (data: any) => {
      setStatusLoading(true);

      let newStatus: Status = "not-checked";
      let newTime = "";

      if (data) {
        if (data.CheckIn && !data.CheckOut) {
          newStatus = "checked-in";
          newTime = data.CheckIn.toDate().toLocaleTimeString();
        } else if (data.CheckOut) {
          newStatus = "checked-out";
          newTime = data.CheckOut.toDate().toLocaleTimeString();
        }
      }

      setTimeout(() => {
        setStatus(newStatus);
        setTime(newTime);
        setStatusLoading(false);
      }, SKELETON_TRANSITION_MS);
    });

    return () => unsub();
  }, [employeeId, today]);

  const confirmAction = (action: (inside: boolean) => void, title: string) => {
    setPendingAction(() => action);
    setModalTitle(title);
    setShowModal(true);
  };

  const executeAction = async () => {
    setShowModal(false);
    setShowLocationChecking(true);

    try {
      const { success, inside } = await quickGeoCheck();
      setShowLocationChecking(false);

      const isWeb = Capacitor.getPlatform() === "web";

      if (!success) {
        setShowLocationAlert(true);
        return;
      }

      if (success && !inside && !isWeb) {
        setMsg("Warning: You are not in the designated location!");
        setShowAlert(true);
        return;
      }

      pendingAction?.(inside);
    } catch {
      setShowLocationChecking(false);
      setShowLocationAlert(true);
    }
  };

  const onTurnOnLocation = async () => {
    setShowLocationAlert(false);
    setShowLocationChecking(true);

    try {
      const enabled = await enableLocation();
      setShowLocationChecking(false);

      const isWeb = Capacitor.getPlatform() === "web";

      if (!enabled && !isWeb) {
        setShowNoThanksAlert(true);
        return;
      }

      const { success, inside } = await quickGeoCheck();

      if (!success) return;
      pendingAction?.(inside);
    } catch {
      setShowLocationChecking(false);
      setShowNoThanksAlert(false);
    }
  };

  const onNoThanks = () => {
    setShowLocationAlert(false);
    setShowNoThanksAlert(true);
  };

  const handleCheckIn = async (inside: boolean) => {
    if (!employeeId) {
      setMsg("Error: No employee ID found.");
      setShowAlert(true);
      return;
    }

    setIsProcessing(true);
    const isWeb = Capacitor.getPlatform() === "web";

    if (!inside && !isWeb) {
      setMsg("Warning: Check-In Failed: You are not in the designated location!");
      setShowAlert(true);
      setIsProcessing(false);
      return;
    }

    try {
      const now = await saveCheckIn(today, employeeId, inside);
      setStatus("checked-in");
      setTime(now.toLocaleTimeString());
      setMsg("Success: Check-In Successful!");
      setShowAlert(true);
    } catch (err: any) {
      setMsg(`Warning: Check-In Failed: ${err.message}`);
      setShowAlert(true);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCheckOut = async (inside: boolean) => {
    if (!employeeId) {
      setMsg("Error: No employee ID found.");
      setShowAlert(true);
      return;
    }

    setIsProcessing(true);
    const isWeb = Capacitor.getPlatform() === "web";

    if (!inside && !isWeb) {
      setMsg("Warning: Check-Out Failed: You are not in the designated location!");
      setShowAlert(true);
      setIsProcessing(false);
      return;
    }

    try {
      const now = await saveCheckOut(today, employeeId, inside);
      setStatus("checked-out");
      setTime(now.toLocaleTimeString());
      setMsg("Success: Check-Out Successful!");
      setShowAlert(true);
    } catch (err: any) {
      setMsg(`Warning: Check-Out Failed: ${err.message}`);
      setShowAlert(true);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTap = () => {
    if (isProcessing) return;
    if (status === "not-checked") confirmAction(handleCheckIn, "Check In");
    else if (status === "checked-in") confirmAction(handleCheckOut, "Check Out");
  };

  const CheckInSkeleton = () => (
    <IonCard className="checkin-card">
      <div className="checkin-header" style={{ padding: "50px 20px 40px", textAlign: "center" }}>
        <div style={{ margin: "0 auto 24px" }}>
          <Skeleton style={{ width: 120, height: 120, borderRadius: "50%", margin: "0 auto" }} />
        </div>
        <Skeleton style={{ height: 28, width: 140, margin: "0 auto 12px" }} />
        <Skeleton style={{ height: 22, width: 240, margin: "0 auto" }} />
      </div>
    </IonCard>
  );

  const CheckedInSkeleton = () => (
    <IonCard className="checkedin-card">
      <div className="checkedin-header">
        <Skeleton style={{ width: 40, height: 40, borderRadius: "50%" }} />
        <div style={{ flex: 1, marginLeft: "16px" }}>
          <Skeleton style={{ height: 22, width: "60%" }} />
          <Skeleton style={{ height: 18, width: "40%", marginTop: "8px" }} />
        </div>
        <Skeleton style={{ width: 32, height: 32, borderRadius: "50%" }} />
      </div>
      <IonCardContent className="checkedin-content">
        <Skeleton style={{ height: 22, width: 140 }} />
        <Skeleton style={{ height: 18, width: 100, marginTop: "8px" }} />
      </IonCardContent>
    </IonCard>
  );

  const CheckedOutSkeleton = () => (
    <IonCard className="checkedout-card">
      <div className="checkedout-header">
        <Skeleton style={{ width: 40, height: 40, borderRadius: "50%" }} />
        <div style={{ flex: 1, marginLeft: "16px" }}>
          <Skeleton style={{ height: 22, width: "60%" }} />
          <Skeleton style={{ height: 18, width: "40%", marginTop: "8px" }} />
        </div>
      </div>
      <IonCardContent className="checkedout-content">
        <Skeleton style={{ height: 22, width: 140 }} />
        <Skeleton style={{ height: 18, width: 100, marginTop: "8px" }} />
      </IonCardContent>
    </IonCard>
  );

  if (loading || statusLoading) {
    if (status === "checked-in") return <CheckedInSkeleton />;
    if (status === "checked-out") return <CheckedOutSkeleton />;
    return <CheckInSkeleton />;
  }

  return (
    <>
      {status === "not-checked" && (
        <IonCard
          button
          disabled={isProcessing}
          onClick={handleTap}
          className="checkin-card ion-activatable ripple-parent"
        >
          <div className="checkin-header">
            <div className="checkin-circle-outer">
              <div className="checkin-circle-inner">
                {isProcessing ? (
                  <IonSpinner name="crescent" color="light" />
                ) : (
                  <IonText color="light" style={{ fontWeight: 700, fontSize: "16px" }}>
                    CHECK IN
                  </IonText>
                )}
              </div>
            </div>

            <h3 className="checkin-status">STATUS: Pending</h3>
            <p className="checkin-time">{currentTime}</p>
          </div>

          <IonRippleEffect />
        </IonCard>
      )}

      {status === "checked-in" && (
        <IonCard
          button
          disabled={isProcessing}
          onClick={handleTap}
          className="checkedin-card ion-activatable ripple-parent"
        >
          <div className="checkedin-header">
            <IonIcon icon={timeOutline} className="checkedin-icon" />
            <IonText color="light">
              <h2>{isProcessing ? "PROCESSING..." : "CHECK OUT"}</h2>
              <p>Tap to end your shift</p>
            </IonText>

            <div className="checkedin-badge">
              {isProcessing ? (
                <IonSpinner name="crescent" color="primary" />
              ) : (
                <IonIcon icon={checkmarkCircle} className="checkedin-badge-icon" />
              )}
            </div>
          </div>

          <IonCardContent className="checkedin-content">
            <h4>STATUS: Checked In</h4>
            <p>{time}</p>
          </IonCardContent>
          <IonRippleEffect />
        </IonCard>
      )}

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

      <IonModal
        isOpen={showModal}
        onDidDismiss={() => setShowModal(false)}
        backdropDismiss={false}
        mode="ios"
        className="confirm-modal"
      >
        <div className="confirm-modal-content">
          <IonIcon icon={timeOutline} className="modal-icon" />
          <h2>Confirm {modalTitle}</h2>
          <p>Are you sure you want to proceed?</p>

          <div className="modal-buttons">
            <IonButton
              fill="outline"
              color="medium"
              onClick={() => setShowModal(false)}
              disabled={isProcessing}
            >
              <IonIcon icon={close} slot="start" /> Cancel
            </IonButton>

            <IonButton color="success" onClick={executeAction} disabled={isProcessing}>
              {isProcessing ? (
                <IonSpinner name="crescent" slot="start" />
              ) : (
                <IonIcon icon={checkmark} slot="start" />
              )}
              {isProcessing ? "Processing..." : "Confirm"}
            </IonButton>
          </div>
        </div>
      </IonModal>

      <IonModal
        isOpen={showLocationChecking}
        backdropDismiss={false}
        mode="ios"
        className="confirm-modal"
      >
        <div className="confirm-modal-content">
          <IonSpinner name="crescent" color="primary" className="location-spinner" />
          <h2>Checking Location</h2>
          <p>Please wait while we verify your location...</p>
        </div>
      </IonModal>

      <IonModal
        isOpen={showLocationAlert}
        onDidDismiss={() => setShowLocationAlert(false)}
        backdropDismiss={false}
        mode="ios"
        className="confirm-modal"
      >
        <div className="confirm-modal-content">
          <IonIcon icon={timeOutline} className="modal-icon" />
          <h2>Turn On Location</h2>
          <p>We need your location to verify check-in.</p>

          <div className="modal-buttons">
            <IonButton fill="outline" color="medium" onClick={onNoThanks}>
              No thanks
            </IonButton>
            <IonButton color="success" fill="solid" onClick={onTurnOnLocation}>
              OK
            </IonButton>
          </div>
        </div>
      </IonModal>

      <IonModal
        isOpen={showAlert}
        onDidDismiss={() => setShowAlert(false)}
        backdropDismiss={false}
        mode="ios"
        className="confirm-modal"
      >
        <div className="alert-modal-content alert-modal-inner">
          {(() => {
            const isBlocking = msg.includes("requires GPS") || msg.includes("not supported");
            const isWarning = msg.includes("Warning") || msg.includes("Failed");
            const failedClass = isBlocking || isWarning ? "alert-failed" : "alert-success";
            const titleClass = isBlocking || isWarning ? "alert-failed-title" : "alert-success-title";

            return (
              <>
                <div className={`alert-icon-container ${failedClass}`}>
                  <IonIcon
                    icon={isBlocking || isWarning ? close : checkmark}
                    className="alert-icon"
                    style={{ fontSize: "34px", color: "#fff" }}
                  />
                </div>

                <h2 className={`alert-modal-title ${titleClass}`}>
                  {isBlocking ? "Action Required" : isWarning ? "Action Failed" : "Success"}
                </h2>

                <p className="alert-modal-message">
                  {msg.replace(/Warning:|Success:|Action Required:/g, "").trim()}
                </p>

                <IonButton
                  expand="block"
                  color={isBlocking || isWarning ? "danger" : "success"}
                  onClick={() => setShowAlert(false)}
                  className="alert-ok-btn"
                >
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
