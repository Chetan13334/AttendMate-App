import React from "react";
import { IonPage, IonContent } from "@ionic/react";
import Header from "../components/AppHeader";
import CheckIn_CheckOut_Card from "../components/CheckIn_CheckOut";
import EventsSection from "../components/EventsSection";

const Home: React.FC = () => {
  return (
    <IonPage>
      <Header />

      <IonContent
        color="light"
        scrollY={true}
        forceOverscroll={false}
        style={{
          "--background": "#ffffff",
          "--offset-bottom": "0px",
          "--padding-bottom": "0px",
          "--keyboard-offset": "0px",
          overscrollBehavior: "none",
          paddingBottom: "3px", 
          marginBottom: "0px",
        }}
      >
        <div
          style={{
            backgroundColor: "#ffffff",
            minHeight: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
            padding: "var(--ion-safe-area-top, 10px) 0 15px",
          }}
        >
          <CheckIn_CheckOut_Card />
          <EventsSection />

        
          <div style={{ height: "3px" }}></div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Home;
