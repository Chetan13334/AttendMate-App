import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonIcon, IonButton } from '@ionic/react';
import { useIonRouter } from '@ionic/react';
import AttendanceCard from '../components/AttendanceCard';
import EventsSection from '../components/EventsSection';
import AppHeader from '../components/AppHeader';
import CheckIn_CheckOut from '../components/CheckIn_CheckOut';
import './Home.css'; 

const Home: React.FC = () => {
  return (
    <IonPage>
      <AppHeader title="AttendMate" />
      
      <IonContent fullscreen>
       

        {/* 2. Attendance Card (Check In/Out Logic) */}
        <AttendanceCard />

        {/* 3. Events Section (Birthday + Other Events) */}
        <EventsSection />
      
        {/* Add some space at the bottom for aesthetic purposes above the footer */}
        <div className="ion-padding-bottom"></div>
      </IonContent>
    </IonPage>
  );
};

export default Home;