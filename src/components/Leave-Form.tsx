import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import {
  IonPage,
  IonContent,
  IonPopover,
  IonDatetime,
  IonModal,
  IonButton,
  IonIcon,
} from "@ionic/react";
import { checkmark, close } from "ionicons/icons";
import "../theme/components/Leave-Form.css";
import Header from "../components/AppHeader";

import { submitLeaveRequest } from "../Services/LeaveService";

const LeaveForm: React.FC = () => {
  const history = useHistory();
  const [leaveType, setLeaveType] = useState("");
  const [reason, setReason] = useState("");

  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);

  const userEmail = localStorage.getItem("userEmail");

  const today = new Date().toISOString().split("T")[0];

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const totalDays =
    startDate && endDate
      ? (new Date(endDate).getTime() - new Date(startDate).getTime()) /
          (1000 * 60 * 60 * 24) +
        1
      : 0;

  const handleSubmit = async () => {
    if (!leaveType || !startDate || !endDate || !totalDays) {
      setShowErrorModal(true);
      return;
    }

    if (!userEmail) {
      setShowErrorModal(true);
      return;
    }

    const data = {
      leaveType,
      startDate,
      endDate,
      totalDays,
      reason,
      email: userEmail,
    };

    const result = await submitLeaveRequest(data);

    if (result.success) {
      setShowSuccessModal(true);
    } else {
      setShowErrorModal(true);
    }
  };

  return (
    <IonPage className="lf-page">
      <Header />

      <IonContent forceOverscroll={true} className="lf-content">
        <div className="main-content">
          <div className="form-section">
            <div className="form-field">
              <label className="label-text">Leave Type</label>
              <select
                className="form-select"
                value={leaveType}
                onChange={(e) => setLeaveType(e.target.value)}
              >
                <option value="">Select leave type</option>
                <option value="Annual">Annual</option>
                <option value="Sick">Sick</option>
                <option value="Personal">Personal</option>
                <option value="Unpaid">Unpaid</option>
              </select>
            </div>

            <div className="input-group">
              <div className="form-field">
                <label className="label-text">Start Date</label>
                <div
                  className="input-wrapper"
                  onClick={() => setShowStartPicker(true)}
                >
                  <input
                    className="form-input"
                    value={startDate ? formatDate(startDate) : ""}
                    readOnly
                  />
                  <span className="material-symbols-outlined input-icon">event</span>
                </div>

                <IonPopover
                  isOpen={showStartPicker}
                  onDidDismiss={() => setShowStartPicker(false)}
                >
                  <IonDatetime
                    presentation="date"
                    value={startDate}
                    min={today}
                    onIonChange={(e) => {
                      if (e.detail.value) setStartDate(e.detail.value as string);
                      setShowStartPicker(false);
                    }}
                  />
                </IonPopover>
              </div>

              <div className="form-field">
                <label className="label-text">End Date</label>
                <div
                  className="input-wrapper"
                  onClick={() => setShowEndPicker(true)}
                >
                  <input
                    className="form-input"
                    value={endDate ? formatDate(endDate) : ""}
                    readOnly
                  />
                  <span className="material-symbols-outlined input-icon">event</span>
                </div>

                <IonPopover
                  isOpen={showEndPicker}
                  onDidDismiss={() => setShowEndPicker(false)}
                >
                  <IonDatetime
                    presentation="date"
                    value={endDate}
                    min={startDate || today}
                    onIonChange={(e) => {
                      if (e.detail.value) setEndDate(e.detail.value as string);
                      setShowEndPicker(false);
                    }}
                  />
                </IonPopover>
              </div>
            </div>

            <div className="summary-box">
              <div className="summary-content">
                <p className="summary-label">Total Days</p>
                <p className="summary-value">{totalDays}</p>
              </div>
            </div>

            <div className="form-field">
              <label className="label-text">Reason (Optional)</label>
              <textarea
                className="form-textarea"
                placeholder="Provide a brief reason..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              ></textarea>
            </div>
          </div>

          <div>
            <button className="submit-button" onClick={handleSubmit}>
              Submit Request
            </button>
          </div>
        </div>

        <IonModal
          isOpen={showSuccessModal}
          onDidDismiss={() => setShowSuccessModal(false)}
          backdropDismiss={false}
          mode="ios"
          className="confirm-modal"
        >
          <div className="alert-modal-content alert-modal-inner">
            <div className="alert-icon-container alert-success">
              <IonIcon icon={checkmark} className="alert-icon" style={{ fontSize: "34px", color: "#fff" }} />
            </div>

            <h2 className="alert-modal-title alert-success-title">Success</h2>

            <p className="alert-modal-message">
              Your leave request has been submitted.
            </p>

            <IonButton
              expand="block"
              color="success"
              onClick={() => {
                setShowSuccessModal(false);
                history.push("/leave-request");
              }}
              className="alert-ok-btn"
            >
              OK
            </IonButton>
          </div>
        </IonModal>

        <IonModal
          isOpen={showErrorModal}
          onDidDismiss={() => setShowErrorModal(false)}
          backdropDismiss={false}
          mode="ios"
          className="confirm-modal"
        >
          <div className="alert-modal-content alert-modal-inner">
            <div
              className="alert-icon-container alert-success"
              style={{ background: "#ff4444" }}
            >
              <IonIcon icon={close} className="alert-icon" style={{ fontSize: "34px", color: "#fff" }} />
            </div>

            <h2 className="alert-modal-title" style={{ color: "#ff4444" }}>
              Missing Fields
            </h2>

            <p className="alert-modal-message">
              Please fill all required fields before submitting.
            </p>

            <IonButton
              expand="block"
              color="danger"
              onClick={() => setShowErrorModal(false)}
              className="alert-ok-btn"
            >
              OK
            </IonButton>
          </div>
        </IonModal>
      </IonContent>
    </IonPage>
  );
};

export default LeaveForm;
