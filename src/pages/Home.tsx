import React from 'react';
import logo from '../assets/placeholder.png';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonContent,
  IonIcon,
  IonButtons,
  IonButton,
} from '@ionic/react';
import { personCircleOutline, logOutOutline } from 'ionicons/icons';
import AttendanceCard from '../components/AttendanceCard';
import EventsSection from '../components/EventsSection';

import Footer from '../components/common/Footer'; // ✅ import Footer

interface HomeProps {
  onLogout: () => void;
}

const Home: React.FC<HomeProps> = ({ onLogout }) => {
  return (
    <IonPage>
      {/* HEADER */}
      <IonHeader>
        <IonToolbar color="light">
          <div
            slot="start"
            style={{ display: 'flex', alignItems: 'center', paddingLeft: '16px' }}
          >
            <img src={logo} alt="AttendMate" style={{ height: '22px', marginRight: '8px' }} />
            <span style={{ fontWeight: 'bold', fontSize: '18px', color: '#333' }}>
              AttendMate
            </span>
          </div>

          {/* PROFILE + LOGOUT BUTTONS */}
          <IonButtons slot="end">
            <IonButton routerLink="/profile">
              <IonIcon icon={personCircleOutline} style={{ fontSize: '26px', color: '#555' }} />
            </IonButton>
            <IonButton onClick={onLogout}>
              <IonIcon icon={logOutOutline} style={{ fontSize: '24px', color: '#555' }} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      {/* ✅ FIXED CONTENT AREA */}
      <IonContent color="light" style={{ '--background': '#ffffff' }}>
        <div
          style={{
            paddingTop: 'var(--ion-safe-area-top, 20px)',
            paddingBottom: '80px', // ✅ Added this line
            minHeight: '100vh',
            backgroundColor: '#ffffff',
          }}
        >
          <AttendanceCard />
          <EventsSection />
        </div>
      </IonContent>

      {/* ✅ FOOTER */}
      <Footer />
    </IonPage>
  );
};

export default Home;
