<<<<<<< HEAD
import { Redirect, Route } from 'react-router-dom';
import {
  IonApp,
  IonRouterOutlet,
  setupIonicReact,
  IonTabs,
  IonTabBar,
  IonTabButton,
  IonIcon,
  IonLabel
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import Home from './pages/Home';
import { Login } from './auth/Login';
import CheckInPage from './pages/CheckInPage';
import { home, calendar, person, time } from 'ionicons/icons';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables */
import './theme/variables.css';

setupIonicReact();

const App: React.FC = () => (
  <IonApp>
    <IonReactRouter>
      <IonTabs>
        {/* All app routes */}
        <IonRouterOutlet>
          {/* Login route */}
          <Route exact path="/login" component={Login} />

          {/* Main routes */}
          <Route exact path="/home" component={Home} />
          <Route exact path="/checkin-checkout" component={CheckInPage} />

          {/* Redirects */}
          <Route exact path="/">
            <Redirect to="/login" />
          </Route>
        </IonRouterOutlet>

        {/* Bottom Navigation Bar */}
        <IonTabBar slot="bottom">
          <IonTabButton tab="home" href="/home">
            <IonIcon icon={home} />
            <IonLabel>Home</IonLabel>
          </IonTabButton>

          <IonTabButton tab="checkin-checkout" href="/checkin-checkout">
            <IonIcon icon={time} />
            <IonLabel>Check In/Out</IonLabel>
          </IonTabButton>

          <IonTabButton tab="schedule" href="/home">
            <IonIcon icon={calendar} />
            <IonLabel>Schedule</IonLabel>
          </IonTabButton>

          <IonTabButton tab="profile" href="/home">
            <IonIcon icon={person} />
            <IonLabel>Profile</IonLabel>
          </IonTabButton>
        </IonTabBar>
      </IonTabs>
    </IonReactRouter>
  </IonApp>
);
=======
import React, { useEffect, useState } from "react";
import { IonApp, setupIonicReact } from "@ionic/react";
import Login from "./auth/Login";
import Home from "./pages/Home";

import "@ionic/react/css/core.css";
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";
import "@ionic/react/css/padding.css";
import "@ionic/react/css/float-elements.css";
import "@ionic/react/css/text-alignment.css";
import "@ionic/react/css/text-transformation.css";
import "@ionic/react/css/flex-utils.css";
import "@ionic/react/css/display.css";
import "./theme/variables.css";

setupIonicReact();

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // ✅ Check sessionStorage on first load (refresh handling)
  useEffect(() => {
    const savedLogin = sessionStorage.getItem("isLoggedIn");
    if (savedLogin === "true") {
      console.log("🔁 Restoring previous session...");
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogin = () => {
    console.log("✅ Logged in successfully");
    setIsLoggedIn(true);
    sessionStorage.setItem("isLoggedIn", "true"); // ✅ persist login
  };

  const handleLogout = () => {
    console.log("🚪 Logged out, clearing session");
    setIsLoggedIn(false);
    sessionStorage.removeItem("isLoggedIn"); // ✅ clear on logout
  };

  return (
    <IonApp>
      {isLoggedIn ? (
        <Home onLogout={handleLogout} />
      ) : (
        <Login onLogin={handleLogin} />
      )}
    </IonApp>
  );
};
>>>>>>> aacc16dc946bc83e6a3591f5ab47e624b821bc90

export default App;
