import React from "react";
import { IonTabBar, IonTabButton, IonIcon, IonLabel } from "@ionic/react";
import { homeOutline, documentOutline, personOutline } from "ionicons/icons";

const BottomTabs: React.FC = () => {
  return (
    <IonTabBar slot="bottom" translucent={true}>

      <IonTabButton tab="home" href="/home" layout="icon-top">
        <IonIcon icon={homeOutline} />
        <IonLabel>Home</IonLabel>
      </IonTabButton>

      <IonTabButton tab="history" href="/history" layout="icon-top">
        <IonIcon icon={documentOutline} />
        <IonLabel>History</IonLabel>
      </IonTabButton>

      <IonTabButton tab="profile" href="/profile" layout="icon-top">
        <IonIcon icon={personOutline} />
        <IonLabel>Profile</IonLabel>
      </IonTabButton>

    </IonTabBar>
  );
};

export default BottomTabs;
