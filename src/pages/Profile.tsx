import React from "react";
import { IonPage, IonContent } from "@ionic/react";
import Header from "../components/AppHeader";
import ProfileCom from "../components/ProfileComp";
import AppRefresher from "../components/Models/AppRefresher";

const Profile: React.FC = () => {
  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = "/";
  };

  const refreshHomeData = async () => {
    window.location.reload();
  };
  return (
    <IonPage>
      <Header />
      <IonContent className="profile-bg">
        <AppRefresher onRefresh={refreshHomeData} />
        <ProfileCom onLogout={handleLogout} />
      </IonContent>
    </IonPage>
  );
};

export default Profile;
