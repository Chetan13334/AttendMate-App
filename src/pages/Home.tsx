// src/pages/Home.tsx
import React from 'react';
import logo from '../assets/placeholder.png';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonIcon,
  IonButtons,
  IonButton,
} from '@ionic/react';
import { homeOutline, calendarOutline, documentOutline, personOutline, personCircleOutline } from 'ionicons/icons';

import AttendanceCard from '../components/AttendanceCard';
import EventsSection from '../components/EventsSection';

const Home: React.FC = () => {
  return (
    <IonPage>
      {/* HEADER */}
      <IonHeader>
        <IonToolbar color="light">
          <IonTitle style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
            <img src={logo} alt="AttendMate" style={{ height: '22px', marginRight: '8px' }} />
            AttendMate
          </IonTitle>
          <IonButtons slot="end">
            <IonButton routerLink="/profile">
              <IonIcon icon={personCircleOutline} style={{ fontSize: '28px', color: '#555' }} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      {/* CONTENT – PURE WHITE */}
      <IonContent fullscreen color="light" style={{ '--background': '#ffffff' }}>
        <div style={{ 
          paddingTop: 'var(--ion-safe-area-top, 20px)', 
          minHeight: '100vh',
          backgroundColor: '#ffffff'
        }}>
          <AttendanceCard />
          <EventsSection />
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Home;