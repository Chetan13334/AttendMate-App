import React from "react";
import {
  IonTabs,
  IonRouterOutlet,
} from "@ionic/react";
import { Route, Redirect } from "react-router-dom";

import Homepage from "./Home";
import History from "./History";
import Profile from "./Profile";
import BottomTabs from "../components/BottomTabs";


interface TabsProps {
  onLogout: () => void;
}

const HomeTabs: React.FC<TabsProps> = ({ onLogout }) => {
  return (
    <>
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

        
        
      </IonTabs>
    </>
  );
};

export default HomeTabs;