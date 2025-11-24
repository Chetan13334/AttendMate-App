import React from "react";
import { IonPage, IonContent } from "@ionic/react";
import Header from "../components/AppHeader";
import ProfileCom from "../components/ProfileComp";

const Profile: React.FC = () => {
  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = "/";
  };

  return (
    <IonPage>
      <Header />
      <IonContent className="profile-bg">
        <ProfileCom onLogout={handleLogout} />
      </IonContent>
    </IonPage>
  );
};

export default Profile;
