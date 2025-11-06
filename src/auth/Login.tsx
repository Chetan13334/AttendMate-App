import React, { useState, useRef, useEffect } from "react";
import {
  IonPage,
  IonContent,
  IonToast,
  IonSpinner,
  IonIcon,
  IonButton
} from "@ionic/react";
import { eyeOutline, eyeOffOutline, mailOutline, lockClosedOutline } from "ionicons/icons";
import { db } from "../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import "./Login.css";
import Logo from "../assets/main_logo.png";

interface LoginProps {
  onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({
    visible: false,
    message: "",
    color: "danger",
  });

  const emailRef = useRef(email);
  const passwordRef = useRef(password);
  const contentRef = useRef<HTMLIonContentElement>(null);

  const showToastMessage = (message: string, color: "danger" | "success") => {
    setToast({ visible: true, message, color });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, visible: false }));
  };

  // Handle keyboard events
  useEffect(() => {
    const handleKeyboardShow = () => {
      // Add a small delay to ensure the keyboard is fully opened
      setTimeout(() => {
        if (contentRef.current) {
          contentRef.current.scrollToPoint(0, 100, 300);
        }
      }, 100);
    };

    const handleKeyboardHide = () => {
      if (contentRef.current) {
        contentRef.current.scrollToTop(300);
      }
    };

    // Add event listeners for keyboard events
    window.addEventListener('keyboardWillShow', handleKeyboardShow);
    window.addEventListener('keyboardWillHide', handleKeyboardHide);

    return () => {
      window.removeEventListener('keyboardWillShow', handleKeyboardShow);
      window.removeEventListener('keyboardWillHide', handleKeyboardHide);
    };
  }, []);

  const handleLogin = async () => {
    const trimmedEmail = emailRef.current.trim();
    const trimmedPassword = passwordRef.current.trim();

    if (!trimmedEmail || !trimmedPassword) {
      showToastMessage("Please enter email and password", "danger");
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
        sessionStorage.setItem("isLoggedIn", "true");
        sessionStorage.setItem("userEmail", trimmedEmail);

        showToastMessage("Login successful!", "success");

        setTimeout(() => {
          setLoading(false);
          onLogin();
        }, 700);
      } else {
        setLoading(false);
        showToastMessage("Invalid email or password", "danger");
      }
    } catch (err) {
      setLoading(false);
      showToastMessage("Login failed. Try again.", "danger");
    }
  };

  return (
    <IonPage>
      <IonContent 
        ref={contentRef}
        fullscreen 
        className="page-bg"
        scrollY={true}
      >
        <div className="card">
          <div className="logo-box">
            {/* <div className="logo-gradient"/> */}
            <img src={Logo} alt="Logo" className="logo-image" />
          </div>

          <h1 className="welcome">AttendMate</h1>
          <p className="subtext">Scalar TechHub</p>

          <label className="field-label">Email Address</label>
          <div className="field-wrapper">
            <IonIcon icon={mailOutline} className="field-icon"/>
            <input
              type="email"
              placeholder="Enter your email"
              className="field-input"
              value={email}
              onChange={(e) => { setEmail(e.target.value); emailRef.current = e.target.value }}
              onFocus={() => {
                // Scroll up when input is focused
                setTimeout(() => {
                  if (contentRef.current) {
                    contentRef.current.scrollToPoint(0, 100, 300);
                  }
                }, 300);
              }}
            />
          </div>

          <label className="field-label">Password</label>
          <div className="field-wrapper">
            <IonIcon icon={lockClosedOutline} className="field-icon"/>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              className="field-input"
              value={password}
              onChange={(e) => { setPassword(e.target.value); passwordRef.current = e.target.value }}
              onFocus={() => {
                // Scroll up when input is focused
                setTimeout(() => {
                  if (contentRef.current) {
                    contentRef.current.scrollToPoint(0, 150, 300);
                  }
                }, 300);
              }}
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
            {loading ? <IonSpinner /> : "Sign In"}
          </IonButton>

          <p className="signup-text">
            Don't have an account?<span className="signup-link">Contact To HR</span>
          </p>

          <IonToast
            isOpen={toast.visible}
            message={toast.message}
            duration={1600}
            position="top"
            color={toast.color}
            onDidDismiss={hideToast}
          />
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Login;