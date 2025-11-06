import React, { useState } from "react";
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon,
  IonPopover,
  IonList,
  IonItem,
} from "@ionic/react";
import { personCircleOutline } from "ionicons/icons";
import Logo from "../assets/main_logo.png";
import ProfileIcon from "../assets/user.png";
import LogoutIcon from "../assets/logout.png";

interface AppHeaderProps {
  title?: string;
}

const AppHeader: React.FC<AppHeaderProps> = ({ title = "AttendMate" }) => {
  const [showPopover, setShowPopover] = useState(false);
  const [popoverEvent, setPopoverEvent] = useState<any>();

  const logout = () => {
    sessionStorage.clear();
    localStorage.clear();
    window.location.href = "/";
  };

  return (
    <IonHeader>
      <IonToolbar>

        {/* ✅ Left: Logo + Title */}
        <IonButtons slot="start">
          <div
            style={{
              display: "flex",
              alignItems: "center",
            }}
          >
            <img
              src={Logo}
              alt="AttendMate"
              height={26}
              width={26}
              style={{
                marginRight: "8px",
                borderRadius: "6px",
                marginLeft: "9px",
              }}
            />

            <IonTitle
              style={{
                fontWeight: 700,
                fontSize: "1.2rem",
                color: "#222",
                padding: 0,
                margin: 0,
                textAlign: "left",
              }}
            >
              {title}
            </IonTitle>
          </div>
        </IonButtons>

        {/* ✅ Right side profile */}
        <IonButtons slot="end">
          <IonButton
            onClick={(e) => {
              setPopoverEvent(e.nativeEvent);
              setShowPopover(true);
            }}
          >
            <IonIcon
              icon={personCircleOutline}
              style={{
                fontSize: "27px",
                color: "#555",
              }}
            />
          </IonButton>
        </IonButtons>

        {/* ✅ Popover */}
        <IonPopover
          event={popoverEvent}
          isOpen={showPopover}
          onDidDismiss={() => setShowPopover(false)}
          style={{
            "--min-width": "150px",
            "--max-width": "150px",
            borderRadius: "10px",
          }}
        >
          <IonList lines="none" style={{ padding: 0, margin: 0 }}>
            <IonItem
              button
              routerLink="/profile"
              onClick={() => setShowPopover(false)}
              style={{ fontSize: "0.8rem", height: "40px" }}
              detail={false}
            >
              <img
                src={ProfileIcon}
                alt="Profile"
                style={{ width: "16px", height: "16px", marginRight: "10px" }}
              />
              View Profile
            </IonItem>

            <IonItem
              button
              onClick={logout}
              style={{ fontSize: "0.8rem", height: "40px" }}
              detail={false}
            >
              <img
                src={LogoutIcon}
                alt="Logout"
                style={{ width: "16px", height: "16px", marginRight: "10px" }}
              />
              Logout
            </IonItem>
          </IonList>
        </IonPopover>

      </IonToolbar>
    </IonHeader>
  );
};

export default AppHeader;
