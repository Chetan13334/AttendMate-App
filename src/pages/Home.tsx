import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonIcon, IonButton } from '@ionic/react';
import { useIonRouter } from '@ionic/react';
import AttendanceCard from '../components/AttendanceCard';
import EventsSection from '../components/EventsSection';
// Note: logOutOutline icon is added for the Logout button
import { personCircleOutline, notificationsOutline, logOutOutline } from 'ionicons/icons'; 

// Import the placeholder CSS (ensure this file exists but is empty)
import './Home.css'; 

const Home: React.FC = () => {
    // Hook used for navigation (redirecting to /login)
    const router = useIonRouter();

    // Logout function: redirects to the login page
    const handleLogout = () => {
        // TODO: Add actual logout logic (e.g., clear tokens) here
        router.push('/login');
    };

    return (
        <IonPage>
            <IonHeader translucent>
                <IonToolbar>
                    {/* Top Header: Logo/Title */}
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
                    
                    {/* Right-side Icons and Logout Button */}
                    <div slot="end" className="ion-padding-end" style={{ display: 'flex', alignItems: 'center' }}>
                        
                        {/* Profile/Settings Icon (Placeholder) */}
                        <IonIcon 
                            icon={personCircleOutline} 
                            style={{ fontSize: '32px', color: 'var(--ion-color-medium)' }} 
                        />
                        
                        {/* Notifications Icon (Placeholder) */}
                        <IonIcon 
                            icon={notificationsOutline} 
                            style={{ fontSize: '24px', marginLeft: '12px', color: 'var(--ion-color-medium)' }} 
                        />
                        
                        {/* Logout Button */}
                        <IonButton 
                            fill="clear" 
                            onClick={handleLogout} 
                            style={{ marginLeft: '8px', textTransform: 'none', fontWeight: 'bold' }}
                            color="danger" // Optional: gives a clear logout color
                        >
                            <IonIcon icon={logOutOutline} slot="start" />
                            Logout
                        </IonButton>
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