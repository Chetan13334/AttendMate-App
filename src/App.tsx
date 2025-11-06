import React, { useEffect, useState } from "react";
import {
  IonApp,
  IonSpinner,
  setupIonicReact,
} from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";

import Login from "./auth/Login";
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

  // ---------- Restore login from sessionStorage ----------
  useEffect(() => {
    const saved = sessionStorage.getItem("isLoggedIn");
    setIsLoggedIn(saved === "true");
  }, []);

  // ---------- Handlers ----------
  const handleLogin = () => {
    setIsLoggedIn(true);
    sessionStorage.setItem("isLoggedIn", "true");
    // Redirect to home page after login
    window.location.replace("/home");
  };

  const handleLogout = () => {
  console.log("🚪 Logging out... clearing session");

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

  // ---------- Main render ----------
  return (
    <IonApp>
      <IonReactRouter>
        {isLoggedIn ? (
          <HomeTabs onLogout={handleLogout} />
        ) : (
          <Login onLogin={handleLogin} />
        )}
      </IonReactRouter>
    </IonApp>
  );
};

export default App;