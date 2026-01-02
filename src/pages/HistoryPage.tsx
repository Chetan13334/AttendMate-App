import React from "react";
import { IonPage, IonContent } from "@ionic/react";
import Header from "../components/AppHeader";
import History from "../components/History";

const HistoryPage: React.FC = () => {
  return (
    <IonPage>
      <Header/>
      <IonContent>
        
          <History />
        
      </IonContent>
    </IonPage>
  );
};

export default HistoryPage;
