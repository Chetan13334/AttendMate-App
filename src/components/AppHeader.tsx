import React, { useState, useEffect } from "react";
import {
  IonToolbar,
  IonPopover,
  IonList,
  IonItem,
  IonSpinner,
  IonIcon
} from "@ionic/react";

import { personCircleOutline } from "ionicons/icons";

import Logo from "../assets/main_logo.png";
import ProfileIcon from "../assets/user.png";
import LogoutIcon from "../assets/logout.png";

import "../theme/components/AppHeader.css";
import { fetchHeaderUserData } from "../Services/HeaderService";
import ConfirmLogoutPopup from "./ConfirmLogoutPopup";

const AppHeader: React.FC<{ title?: string }> = ({ title = "AttendMate" }) => {
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [loadingPhoto, setLoadingPhoto] = useState(true);
  const [photoError, setPhotoError] = useState(false);

  const [showPopover, setShowPopover] = useState(false);
  const [popoverEvent, setPopoverEvent] = useState<any>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const userEmail = localStorage.getItem("userEmail");

  useEffect(() => {
    const loadUserData = async () => {
      if (!userEmail) return;

      const data = await fetchHeaderUserData(userEmail);
      setPhotoUrl(data.photo);
      setUserName(data.name);

      setLoadingPhoto(false);
    };

    loadUserData();
  }, [userEmail]);

  const logout = () => {
    sessionStorage.clear();
    localStorage.clear();
    window.location.href = "/";
  };

  const getInitial = () => {
    if (userName && userName.trim().length > 0) {
      return userName.trim().charAt(0).toUpperCase();
    }
    if (userEmail && userEmail.trim().length > 0) {
      return userEmail.trim().charAt(0).toUpperCase();
    }
    return "U";
  };

  return (
    <IonToolbar className="app-header-toolbar">

      <div slot="start" className="header-left">
        <img src={Logo} alt="Logo" className="app-logo" />
        <h1 className="app-title">{title}</h1>
      </div>

      <div
        slot="end"
        className="avatar-trigger"
        onClick={(e) => {
          setPopoverEvent(e.nativeEvent);
          setShowPopover(true);
        }}
      >
        {loadingPhoto ? (
          <IonSpinner name="dots" color="medium" className="avatar-size" />
        ) : photoUrl && !photoError ? (
          <img
            src={photoUrl}
            alt="Profile"
            className="avatar-size"
            onError={() => setPhotoError(true)}
          />
        ) : (
          <div className="avatar-fallback">
            {getInitial()}
          </div>
        )}
      </div>

      <IonPopover
        isOpen={showPopover}
        event={popoverEvent}
        onDidDismiss={() => setShowPopover(false)}
        backdropDismiss={true}
        showBackdrop={true}
        side="bottom"
        alignment="end"
        className="profile-popover"
        size="auto"
        arrow={false}
      >
        <IonList lines="none">

          <IonItem
            button
            routerLink="/profile"
            detail={false}
            onClick={() => setShowPopover(false)}
          >
            <img src={ProfileIcon} className="menu-icon" />
            View Profile
          </IonItem>

          <IonItem
            button
            detail={false}
            onClick={() => {
              setShowPopover(false);
              setShowLogoutConfirm(true);
            }}
          >
            <img src={LogoutIcon} className="menu-icon" />
            Logout
          </IonItem>

        </IonList>
      </IonPopover>

      <ConfirmLogoutPopup
        isOpen={showLogoutConfirm}
        onConfirm={logout}
        onCancel={() => setShowLogoutConfirm(false)}
      />

    </IonToolbar>
  );
};

export default AppHeader;
