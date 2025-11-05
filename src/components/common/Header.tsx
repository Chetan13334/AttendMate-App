import React from "react";
import {
  IonHeader,
  IonToolbar,
  IonButtons,
  IonButton,
  IonIcon,
} from "@ionic/react";
import { personCircleOutline } from "ionicons/icons";
import logo from "../../assets/placeholder.png";

const Header: React.FC = () => {
  return (
    <IonHeader>
      <IonToolbar color="light">
        {/* App Logo and Title */}
        <div
          slot="start"
          style={{
            display: "flex",
            alignItems: "center",
            paddingLeft: "16px",
          }}
        >
          <img
            src={logo}
            alt="AttendMate"
            style={{ height: "22px", marginRight: "8px" }}
          />
          <span
            style={{
              fontWeight: "bold",
              fontSize: "18px",
              color: "#333",
            }}
          >
            AttendMate
          </span>
        </div>

        {/* Profile Icon (Logout handled in Profile) */}
        <IonButtons slot="end">
          <IonButton routerLink="/profile">
            <IonIcon
              icon={personCircleOutline}
              style={{ fontSize: "26px", color: "#555" }}
            />
          </IonButton>
        </IonButtons>
      </IonToolbar>
    </IonHeader>
  );
};

export default Header;
