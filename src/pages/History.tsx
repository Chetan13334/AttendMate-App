import React from "react";
import { IonPage, IonContent } from "@ionic/react";
import Header from "../components/AppHeader";
import BottomTabs from "../components/BottomTabs";
import HistoryCom from "../components/History";

const History: React.FC = () => {
  return (
    <IonPage>
      <Header />
      <IonContent fullscreen style={{ "--background": "#f5f7fa" }}>
        <HistoryCom />
      </IonContent>
      <BottomTabs />
    </IonPage>
  );
};

export default History;
