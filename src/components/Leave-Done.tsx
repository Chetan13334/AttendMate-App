import React from "react";
import { IonPage, IonContent } from "@ionic/react";
import Header from "../components/AppHeader";
import "../theme/components/Leave-Done.css";

const LeaveDone: React.FC = () => {
    return (
        <IonPage className="ld-page">
            <Header />

            <IonContent className="ld-content">

                <div className="ld-status-wrapper">
                    <div className="ld-status-chip">
                        <p>Pending Approval</p>
                    </div>
                </div>

                <div className="ld-card">
                    <div className="ld-row">
                        <div className="ld-icon-box"></div>
                        <div className="ld-text-box">
                            <p className="ld-label">Leave Type</p>
                            <p className="ld-value">Annual Leave</p>
                        </div>
                    </div>

                    <div className="ld-divider"></div>

                    <div className="ld-row">
                        <div className="ld-icon-box">
                            <span className="material-symbols-outlined">calendar_month</span>
                        </div>
                        <div className="ld-text-box">
                            <p className="ld-label">Dates</p>
                            <p className="ld-value">Oct 26, 2023 - Oct 28, 2023</p>
                        </div>
                    </div>

                    <div className="ld-divider"></div>

                    <div className="ld-row">
                        <div className="ld-icon-box">
                            <span className="material-symbols-outlined">hourglass_top</span>
                        </div>
                        <div className="ld-text-box">
                            <p className="ld-label">Total</p>
                            <p className="ld-value">3 Working Days</p>
                        </div>
                    </div>
                </div>

                <div className="ld-card p4">
                    <div className="ld-info-section">
                        <p className="ld-info-label">Reason / Comments</p>
                        <p className="ld-info-value">Taking a short break to recharge. Will be available on chat for urgent matters.</p>
                    </div>

                    <div className="ld-info-section">
                        <p className="ld-info-label">Submitted On</p>
                        <p className="ld-info-value">October 15, 2023</p>
                    </div>
                </div>

            </IonContent>

            <footer className="ld-footer">
                <button className="ld-btn-outline">Edit Request</button>
                <button className="ld-btn-primary">Withdraw Request</button>
            </footer>
        </IonPage>
    );
};

export default LeaveDone;
