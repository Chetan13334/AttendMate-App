import React, { useEffect, useState } from 'react';
import "./LocationBTN.css";
import LocationIcon from '../assets/placeholder.png'
import {
  IonButton,
  IonAlert,
  IonContent,
} from '@ionic/react';
import { Geolocation } from '@capacitor/geolocation';

const LocationChecker: React.FC = () => {
  const [showAlert, setShowAlert] = useState(false);

  // ✅ Check if GPS is enabled
  const checkLocationEnabled = async () => {
    try {
      await Geolocation.getCurrentPosition();
      console.log('GPS is enabled');
    } catch (error) {
      console.log('GPS might be off or permission denied:', error);
      setShowAlert(true);
    }
  };

  useEffect(() => {
    checkLocationEnabled();
  }, []);

  return (
    <>
      <IonContent className="ion-padding">
        {/* Location Button in Top Right Corner */}
        <div style={{
          position: 'fixed',
          top: '16px',
          right: '16px',
          zIndex: 1000
        }}>
          <IonButton 
            fill="clear" 
            onClick={checkLocationEnabled}
            style={{
              '--background': 'var(--ion-color-step-100, rgba(0, 0, 0, 0.1))',
              '--background-hover': 'var(--ion-color-step-300, rgba(0, 0, 0, 0.2))',
              '--border-radius': '50%',
              width: '56px',
              height: '56px',
              '--box-shadow': '0 4px 12px var(--ion-color-step-200, rgba(0, 0, 0, 0.15))',
              '--transition': 'all 0.3s ease'
            }}
          >
            <span style={{ 
              fontSize: '28px',
              filter: 'drop-shadow(0 2px 4px var(--ion-color-step-300, rgba(0, 0, 0, 0.2)))'
            }}>
              <img src={LocationIcon} alt="OOps" />
            </span>
          </IonButton>
        </div>

        <div style={{ marginTop: '70px' }}>
          <IonButton expand="block" onClick={checkLocationEnabled}>
            Check Location
          </IonButton>
        </div>

        {/* Alert popup */}
        <IonAlert
          isOpen={showAlert}
          header="Location Disabled"
          message="Your device's location is turned off. Please enable it to continue."
          buttons={[
            {
              text: 'OK',
              role: 'cancel',
              handler: () => setShowAlert(false),
            },
          ]}
          onDidDismiss={() => setShowAlert(false)}
        />
      </IonContent>
    </>
  );
};

export default LocationChecker;