import React from "react";
import {
  IonTabs,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonIcon,
  IonLabel,
} from "@ionic/react";
import { Route, Redirect } from "react-router-dom";
import { homeOutline, documentOutline, personOutline } from "ionicons/icons";

import Homepage from "./Home";
import History from "./History";
import Profile from "./Profile";
import Header from "../components/common/Header"; // ✅ Import Header component

interface TabsProps {
  onLogout: () => void;
}

const HomeTabs: React.FC<TabsProps> = ({ onLogout }) => {
  return (
    <>
      {/* ✅ Common Header visible on every tab */}
      <Header />

      <IonTabs>
        <IonRouterOutlet>
          <Route exact path="/home">
            <Homepage />
          </Route>

          <Route exact path="/history">
            <History />
          </Route>

          <Route exact path="/profile">
            <Profile onLogout={onLogout} />
          </Route>

          {/* Redirect default route to /home */}
          <Route exact path="/">
            <Redirect to="/home" />
          </Route>
        </IonRouterOutlet>

        {/* ✅ Footer Navigation (Tab Bar) */}
        <IonTabBar slot="bottom" color="light">
          <IonTabButton tab="home" href="/home">
            <IonIcon icon={homeOutline} />
            <IonLabel>Home</IonLabel>
          </IonTabButton>

          <IonTabButton tab="history" href="/history">
            <IonIcon icon={documentOutline} />
            <IonLabel>History</IonLabel>
          </IonTabButton>

          <IonTabButton tab="profile" href="/profile">
            <IonIcon icon={personOutline} />
            <IonLabel>Profile</IonLabel>
          </IonTabButton>
        </IonTabBar>
      </IonTabs>
    </>
  );
};

export default HomeTabs;
