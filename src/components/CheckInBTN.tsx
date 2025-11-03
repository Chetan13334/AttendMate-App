import React, { useState } from 'react';
import { IonButton, IonAlert } from '@ionic/react';
import { Geolocation } from '@capacitor/geolocation';

const CheckInBTN: React.FC = () => {
  const [showAlert, setShowAlert] = useState(false);
  const [message, setMessage] = useState('');

  // Office coordinates
  const officeLat = 18.5564913;
  const officeLng = 73.9550623;

  const toRad = (value: number) => (value * Math.PI) / 180;

  const getDistanceFromLatLonInMeters = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ) => {
    const R = 6371e3; // Radius of earth in meters
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; 
  };

  const checkLocation = async () => {
    try {
      // First check if location permission is already granted
      const permissionStatus = await Geolocation.checkPermissions();
      console.log('Permission status:', permissionStatus);
      
      let permission;
      if (permissionStatus.location === 'granted') {
        permission = permissionStatus;
      } else {
        // Request permission if not already granted
        permission = await Geolocation.requestPermissions();
        console.log('Requested permission:', permission);
      }
      
      if (permission.location === 'granted') {
        try {
          // Get current position with timeout options
          const position = await Geolocation.getCurrentPosition({
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 300000 // 5 minutes
          });
          
          console.log('Position:', position);
          // Use the actual user's location from their device
          const { latitude, longitude } = position.coords;

          const distance = getDistanceFromLatLonInMeters(
            officeLat,
            officeLng,
            latitude,
            longitude
          );

          console.log('Distance:', distance, 'meters');
          
          if (distance <= 15) {
            setMessage('✅ You are eligible to mark attendance!');
          } else {
            setMessage('❌ Oops! You are not near the office.');
          }
        } catch (positionError: any) {
          console.error('Position error:', positionError);
          setMessage(`Position error: ${positionError.message || 'Unable to get current position'}`);
        }
      } else {
        setMessage('⚠️ Location permission denied. Please enable location access in your device settings.');
      }
    } catch (err: any) {
      console.error('Geolocation error:', err);
      setMessage(`Error: ${err.message || 'Failed to access location services. Please check your device settings.'}`);
    }

    setShowAlert(true);
  };

  return (
    <>
      <IonButton className="location-btn" expand="block" onClick={checkLocation}>
        Check In
      </IonButton>
      <IonAlert
        isOpen={showAlert}
        header="Attendance Status"
        message={message}
        buttons={['Close']}
        onDidDismiss={() => setShowAlert(false)}
      />
    </>
  );
};

export default CheckInBTN;