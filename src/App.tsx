import React, { useEffect, useState } from "react";
import { IonApp, IonSpinner, setupIonicReact } from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import { IonRouterOutlet } from "@ionic/react";
import { Route, Redirect } from "react-router-dom";

import HomeTabs from "./pages/Routes";

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
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("isLoggedIn");
    setIsLoggedIn(saved === "true");
  }, []);

  const handleLogin = (email: string) => {
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("userEmail", email);
    setIsLoggedIn(true);
    sessionStorage.setItem("isLoggedIn", "true");
    // Redirect to home page after login
    window.location.replace("/home");
  };

  const handleLogout = () => {
    console.log("Logging out...");
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userEmail");
    setIsLoggedIn(false);
  };

  // Reset login state
  setIsLoggedIn(false);

  // Remove session values
  sessionStorage.removeItem("isLoggedIn");
  sessionStorage.removeItem("userEmail"); // ✅ this line is important
  
  // Redirect to root path after logout
  window.location.replace("/");
};

  // ---------- Loading ----------
  if (isLoggedIn === null) {
    return (
      <IonApp>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100vh",
            backgroundColor: "#f4f5f8",
          }}
        >
          <IonSpinner name="crescent" />
        </div>
      </IonApp>
    );
  }

  return (
    <IonApp>
      <IonReactRouter>
        <IonRouterOutlet>
          <Route exact path="/">
            <Redirect to={isLoggedIn ? "/home" : "/login"} />
          </Route>

          <Route exact path="/login">
            {isLoggedIn ? <Redirect to="/home" /> : <Login onLogin={handleLogin} />}
          </Route>

          <Route path="/home">
            {isLoggedIn ? <HomeTabs onLogout={handleLogout} /> : <Redirect to="/login" />}
          </Route>

          <Route path="/profile">
            {isLoggedIn ? <HomeTabs onLogout={handleLogout} /> : <Redirect to="/login" />}
          </Route>

          <Route path="/history">
            {isLoggedIn ? <HomeTabs onLogout={handleLogout} /> : <Redirect to="/login" />}
          </Route>
        </IonRouterOutlet>
      </IonReactRouter>
    </IonApp>
  );
};

export default App;