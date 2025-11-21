import React, { useEffect, useState } from "react";
import { IonPage, IonContent, IonIcon, IonAlert } from "@ionic/react";
import {
  pencilOutline,
  settingsOutline,
  helpCircleOutline,
  logOutOutline,
  mailOutline,
} from "ionicons/icons";
import { db } from "../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import Header from "../components/AppHeader";
import Skeleton from "../components/Skeleton";

interface ProfileProps {
  onLogout: () => void;
}

const Profile: React.FC<ProfileProps> = ({ onLogout }) => {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);
  const [photoError, setPhotoError] = useState(false);

  const userEmail = localStorage.getItem("userEmail");

  if (!userEmail) {
    return (
      <IonPage>
        
        <IonContent>
          <div className="centered">
            <p>Not logged in. Redirecting...</p>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!userEmail) return;
      try {
        const q = query(
          collection(db, "Employee_Details"),
          where("Email", "==", userEmail)
        );
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          setUserData(snapshot.docs[0].data());
        }
      } catch (err) {
        console.error("Error fetching user profile:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUserDetails();
  }, [userEmail]);

  const handlePhotoError = () => {
    setPhotoError(true);
  };

  // ✅ FIXED LOGOUT FUNCTION (Safe logout)
  const logout = () => {
    try {
      sessionStorage.clear();
      localStorage.clear();
      window.location.href = "/";
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return (
    <IonPage>
      <Header />

      <IonContent style={{ "--background": "#ffffff" }}>
        {loading ? (
          <div style={{ padding: "30px 20px", textAlign: "center" }}>
            <Skeleton
              width="110px"
              height="110px"
              borderRadius="50%"
              style={{ margin: "0 auto 20px" }}
            />

            <Skeleton
              width="160px"
              height="22px"
              style={{ margin: "10px auto 2px" }}
            />
            <Skeleton
              width="200px"
              height="15px"
              style={{ margin: "0 auto 20px" }}
            />

            <div
              style={{
                borderTop: "1px solid #e5e7eb",
                borderBottom: "1px solid #e5e7eb",
                padding: "15px 0",
                marginBottom: "25px",
              }}
            >
              <Skeleton
                width="80px"
                height="13px"
                style={{ margin: "0 auto 6px" }}
              />
              <Skeleton
                width="120px"
                height="15px"
                style={{ margin: "6px auto 0" }}
              />
            </div>

            <div
              style={{
                width: "100%",
                maxWidth: "360px",
                margin: "0 auto",
                textAlign: "left",
              }}
            >
              {[...Array(3)].map((_, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "14px 10px",
                    borderBottom: "1px solid #f1f1f1",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <Skeleton
                      width="20px"
                      height="20px"
                      style={{ marginRight: "12px" }}
                    />
                    <Skeleton width="120px" height="15px" />
                  </div>
                  <Skeleton width="18px" height="18px" />
                </div>
              ))}
            </div>

            <div
              style={{
                marginTop: "30px",
                width: "100%",
                maxWidth: "360px",
                padding: "14px 10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", alignItems: "center" }}>
                <Skeleton
                  width="20px"
                  height="20px"
                  style={{ marginRight: "10px" }}
                />
                <Skeleton width="80px" height="15px" />
              </div>
            </div>
          </div>
        ) : (
          <div style={{ padding: "30px 20px", textAlign: "center" }}>
            <div
              style={{
                width: "110px",
                height: "110px",
                background: "linear-gradient(135deg, #007bff, #00c6ff)",
                borderRadius: "50%",
                margin: "0 auto 20px",
                color: "#fff",
                fontSize: "42px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                boxShadow: "0 6px 14px rgba(0, 123, 255, 0.25)",
                overflow: "hidden",
              }}
            >
              {userData?.Photo && !photoError ? (
                <img
                  src={userData.Photo}
                  alt="Profile"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                  onError={handlePhotoError}
                />
              ) : (
                <span>
                  {userData?.Name
                    ? userData.Name.charAt(0).toUpperCase()
                    : "U"}
                </span>
              )}
            </div>

            <h2
              style={{
                margin: "10px 0 2px",
                fontSize: "22px",
                fontWeight: 700,
                color: "#1a1a1a",
              }}
            >
              {userData?.Name || "Unknown User"}
            </h2>
            <p
              style={{
                color: "#666",
                fontSize: "15px",
                marginBottom: "20px",
              }}
            >
              {userData?.Email || "No email found"}
            </p>

            <div
              style={{
                borderTop: "1px solid #e5e7eb",
                borderBottom: "1px solid #e5e7eb",
                padding: "15px 0",
                marginBottom: "25px",
              }}
            >
              <p
                style={{ color: "#999", fontSize: "13px", margin: "0 0 6px" }}
              >
                Date Joined
              </p>
              <p
                style={{
                  color: "#000",
                  fontWeight: 600,
                  fontSize: "15px",
                  margin: 0,
                }}
              >
                {userData?.DateOfJoining || "Not Available"}
              </p>
            </div>

            <div
              style={{
                width: "100%",
                maxWidth: "360px",
                margin: "0 auto",
                textAlign: "left",
              }}
            >
              {[
                {
                  icon: pencilOutline,
                  label: "Edit Profile Details",
                  color: "#333",
                },
                { icon: settingsOutline, label: "Settings", color: "#333" },
                {
                  icon: helpCircleOutline,
                  label: "Help & Support",
                  color: "#333",
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "14px 10px",
                    borderBottom: "1px solid #f1f1f1",
                    cursor: "pointer",
                  }}
                  onClick={() => alert(`${item.label} (Coming soon...)`)}
                >
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <IonIcon
                      icon={item.icon}
                      style={{
                        fontSize: "20px",
                        marginRight: "12px",
                        color: "#007bff",
                      }}
                    />
                    <span style={{ fontSize: "15px", color: item.color }}>
                      {item.label}
                    </span>
                  </div>
                  <span style={{ color: "#bbb", fontSize: "18px" }}>›</span>
                </div>
              ))}
            </div>

            <div
              style={{
                marginTop: "30px",
                width: "100%",
                maxWidth: "360px",
                padding: "14px 10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                color: "#d9534f",
                cursor: "pointer",
              }}
              onClick={() => setShowLogoutAlert(true)}
            >
              <div style={{ display: "flex", alignItems: "center" }}>
                <IonIcon
                  icon={logOutOutline}
                  style={{
                    fontSize: "20px",
                    marginRight: "10px",
                    color: "#d9534f",
                  }}
                />
                <span style={{ fontSize: "15px", fontWeight: 600 }}>
                  Log Out
                </span>
              </div>
            </div>

            {/* FIXED LOGOUT ALERT */}
            <IonAlert
              isOpen={showLogoutAlert}
              header="Confirm Logout"
              message="Are you sure you want to log out?"
              buttons={[
                { text: "Cancel", role: "cancel" },
                {
                  text: "Logout",
                  role: "confirm",
                  handler: () => {
                    try {
                      if (typeof onLogout === "function") onLogout();
                    } catch (e) {
                      console.warn(e);
                    }
                    logout();
                  },
                },
              ]}
              onDidDismiss={() => setShowLogoutAlert(false)}
            />
          </div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Profile;
