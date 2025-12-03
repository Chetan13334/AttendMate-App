import React from "react";
import {
  IonTabs,
  IonRouterOutlet,
} from "@ionic/react";
import { Route, Redirect } from "react-router-dom";
import Header from "../components/AppHeader";
import Homepage from "../pages/Home";
import History from "../components/History";
import Profile from "../pages/Profile";
import LeaveReqPage from "../pages/LeaveReqPage";

import BottomTabs from "../components/BottomTabs";

interface TabsProps {
  onLogout: () => void;
}

const Routing: React.FC<TabsProps> = ({ onLogout }) => {
  return (
    <IonTabs>


      <IonRouterOutlet>
        <Route exact path="/home" component={Homepage} />
        <Route exact path="/history" component={History} />
        <Route exact path="/profile">
          <Profile onLogout={onLogout} />
        </Route>
        <Route exact path="/leave-request" component={LeaveReqPage} />
        <Route exact path="/">
          <Redirect to="/home" />
        </Route>
      </IonRouterOutlet>


      <BottomTabs />
    </IonTabs>
  );
};

export default Routing;
