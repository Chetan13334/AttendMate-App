import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import {
    IonCard,
    IonCardContent,
    IonIcon,
    IonFab,
    IonFabButton,
    IonSegment,
    IonSegmentButton,
    IonLabel,
} from "@ionic/react";
import {
    calendarOutline,
    medkitOutline,
    personOutline,
    addOutline,
} from "ionicons/icons";
import "../theme/components/Leave-Home.css";
import { listenToMyLeaveRequests } from "../Services/LeaveService";

const LeaveHome: React.FC = () => {
    const history = useHistory();
    const [selectedSegment, setSelectedSegment] = useState("pending");
    const [historyFilter, setHistoryFilter] = useState("All");
    const userEmail = localStorage.getItem("userEmail");
    const [leaveRequests, setLeaveRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const getStatusClass = (status: string) => {
        const s = status.toLowerCase();
        if (s === "approved") return "approved-status";
        if (s === "rejected") return "rejected-status";
        if (s === "cancelled") return "rejected-status";
        return "pending-status";
    };

    useEffect(() => {
        if (!userEmail) return;
        let unsubscribe: (() => void) | null = null;

        listenToMyLeaveRequests(userEmail, (data: any[]) => {
            setLeaveRequests(data);
            setLoading(false);
        }).then((unsub) => {
            unsubscribe = unsub;
        });

        return () => {
            if (unsubscribe) {
                unsubscribe();
            }
        };
    }, [userEmail]);

    const today = new Date().toISOString().split("T")[0];
    const upcoming = leaveRequests.filter((l) => l.startDate >= today);
    const historyList = leaveRequests.filter((l) => l.startDate < today);

    const filteredHistory =
        historyFilter === "All"
            ? historyList
            : historyList.filter(
                (req) =>
                    req.status.toLowerCase() === historyFilter.toLowerCase()
            );

    const SkeletonCard = () => (
        <div className="skeleton-card">
            <div className="skeleton-icon"></div>
            <div className="skeleton-lines">
                <div className="skeleton-line short"></div>
                <div className="skeleton-line long"></div>
            </div>
            <div className="skeleton-status"></div>
        </div>
    );

    return (
        <div className="leave-container-fixed">
            <div className="leave-fixed-header">
                <h2 className="leave-section-title">My Requests</h2>
                <IonSegment
                    value={selectedSegment}
                    onIonChange={(e) => setSelectedSegment(e.detail.value as string)}
                    className="leave-segment"
                >
                    <IonSegmentButton value="pending">
                        <IonLabel>Upcoming</IonLabel>
                    </IonSegmentButton>
                    <IonSegmentButton value="history">
                        <IonLabel>History</IonLabel>
                    </IonSegmentButton>
                </IonSegment>

                {selectedSegment === "history" && (
                    <div className="history-filter">
                        {["All", "Approved", "Rejected"].map(
                            (f) => (
                                <button
                                    key={f}
                                    className={`filter-btn ${historyFilter === f ? "active" : ""
                                        }`}
                                    onClick={() => setHistoryFilter(f)}
                                >
                                    {f}
                                </button>
                            )
                        )}
                    </div>
                )}
            </div>

            <div className="records-scroll-area">
                <div className="leave-requests">
                    {selectedSegment === "pending" &&
                        (loading ? (
                            <>
                                <SkeletonCard />
                                <SkeletonCard />
                            </>
                        ) : upcoming.length === 0 ? (
                            <p className="no-data">You don't have any upcoming requests.</p>
                        ) : (
                            upcoming.map((req) => (
                                <IonCard className="request-card" key={req.id}>
                                    <IonCardContent className="request-content">
                                        <div className="request-icon-wrapper annual-icon">
                                            <IonIcon icon={calendarOutline} />
                                        </div>
                                        <div className="request-info">
                                            <p className="request-title">{req.leaveType} Leave</p>
                                            <p className="request-date">
                                                {req.startDate} - {req.endDate} ({req.totalDays} Days)
                                            </p>
                                        </div>
                                        <div className={`request-status ${getStatusClass(req.status)}`}>
                                            {req.status}
                                        </div>
                                    </IonCardContent>
                                </IonCard>
                            ))
                        ))}

                    {selectedSegment === "history" &&
                        (loading ? (
                            <>
                                <SkeletonCard />
                                <SkeletonCard />
                            </>
                        ) : filteredHistory.length === 0 ? (
                            <p className="no-data">You don't have any past requests.</p>
                        ) : (
                            filteredHistory.map((req) => (
                                <IonCard className="request-card" key={req.id}>
                                    <IonCardContent className="request-content">
                                        <div className="request-icon-wrapper personal-icon">
                                            <IonIcon icon={personOutline} />
                                        </div>
                                        <div className="request-info">
                                            <p className="request-title">{req.leaveType} Leave</p>
                                            <p className="request-date">
                                                {req.startDate} - {req.endDate} ({req.totalDays} Days)
                                            </p>
                                        </div>
                                        <div className={`request-status ${getStatusClass(req.status)}`}>
                                            {req.status}
                                        </div>
                                    </IonCardContent>
                                </IonCard>
                            ))
                        ))}
                </div>
            </div>

            <IonFab vertical="bottom" horizontal="end" slot="fixed" className="fab-wrapper">
                <IonFabButton className="fab-button" onClick={() => history.push("/leave-form")}>
                    <IonIcon icon={addOutline} />
                </IonFabButton>
            </IonFab>
        </div>
    );
};

export default LeaveHome;
