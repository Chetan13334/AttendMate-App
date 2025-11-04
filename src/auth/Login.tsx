import React, { useState } from "react";
import {
  IonPage,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonButton,
  IonInput,
  IonItem,
  IonLabel,
  IonIcon,
  IonToast,
  useIonRouter,
} from "@ionic/react";
import { personCircle, lockClosed } from "ionicons/icons";
import AppHeader from "../components/AppHeader";
// @ts-ignore
import { db } from "../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

export const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const router = useIonRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      setToastMessage("Please enter both email and password");
      setShowToast(true);
      return;
    }

    setLoading(true);
    try {
      const employeeCollection = collection(db, "Employee_Details");
      const q = query(
        employeeCollection,
        where("Email", "==", email),
        where("Password", "==", password)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        // Store the user's email in localStorage when they log in
        localStorage.setItem('userEmail', email);
        
        setToastMessage("Login successful!");
        setShowToast(true);
        setTimeout(() => {
          router.push("/home");
        }, 1500);
      } else {
        setToastMessage("Invalid email or password");
        setShowToast(true);
      }
    } catch (error: any) {
      let errorMessage = "Login failed. Please try again.";
      if (error.code === "permission-denied") {
        errorMessage = "Access denied. Please check Firebase Firestore rules.";
      } else if (error.code === "unavailable") {
        errorMessage = "Firebase unavailable. Check your connection.";
      }
      
      setToastMessage(errorMessage);
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonPage>
      <AppHeader title="AttendMate"   />
      
      <IonContent
        fullscreen
        className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-500 to-blue-600"
      >
        <IonCard className="w-[70%] max-w-sm rounded-3xl shadow-2xl bg-white/95 backdrop-blur-md">
          <IonCardHeader className="text-center p-6">
            <IonCardTitle className="text-xl font-bold text-gray-900">
              Welcome To Scaler Tech Hub
            </IonCardTitle>
            <IonCardSubtitle className="text-gray-600 mt-1 text-sm">
              Sign in to continue
            </IonCardSubtitle>
          </IonCardHeader>

          <IonCardContent className="space-y-5">
            <IonItem lines="none" className="rounded-xl border border-gray-300 focus-within:border-indigo-500">
              <IonIcon icon={personCircle} slot="start" color="medium" />
              <IonLabel position="stacked" className="text-sm font-medium text-gray-700">
                Email
              </IonLabel>
              <IonInput
                type="email"
                placeholder="Enter your email"
                className="text-gray-900"
                value={email}
                onIonChange={(e) => setEmail(e.detail.value!)}
              />
            </IonItem>

            <IonItem lines="none" className="rounded-xl border border-gray-300 focus-within:border-indigo-500">
              <IonIcon icon={lockClosed} slot="start" color="medium" />
              <IonLabel position="stacked" className="text-sm font-medium text-gray-700">
                Password
              </IonLabel>
              <IonInput
                type="password"
                placeholder="Enter your password"
                className="text-gray-900"
                value={password}
                onIonChange={(e) => setPassword(e.detail.value!)}
              />
            </IonItem>

            <div className="mt-6 space-y-3">
              <IonButton
                expand="block"
                color="primary"
                className="rounded-xl text-base font-medium shadow-md"
                onClick={handleLogin}
                disabled={loading}
              >
                {loading ? "Signing In..." : "Sign In"}
              </IonButton>

              <IonButton fill="clear" color="medium" className="w-full text-sm font-medium hover:text-indigo-600">
                Forgot Password?
              </IonButton>
            </div>

            <div className="text-center text-gray-600 text-sm mt-4">
              Don't have an account?{" "}
              <span className="text-indigo-600 font-semibold">Sign Up</span>
            </div>
          </IonCardContent>
        </IonCard>

        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={2000}
        />
      </IonContent>
    </IonPage>
  );
};

export default Login;