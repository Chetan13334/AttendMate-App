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
import { personCircleOutline } from "ionicons/icons"; // ✅ Removed logout icon
import AttendanceCard from "../components/AttendanceCard";
import EventsSection from "../components/EventsSection";
import Header from "../components/AppHeader";
import BottomTabs from "../components/BottomTabs";


import Footer from "../components/common/Footer"; // ✅ import Footer

const Home: React.FC = () => {
  return (
    <IonPage>
      <Header />


      {/* ✅ FIXED CONTENT AREA */}
      <IonContent color="light" style={{ "--background": "#ffffff" }}>
        <div
          style={{
            paddingTop: "var(--ion-safe-area-top, 20px)",
            paddingBottom: "80px", 
            paddingBottom: "80px", // ✅ Ensures footer visibility
            minHeight: "100vh",
            backgroundColor: "#ffffff",
          }}
        >
          <AttendanceCard />
          <EventsSection />
        </div>
      </IonContent>

      <BottomTabs />
      {/* ✅ FOOTER */}
      {/* <Footer /> */}
    </IonPage>
  );
};

export default Home;
