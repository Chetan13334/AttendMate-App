import React, { useState } from 'react';
import { IonAlert, IonButton } from '@ionic/react';
import { Geolocation } from '@capacitor/geolocation';
import './LocationBTN.css';

const LocationBTN: React.FC = () => {
  const [showAlert, setShowAlert] = useState(false);
  const [message, setMessage] = useState('');

  const getLocation = async () => {
    try {
      // Ask permission first
      const permission = await Geolocation.requestPermissions();
      if (permission.location === 'granted') {
        // Get current position
        const coordinates = await Geolocation.getCurrentPosition();
        const { latitude, longitude } = coordinates.coords;

        // Set the message for alert
        setMessage(`Latitude: ${latitude}\nLongitude: ${longitude}`);
      } else {
        setMessage('Permission denied. Please enable location services.');
      }
    } catch (error) {
      console.error('Error fetching location:', error);
      setMessage('Error fetching location. Try again.');
    }

    // Show the alert
    setShowAlert(true);
  };

  return (
    <>
      <IonButton className="location-btn" expand="block" onClick={getLocation}>
        Location
      </IonButton>

      <IonAlert
        isOpen={showAlert}
        header="Your Current Location"
        message={message}
        buttons={['Close']}
        onDidDismiss={() => setShowAlert(false)}
      />
    </>
  );
};

export default LocationBTN;
