import React from "react";
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent } from "@ionic/react";

const History: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="light">
          <IonTitle>History</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding" style={{ background: "#fff" }}>
        <h2>📅 History Page</h2>
        <p>Attendance history and logs will be displayed here.</p>
      </IonContent>
    </IonPage>
  );
};

export default History;
