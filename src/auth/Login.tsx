import React, { useState } from "react";
import {
  IonPage,
  IonContent,
  IonCard,
  IonCardContent,
  IonButton,
  IonInput,
  IonToast,
  IonSpinner,
} from "@ionic/react";

import { db } from "../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

interface LoginProps {
  onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const handleLogin = async () => {
    if (!email || !password) {
      setToastMessage("Please enter email and password");
      setShowToast(true);
      return;
    }

    setLoading(true);
    try {
      // ✅ Query Firestore for matching email & password
      const q = query(
        collection(db, "Employee_Details"),
        where("Email", "==", email),
        where("Password", "==", password)
      );

      const snapshot = await getDocs(q);

      if (!snapshot.empty) {

        setToastMessage("Login successful!");
        setShowToast(true);

        // ✅ Store login session info
        sessionStorage.setItem("isLoggedIn", "true");
        sessionStorage.setItem("userEmail", email);

        setTimeout(() => onLogin(), 1000);
      } else {
        setToastMessage("Invalid email or password");
        setShowToast(true);
      }
    } catch (error) {
      console.error("Error during login:", error);
      setToastMessage("Login failed. Please try again.");
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonPage>
      <IonContent fullscreen style={{ "--background": "#fafafa" }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            padding: "20px",
            backgroundColor: "#fafafa",
          }}
        >
          <h1
            style={{
              fontFamily: "'Billabong', cursive",
              fontSize: "50px",
              color: "#262626",
              margin: "0 0 40px",
            }}
          >
            AttendMate
          </h1>


          <IonCard
            style={{
              width: "100%",
              maxWidth: "350px",
              borderRadius: "8px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              border: "1px solid #dbdbdb",
              backgroundColor: "#ffffff",
              padding: "10px 0",
            }}
          >
            <IonCardContent style={{ padding: "40px 40px 20px" }}>
              {/* Email Input */}
              <IonInput
                type="email"
                placeholder="Email"
                value={email}
                onIonChange={(e) => setEmail(e.detail.value ?? "")}
                style={{
                  "--padding-start": "12px",
                  "--padding-end": "12px",
                  "--padding-top": "12px",
                  "--padding-bottom": "12px",
                  fontSize: "14px",
                  border: "1px solid #dbdbdb",
                  borderRadius: "6px",
                  color: "#262626",
                  height: "38px",
                  marginBottom: "6px",
                }}
              />

              {/* Password Input */}
              <IonInput
                type="password"
                placeholder="Password"
                value={password}
                onIonChange={(e) => setPassword(e.detail.value ?? "")}
                style={{
                  "--padding-start": "12px",
                  "--padding-end": "12px",
                  "--padding-top": "12px",
                  "--padding-bottom": "12px",
                  fontSize: "14px",
                  border: "1px solid #dbdbdb",
                  borderRadius: "6px",
                  color: "#262626",
                  height: "38px",
                  marginBottom: "12px",
                }}
              />

              {/* Login Button */}
              <IonButton
                expand="block"
                onClick={handleLogin}
                disabled={loading}
                style={{
                  "--border-radius": "8px",
                  height: "44px",
                  fontSize: "14px",
                  fontWeight: 600,
                  "--background": "#0095f6",
                  "--color": "#ffffff",
                  margin: "8px 0",
                }}
              >
                {loading ? <IonSpinner name="dots" /> : "Log In"}
              </IonButton>
            </IonCardContent>
          </IonCard>

          <div
            style={{
              marginTop: "10px",
              padding: "20px",
              width: "100%",
              maxWidth: "350px",
              backgroundColor: "#ffffff",
              border: "1px solid #dbdbdb",
              borderRadius: "8px",
              textAlign: "center",
              fontSize: "14px",
              color: "#262626",
            }}
          >
            Don’t have an account?{" "}
            <span style={{ color: "#0095f6", fontWeight: 600 }}>Contact HR</span>
          </div>

          {/* Toast */}
          <IonToast
            isOpen={showToast}
            message={toastMessage}
            duration={2000}
            position="top"
            onDidDismiss={() => setShowToast(false)}
            color={toastMessage.includes("successful") ? "success" : "danger"}
            style={{ "--border-radius": "8px" }}
          />

          {/* Autofill Fix */}
          <style>
            {`
              input:-webkit-autofill,
              input:-webkit-autofill:hover,
              input:-webkit-autofill:focus,
              textarea:-webkit-autofill,
              textarea:-webkit-autofill:hover,
              textarea:-webkit-autofill:focus,
              select:-webkit-autofill,
              select:-webkit-autofill:hover,
              select:-webkit-autofill:focus {
                -webkit-box-shadow: 0 0 0px 1000px #ffffff inset !important;
                -webkit-text-fill-color: #262626 !important;
                transition: background-color 5000s ease-in-out 0s !important;
                border: 1px solid #dbdbdb !important;
                border-radius: 6px !important;
              }

              ion-input input {
                background-color: #ffffff !important;
                color: #262626 !important;
                border: 1px solid #dbdbdb !important;
                border-radius: 6px !important;
              }
            `}
          </style>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Login;
