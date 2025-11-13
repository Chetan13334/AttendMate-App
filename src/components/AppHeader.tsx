import React, { useState, useEffect } from "react";
import {
  IonHeader,
  IonToolbar,
  IonPopover,
  IonList,
  IonItem,
  IonSpinner,
  IonIcon
} from "@ionic/react";

import { personCircleOutline } from "ionicons/icons";
import { db } from "../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

import Logo from "../assets/main_logo.png";
import ProfileIcon from "../assets/user.png";
import LogoutIcon from "../assets/logout.png";

import "../components/AppHeader.css";

const AppHeader: React.FC<{ title?: string }> = ({ title = "AttendMate" }) => {
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [loadingPhoto, setLoadingPhoto] = useState(true);
  const [photoError, setPhotoError] = useState(false);

  const [showPopover, setShowPopover] = useState(false);
  const [popoverEvent, setPopoverEvent] = useState<any>(null);

  const userEmail = localStorage.getItem("userEmail");

  useEffect(() => {
    const fetchPhoto = async () => {
      if (!userEmail) return;
      try {
        const q = query(
          collection(db, "Employee_Details"),
          where("Email", "==", userEmail)
        );
        const snap = await getDocs(q);

        if (!snap.empty && snap.docs[0].data().Photo) {
          setPhotoUrl(snap.docs[0].data().Photo as string);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingPhoto(false);
      }
    };

    fetchPhoto();
  }, [userEmail]);

  const logout = () => {
    sessionStorage.clear();
    localStorage.clear();
    window.location.href = "/";
  };

  return (
    <IonHeader>
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
            <IonIcon icon={personCircleOutline} className="avatar-size" />
          )}
        </div>

      </IonToolbar>

      
      <IonPopover
        isOpen={showPopover}
        event={popoverEvent}
        onDidDismiss={() => setShowPopover(false)}
        backdropDismiss={true}
        showBackdrop={true}
        side="bottom"
        alignment="end"
        className="profile-popover"
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
              logout();
            }}
          >
            <img src={LogoutIcon} className="menu-icon" />
            Logout
          </IonItem>

        </IonList>
      </IonPopover>
    </IonHeader>
  );
};

export default AppHeader;
