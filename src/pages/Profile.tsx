import React from "react";
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButton } from "@ionic/react";

interface ProfileProps {
  onLogout: () => void;
}

const Profile: React.FC<ProfileProps> = ({ onLogout }) => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="light">
          <IonTitle>Profile</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding" style={{ background: "#fff" }}>
        <h2>👤 Profile Page</h2>
        <p>Employee information and account details will appear here.</p>

        <IonButton color="danger" expand="block" onClick={onLogout}>
          Logout
        </IonButton>
      </IonContent>
    </IonPage>
  );
};

export default Profile;
