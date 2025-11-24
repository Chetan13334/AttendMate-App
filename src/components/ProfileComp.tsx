import React, { useEffect, useState } from "react";
import { IonIcon, IonAlert } from "@ionic/react";
import {
  pencilOutline,
  settingsOutline,
  helpCircleOutline,
  logOutOutline,
} from "ionicons/icons";

import Skeleton from "./Skeleton";
import "../theme/components/Profile.css";
import ConfirmLogoutPopup from "./ConfirmLogoutPopup";

import { fetchUserProfile } from "../Services/ProfileService";

interface ProfileComProps {
  onLogout: () => void;
}

const ProfileCom: React.FC<ProfileComProps> = ({ onLogout }) => {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);
  const [photoError, setPhotoError] = useState(false);

  const userEmail = localStorage.getItem("userEmail");

  useEffect(() => {
    const loadData = async () => {
      if (!userEmail) return;
      const data = await fetchUserProfile(userEmail);
      setUserData(data);
      setLoading(false);
    };
    loadData();
  }, [userEmail]);

  const getInitial = () => {
    if (userData?.Name?.trim()) {
      return userData.Name.trim().split(" ")[0].charAt(0).toUpperCase();
    }
    if (userData?.Email?.trim()) {
      return userData.Email.trim().charAt(0).toUpperCase();
    }
    return "U";
  };

  return (
    <div className="profile-container">

      {loading ? (
        <div className="skeleton-center">
          <Skeleton width="110px" height="110px" borderRadius="50%" />
          <Skeleton width="160px" height="22px" />
          <Skeleton width="200px" height="15px" />

          <div className="profile-info-box">
            <Skeleton width="80px" height="13px" />
            <Skeleton width="120px" height="15px" />
          </div>

          <div className="profile-options">
            {[...Array(3)].map((_, idx) => (
              <div key={idx} className="profile-option-item">
                <div className="profile-option-left">
                  <Skeleton width="20px" height="20px" />
                  <Skeleton width="120px" height="15px" />
                </div>
                <Skeleton width="18px" height="18px" />
              </div>
            ))}
          </div>

          <div className="logout-section">
            <div className="logout-left">
              <Skeleton width="20px" height="20px" />
              <Skeleton width="80px" height="15px" />
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="profile-photo-wrapper">
            {userData?.Photo &&
              !photoError &&
              !userData.Photo.includes("placehold.co") ? (
              <img
                src={userData.Photo}
                alt="Profile"
                className="profile-photo"
                onError={() => setPhotoError(true)}
              />
            ) : (
              <span>{getInitial()}</span>
            )}
          </div>

          <h2 className="profile-name">{userData?.Name || "Unknown User"}</h2>

          <p className="profile-email">
            {userData?.Email || "No email found"}
          </p>

          <div className="profile-info-box">
            <p className="profile-info-title">Date Joined</p>
            <p className="profile-info-value">
              {userData?.DateOfJoining || "Not Available"}
            </p>
          </div>

          <div className="profile-options">
            {[
              { icon: pencilOutline, label: "Edit Profile Details" },
              { icon: settingsOutline, label: "Settings" },
              { icon: helpCircleOutline, label: "Help & Support" },
            ].map((item, idx) => (
              <div
                key={idx}
                className="profile-option-item"
                onClick={() => alert(`${item.label} (Coming soon...)`)}
              >
                <div className="profile-option-left">
                  <IonIcon
                    icon={item.icon}
                    className="profile-option-icon"
                  />
                  <span className="profile-option-label">{item.label}</span>
                </div>
                <span className="profile-option-arrow">›</span>
              </div>
            ))}
          </div>

          <div
            className="logout-section"
            onClick={() => setShowLogoutAlert(true)}
          >
            <div className="logout-left">
              <IonIcon icon={logOutOutline} className="logout-icon" />
              <span className="logout-text">Log Out</span>
            </div>
          </div>

          <ConfirmLogoutPopup
            isOpen={showLogoutAlert}
            onConfirm={onLogout}
            onCancel={() => setShowLogoutAlert(false)}
          />
        </>
      )}
    </div>
  );
};

export default ProfileCom;
