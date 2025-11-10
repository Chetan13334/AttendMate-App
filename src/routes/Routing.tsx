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
import { homeOutline, documentOutline, personOutline, logOutOutline } from "ionicons/icons";

import Homepage from "../pages/Home";
import History from "../components/History";
import Profile from "../pages/Profile";
import AppHeader from "../components/AppHeader";

interface TabsProps {
  onLogout: () => void;
}

const HomeTabs: React.FC<TabsProps> = ({ onLogout }) => {
  return (
    <IonTabs>
      <AppHeader />
      <IonRouterOutlet>
        <Route exact path="/home" component={Homepage} />
        <Route exact path="/history" component={History} />
        <Route exact path="/profile">
          <Profile onLogout={onLogout} />
        </Route>
        <Route exact path="/">
          <Redirect to="/home" />
        </Route>
      </IonRouterOutlet>

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
  );
};

export default HomeTabs;