import React from "react";
import { IonPage, IonContent } from "@ionic/react";
import Header from "../components/AppHeader";
import LeaveHome from "../components/Leave-Home";


const LeaveReqPage: React.FC = () => {
    return (
        <IonPage>

<Header/>

            <IonContent>
                <LeaveHome />
            </IonContent>

        </IonPage>
    );
};

export default LeaveReqPage;
