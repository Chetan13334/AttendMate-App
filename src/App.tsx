import React, { useEffect, useState } from "react";
import { IonApp, setupIonicReact } from "@ionic/react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./auth/Login";
import Home from "./pages/Home";
import History from "./pages/History";
import Profile from "./pages/Profile";

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
      <Router>
        <Routes>
          {/* 🔓 Public Route - Login */}
          {!isLoggedIn && (
            <Route path="/login" element={<Login onLogin={handleLogin} />} />
          )}

          {/* 🔒 Protected Routes */}
          {isLoggedIn && (
            <>
              <Route path="/home" element={<Home />} />
              <Route path="/history" element={<History />} />
              <Route path="/profile" element={<Profile onLogout={handleLogout} />} />
            </>
          )}

          {/* 🔁 Default Redirects */}
          <Route
            path="/"
            element={
              isLoggedIn ? <Navigate to="/home" replace /> : <Navigate to="/login" replace />
            }
          />

          {/* 🔁 Catch-all */}
          <Route
            path="*"
            element={
              isLoggedIn ? <Navigate to="/home" replace /> : <Navigate to="/login" replace />
            }
          />
        </Routes>
      </Router>
    </IonApp>
  );
};

export default App;
