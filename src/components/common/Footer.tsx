import React from "react";
import {
  IonFooter,
  IonTabBar,
  IonTabButton,
  IonIcon,
  IonLabel,
} from "@ionic/react";
import {
  homeOutline,
  calendarOutline,
  documentOutline,
  personOutline,
} from "ionicons/icons";

const Footer: React.FC = () => {
  return (
    <IonFooter>
      <IonTabBar slot="bottom" color="light" style={{ borderTop: "1px solid #e0e0e0" }}>
        <IonTabButton tab="home" href="/home">
          <IonIcon icon={homeOutline} />
          <IonLabel>Home</IonLabel>
        </IonTabButton>

        <IonTabButton tab="schedule" href="/schedule">
          <IonIcon icon={calendarOutline} />
          <IonLabel>Schedule</IonLabel>
        </IonTabButton>

        <IonTabButton tab="history" href="/history">
          <IonIcon icon={documentOutline} />
          <IonLabel>History</IonLabel>
        </IonTabButton>

        <IonTabButton tab="profile" href="/profile">
          <IonIcon icon={personOutline} />
          <IonLabel>Profile</IonLabel>
        </IonTabButton>
      </IonTabBar>
    </IonFooter>
  );
};

export default Footer;
