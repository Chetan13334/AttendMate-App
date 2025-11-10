import React from "react";
import logo from "../assets/placeholder.png";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonContent,
  IonIcon,
  IonButtons,
  IonButton,
} from "@ionic/react";
import { personCircleOutline } from "ionicons/icons"; 
import CheckIn_CheckOut_Card from "../components/CheckIn_CheckOut";
import EventsSection from "../components/EventsSection";
import Header from "../components/AppHeader";


const Home: React.FC = () => {
  return (
    <IonPage>
      <Header />
      
      <IonContent color="light" style={{ "--background": "#ffffff" }}>
        <div
          style={{
            paddingTop: "var(--ion-safe-area-top, 10px)",
            paddingBottom: "80px",
            minHeight: "100vh",
            backgroundColor: "#ffffff",
          }}
        >
          <CheckIn_CheckOut_Card />
          <EventsSection />
        </div>
      </IonContent>

      
    </IonPage>
  );
};

export default Home;