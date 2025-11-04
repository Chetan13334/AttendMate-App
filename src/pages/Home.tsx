import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonIcon } from '@ionic/react';
import AttendanceCard from '../components/AttendanceCard';
import EventsSection from '../components/EventsSection';
import { personCircleOutline, notificationsOutline } from 'ionicons/icons'; // Icons for the header

// Import the placeholder CSS (you can keep it empty as planned)
import './Home.css'; 

const Home: React.FC = () => {
    return (
        <IonPage>
            <IonHeader translucent>
                <IonToolbar>
                    {/* Top Header: Logo/Title, User Avatar, Notifications */}
                    <IonTitle slot="start">
                        <div style={{ display: 'flex', alignItems: 'center', fontWeight: 'bold' }}>
                            <img 
                                src="/favicon.png" // Use your project's favicon/logo
                                alt="AttendMate Logo" 
                                style={{ height: '24px', marginRight: '8px' }}
                            />
                            AttendMate
                        </div>
                    </IonTitle>
                    
                    {/* Right-side Icons */}
                    <div slot="end" className="ion-padding-end">
                        {/* Placeholder for Profile/Settings */}
                        <IonIcon 
                            icon={personCircleOutline} 
                            style={{ fontSize: '32px', color: 'var(--ion-color-medium)' }} 
                        />
                        {/* Placeholder for Notifications */}
                        <IonIcon 
                            icon={notificationsOutline} 
                            style={{ fontSize: '24px', marginLeft: '12px', color: 'var(--ion-color-medium)' }} 
                        />
                    </div>
                </IonToolbar>
            </IonHeader>

            <IonContent fullscreen>
                {/* 1. Attendance Card (Check In/Out Logic) */}
                <AttendanceCard />

                {/* 2. Events Section (Birthday + Other Events) */}
                <EventsSection />
            
                {/* Add some space at the bottom for aesthetic purposes above the footer */}
                <div className="ion-padding-bottom"></div>

            </IonContent>
        </IonPage>
    );
};

export default Home;