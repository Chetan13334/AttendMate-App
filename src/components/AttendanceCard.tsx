import React, { useState } from 'react';
import { IonCard, IonCardContent, IonText, IonIcon, IonGrid, IonRow, IonCol, IonButton, IonAlert } from '@ionic/react';
import { Geolocation } from '@capacitor/geolocation';
import { checkmarkCircle, watch, logOut, logIn } from 'ionicons/icons';

// Define the component's state type
type AttendanceStatus = 'none' | 'checked-in' | 'checked-out';

const AttendanceCard: React.FC = () => {
    const [attendanceStatus, setAttendanceStatus] = useState<AttendanceStatus>('none'); 
    const [timestamp, setTimestamp] = useState<string>('');
    const [showAlert, setShowAlert] = useState(false);
    const [message, setMessage] = useState('');

    // --- Geofencing Logic (same as before) ---
    const officeLat = 18.5564913;
    const officeLng = 73.9550623;
    const geofenceRadius = 15; 
    const toRad = (value: number) => (value * Math.PI) / 180;
    const getDistanceFromLatLonInMeters = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        // ... (Your Haversine calculation code remains here)
        const R = 6371e3; 
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
    // ------------------------------------------

    const handleAttendanceAction = async () => {
        // ... (Your Check Location and Attendance Action logic remains here)
        // Note: I am simplifying the implementation detail here for brevity, 
        // but the full logic from the previous response remains valid inside the function.
        
        // --- START of Check Location and Attendance Action logic ---

        let position;
        try {
            const permissionStatus = await Geolocation.checkPermissions();
            if (permissionStatus.location !== 'granted') {
                const permission = await Geolocation.requestPermissions();
                if (permission.location !== 'granted') {
                    setMessage('⚠️ Location permission denied. Cannot mark attendance.');
                    setShowAlert(true);
                    return;
                }
            }

            position = await Geolocation.getCurrentPosition({
                enableHighAccuracy: true,
                timeout: 15000,
            });

            const distance = getDistanceFromLatLonInMeters(
                officeLat,
                officeLng,
                position.coords.latitude,
                position.coords.longitude
            );

            if (distance > geofenceRadius) {
                setMessage('❌ Oops! You are not near the office to mark attendance.');
                setShowAlert(true);
                return;
            }

        } catch (positionError: any) {
            console.error('Position error:', positionError);
            setMessage(`Location Error: ${positionError.message || 'Unable to get position.'}`);
            setShowAlert(true);
            return;
        }

        // 2. Perform Attendance Action (Inside Geofence)
        const newTimestamp = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        const currentDate = new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: '2-digit', year: 'numeric' });
        const newDateTime = `${newTimestamp}, ${currentDate}`;


        if (attendanceStatus === 'none' || attendanceStatus === 'checked-out') {
            // Logic for CHECK IN
            console.log('API CALL: Logging Check In...');
            setAttendanceStatus('checked-in');
            setTimestamp(newDateTime);
            setMessage('✅ Successfully Checked In!');

        } else if (attendanceStatus === 'checked-in') {
            // Logic for CHECK OUT
            console.log('API CALL: Logging Check Out...');
            setAttendanceStatus('checked-out');
            setTimestamp(newDateTime);
            setMessage('🌙 Successfully Checked Out! Have a great evening.');
        }

        setShowAlert(true);

        // --- END of Check Location and Attendance Action logic ---
    };

    // --- UI Logic based on State (Updated for color variables) ---
    let cardColor = 'var(--ion-color-secondary)'; // Default: Light Blue
    let actionText = 'Check In';
    let mainIcon = logIn;
    let checkmarkVisible = false;

    if (attendanceStatus === 'checked-in') {
        // Checked In State: Teal/Green
        cardColor = 'var(--ion-color-success)'; 
        actionText = 'Check Out';
        mainIcon = logOut;
        checkmarkVisible = true;
    } else if (attendanceStatus === 'checked-out') {
        // Checked Out State: Dark Blue
        cardColor = 'var(--ion-color-primary)';
        actionText = 'Check In'; // Next action is Check In again
        mainIcon = logIn;
        checkmarkVisible = true;
    }
    
    // Determine the current primary status to display in the card body
    const displayStatus = attendanceStatus === 'checked-in' ? (
        <>
            <IonText color="dark">
                <h4 className="ion-no-margin" style={{ fontWeight: 600 }}>STATUS: <IonIcon icon={checkmarkCircle} color="success" style={{ verticalAlign: 'middle', fontSize: '1.2em' }} /> **Checked In**</h4>
            </IonText>
            <IonText color="medium">
                <p className="ion-no-margin" style={{ fontSize: '0.9em' }}>{timestamp}</p>
            </IonText>
        </>
    ) : attendanceStatus === 'checked-out' ? (
        <>
            <IonText color="dark">
                <h4 className="ion-no-margin" style={{ fontWeight: 600 }}>STATUS: <IonIcon icon={checkmarkCircle} color="primary" style={{ verticalAlign: 'middle', fontSize: '1.2em' }} /> **Checked Out**</h4>
            </IonText>
            <IonText color="medium">
                <p className="ion-no-margin" style={{ fontSize: '0.9em' }}>{timestamp}</p>
            </IonText>
        </>
    ) : (
        <>
            <IonText color="dark">
                <h4 className="ion-no-margin" style={{ fontWeight: 600 }}>STATUS: **Not Checked In**</h4>
            </IonText>
            <IonText color="medium">
                <p className="ion-no-margin" style={{ fontSize: '0.9em' }}>Time not recorded yet.</p>
            </IonText>
        </>
    );


    return (
        <>
            <IonCard 
                className="ion-margin-vertical"
                style={{
                    borderRadius: '12px',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
                    overflow: 'hidden',
                }}
            >
                {/* Top Action Button/Card Area */}
                <div 
                    onClick={handleAttendanceAction}
                    style={{ 
                        backgroundColor: cardColor, 
                        cursor: 'pointer',
                        transition: 'background-color 0.3s ease'
                    }}
                >
                    <IonGrid className="ion-no-padding">
                        <IonRow className="ion-align-items-center ion-padding">
                            {/* Icon Column */}
                            <IonCol size="2" className="ion-text-center">
                                <IonIcon 
                                    icon={mainIcon} 
                                    style={{ fontSize: '36px', color: 'white' }} 
                                />
                            </IonCol>
                            
                            {/* Text Column */}
                            <IonCol size="8">
                                <IonText color="light">
                                    <h2 className="ion-no-margin" style={{ fontWeight: 700, fontSize: '1.3em' }}>{actionText} / {attendanceStatus === 'checked-in' ? 'Out' : 'In'}</h2>
                                    <p className="ion-no-margin" style={{ fontSize: '0.9em' }}>Tap to record your attendance</p>
                                </IonText>
                            </IonCol>
                            
                            {/* Checkmark Column */}
                            <IonCol size="2" className="ion-text-center">
                                {checkmarkVisible && (
                                    <IonIcon 
                                        icon={checkmarkCircle} 
                                        style={{ fontSize: '30px', color: 'white' }} 
                                    />
                                )}
                            </IonCol>
                        </IonRow>
                    </IonGrid>
                </div>

                {/* Status Display Area */}
                <IonCardContent className="ion-padding-vertical">
                    {displayStatus}
                </IonCardContent>
            </IonCard>

            {/* Alert Component */}
            <IonAlert
                isOpen={showAlert}
                header="Attendance Update"
                message={message}
                buttons={['OK']}
                onDidDismiss={() => setShowAlert(false)}
            />
        </>
    );
};

export default AttendanceCard;