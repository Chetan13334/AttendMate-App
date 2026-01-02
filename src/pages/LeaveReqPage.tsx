import React from "react";
import { IonPage, IonContent } from "@ionic/react";
import Header from "../components/AppHeader";
import LeaveHome from "../components/Leave-Home";
import AppRefresher from "../components/Models/AppRefresher";

const LeaveReqPage: React.FC = () => {
    const refreshHomeData = async () => {
        window.location.reload();
      };
    return (
        <IonPage>

<Header/>

            <IonContent>
            <AppRefresher onRefresh={refreshHomeData} />
                <LeaveHome />
            </IonContent>

        </IonPage>
    );
};

export default LeaveReqPage;
