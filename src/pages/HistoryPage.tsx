import React from "react";
import { IonPage, IonContent } from "@ionic/react";
import AppHeader from "../components/AppHeader";
import History from "../components/History";

const HistoryPage: React.FC = () => {
  return (
    <IonPage>
      <AppHeader title="Attendance History" />
      <IonContent fullscreen scrollY={true} color="light">
        <History />
      </IonContent>
    </IonPage>
  );
};

export default HistoryPage;
