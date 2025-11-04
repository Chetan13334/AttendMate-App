import React from 'react';
import { IonFooter, IonHeader, IonTitle, IonToolbar, IonButton, IonIcon } from '@ionic/react';
import { home, calendar, person, time } from 'ionicons/icons';

interface AppHeaderProps {
  title?: string;
  showLogout?: boolean;
  showIcons?: boolean;
}

const AppHeader: React.FC<AppHeaderProps> = ({ title = "AttendMate", showLogout = false, showIcons = true }) => {
  return (
    <>
      <IonHeader>
        <IonToolbar>
          <IonTitle>{title}</IonTitle>
          
        </IonToolbar>
      </IonHeader>
    </>
  );
};

export default AppHeader;