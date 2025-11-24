import React, { useState, useRef, useEffect } from "react";
import {
  IonPage,
  IonContent,
  IonToast,
  IonSpinner,
  IonIcon,
  IonButton,
} from "@ionic/react";
import {
  eyeOutline,
  eyeOffOutline,
  mailOutline,
  lockClosedOutline,
} from "ionicons/icons";
import { db } from "../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import "../theme/components/Login.css";
import Logo from "../assets/main_logo.png";

interface LoginProps {
  onLogin: (email: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastColor, setToastColor] = useState<"danger" | "success">("danger");
  const [showToast, setShowToast] = useState(false);

  const emailRef = useRef(email);
  const passwordRef = useRef(password);
  const contentRef = useRef<HTMLIonContentElement>(null);


  const scrollUpForPassword = () => {
    setTimeout(() => {
      contentRef.current?.scrollToPoint(0, 220, 300); 
    }, 100);
  };

  useEffect(() => {
    const handleKeyboardShow = () => {
      setTimeout(() => {
        contentRef.current?.scrollToPoint(0, 100, 300);
      }, 100);
    };

    const handleKeyboardHide = () => {
      contentRef.current?.scrollToTop(300);
    };

    window.addEventListener("keyboardWillShow", handleKeyboardShow);
    window.addEventListener("keyboardWillHide", handleKeyboardHide);

    return () => {
      window.removeEventListener("keyboardWillShow", handleKeyboardShow);
      window.removeEventListener("keyboardWillHide", handleKeyboardHide);
    };
  }, []);

  const handleLogin = async () => {
    const trimmedEmail = emailRef.current.trim();
    const trimmedPassword = passwordRef.current.trim();

    if (!trimmedEmail || !trimmedPassword) {
      setToastMessage("Please enter email and password");
      setToastColor("danger");
      setShowToast(true);
      return;
    }

    setLoading(true);

    try {
      const q = query(
        collection(db, "Employee_Details"),
        where("Email", "==", trimmedEmail),
        where("Password", "==", trimmedPassword)
      );
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        localStorage.setItem("userEmail", trimmedEmail);
        localStorage.setItem("isLoggedIn", "true");

        setToastMessage("Login successful!");
        setToastColor("success");
        setShowToast(true);

        setTimeout(() => {
          setLoading(false);
          window.location.href = "/home";
        }, 800);
      } else {
        setToastMessage("Invalid email or password");
        setToastColor("danger");
        setShowToast(true);
        setLoading(false);
      }
    } catch (error) {
      console.error("Login error:", error);
      setToastMessage("Login failed. Please try again.");
      setToastColor("danger");
      setShowToast(true);
      setLoading(false);
    }
  };

  return (
    <IonPage>
      <IonContent ref={contentRef} fullscreen className="page-bg" scrollY={true}>
        <div className="card">
          <div className="logo-box">
            <img src={Logo} alt="Logo" className="logo-image" />
          </div>

          <h1 className="welcome">AttendMate</h1>
          <p className="subtext">Scalar TechHub</p>

          <label className="field-label">Email Address</label>
          <div className="field-wrapper">
            <IonIcon icon={mailOutline} className="field-icon" />
            <input
              type="email"
              placeholder="Enter your email"
              className="field-input"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                emailRef.current = e.target.value;
              }}
            />
          </div>

          <label className="field-label">Password</label>
          <div className="field-wrapper">
            <IonIcon icon={lockClosedOutline} className="field-icon" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              className="field-input"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                passwordRef.current = e.target.value;
              }}
              onFocus={scrollUpForPassword}  
            />
            <IonIcon
              icon={showPassword ? eyeOffOutline : eyeOutline}
              onClick={() => setShowPassword(!showPassword)}
              className="eye-toggle"
            />
          </div>

          <div className="forgot-container">
            <span className="forgot-link">Forgot Password?</span>
          </div>

          <IonButton
            expand="block"
            onClick={handleLogin}
            disabled={loading}
            className="signin-btn"
          >
            {loading ? <IonSpinner name="crescent" /> : "Sign In"}
          </IonButton>

          <p className="signup-text">
            Don't have an account?
            <span className="signup-link"> Contact HR</span>
          </p>

          <IonToast
            isOpen={showToast}
            message={toastMessage}
            duration={2000}
            position="top"
            color={toastColor}
            onDidDismiss={() => setShowToast(false)}
            style={{ "--border-radius": "10px" }}
          />
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Login;
