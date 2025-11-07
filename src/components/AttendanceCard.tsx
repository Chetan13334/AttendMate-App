import React, { useState, useEffect } from 'react';
import {
  IonCard,
  IonCardContent,
  IonText,
  IonIcon,
  IonAlert,
  IonModal,
  IonButton,
  IonRippleEffect,
  IonSpinner,
} from '@ionic/react';
import { timeOutline, checkmarkCircle, checkmark, close } from 'ionicons/icons';
import {
  doc,
  setDoc,
  collection,
  query,
  getDocs,
  where,
  Timestamp,
  getDoc,
} from 'firebase/firestore';
import { db } from '../firebase';
import { Geolocation } from '@capacitor/geolocation';
import { Capacitor } from '@capacitor/core';
import { AppLauncher } from '@capacitor/app-launcher';
import { App } from '@capacitor/app';
import { Skeleton } from './ui/skeleton';

type Status = 'not-checked' | 'checked-in' | 'checked-out';

const officeLat = 18.5564913;
const officeLng = 73.9550623;
const GEOFENCE_RADIUS = 14; // meters

const toRad = (value: number) => (value * Math.PI) / 180;
const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371e3;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const openLocationSettings = async () => {
  const platform = Capacitor.getPlatform();
  try {
    if (platform === 'android') {
      await AppLauncher.openUrl({
        url: 'intent:#Intent;action=android.settings.LOCATION_SOURCE_SETTINGS;end',
      });
    } else if (platform === 'ios') {
      await AppLauncher.openUrl({ url: 'app-settings:' });
    }
  } catch (err) {
    console.error('Error opening location settings:', err);
  }
};

// NEW: Robust location enabler
const enableLocation = async (): Promise<boolean> => {
  try {
    // Step 1: Request permission
    const perm = await Geolocation.requestPermissions();
    if (perm.location !== 'granted') {
      return false;
    }

    // Step 2: Try to get position → this forces location services ON
    await Geolocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 15000,
    });
    return true;
  } catch (err: any) {
    console.error('enableLocation error:', err);
    if (err.message?.includes('Location services') || err.code === 2) {
      // Location is OFF at system level → open settings
      await openLocationSettings();
    }
    return false;
  }
};

const quickGeoCheck = async () => {
  try {
    const pos = await Geolocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 10000,
    });
    const distance = getDistance(
      officeLat,
      officeLng,
      pos.coords.latitude,
      pos.coords.longitude
    );
    return { success: true, inside: distance <= GEOFENCE_RADIUS, distance };
  } catch (err) {
    console.error('Geo check error:', err);
    return { success: false, inside: false, distance: 0 };
  }
};

const CheckIn_CheckOut: React.FC = () => {
  const [status, setStatus] = useState<Status>('not-checked');
  const [time, setTime] = useState('');
  const [currentTime, setCurrentTime] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [msg, setMsg] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [pendingAction, setPendingAction] = useState<(inside: boolean) => void>(() => () => {});
  const [employeeId, setEmployeeId] = useState('');
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showLocationAlert, setShowLocationAlert] = useState(false);
  const [showLocationChecking, setShowLocationChecking] = useState(false);
  const [retryAction, setRetryAction] = useState<(() => void) | null>(null);

  const loggedInUserEmail = localStorage.getItem('userEmail') || '';
  const today = new Date().toISOString().split('T')[0];

  const formatTime = () =>
    new Date().toLocaleString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(formatTime()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let listener: any;
    
    const setupListener = async () => {
      listener = await App.addListener('resume', async () => {
        // When app resumes from settings, check if location is now enabled
        const perm = await Geolocation.checkPermissions();
        if (perm.location === 'granted') {
          setShowLocationAlert(false);
          // If there's a pending action to retry, execute it
          if (retryAction) {
            retryAction();
            setRetryAction(null);
          }
        }
      });
    };
    
    setupListener();
    
    return () => {
      if (listener && typeof listener.remove === 'function') {
        listener.remove();
      }
    };
  }, [retryAction]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const q = query(collection(db, 'Employee_Details'), where('Email', '==', loggedInUserEmail));
        const snapshot = await getDocs(q);
        if (snapshot.empty) {
          setLoading(false);
          return;
        }
        const empData = snapshot.docs[0].data();
        const empId = (empData as any).EmployeeID;
        setEmployeeId(empId);

        const recordRef = doc(db, 'Employee_CheckIn_CheckOut', today, 'employee_records', empId);
        const record = await getDoc(recordRef);

        if (record.exists()) {
          const data = record.data();
          if (data.CheckIn && !data.CheckOut) {
            setStatus('checked-in');
            setTime((data.CheckIn as Timestamp).toDate().toLocaleTimeString());
          } else if (data.CheckOut) {
            setStatus('checked-out');
            setTime((data.CheckOut as Timestamp).toDate().toLocaleTimeString());
          }
        }
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [today, loggedInUserEmail]);

  const confirmAction = (action: (inside: boolean) => void, title: string) => {
    setPendingAction(() => action);
    setModalTitle(title);
    setShowModal(true);
  };

  const executeAction = async () => {
    setShowModal(false);
    setShowLocationChecking(true);

    try {
      const { success, inside } = await quickGeoCheck();
      setShowLocationChecking(false);

      if (!success) {
        setRetryAction(() => executeAction);
        setShowLocationAlert(true);
        return;
      }

      pendingAction(inside);
    } catch (err) {
      console.error('executeAction error:', err);
      setShowLocationChecking(false);
      setShowLocationAlert(true);
    }
  };

  const handleCheckIn = async (inside: boolean) => {
    if (!employeeId) return;
    setIsProcessing(true);

    // If user is not in the designated location, prevent check-in
    if (!inside) {
      setIsProcessing(false);
      setMsg('⚠️ Check-In Failed: You are not in the designated location!');
      setShowAlert(true);
      return;
    }

    const now = new Date();
    await setDoc(
      doc(db, 'Employee_CheckIn_CheckOut', today, 'employee_records', employeeId),
      {
        CheckIn: Timestamp.fromDate(now),
        LocationValid: inside,
      },
      { merge: true }
    );

    setStatus('checked-in');
    setTime(now.toLocaleTimeString());
    setMsg('✅ Check-In Successful!');
    setShowAlert(true);
    setIsProcessing(false);
  };

  const handleCheckOut = async (inside: boolean) => {
    if (!employeeId) return;
    setIsProcessing(true);

    // If user is not in the designated location, prevent check-out
    if (!inside) {
      setIsProcessing(false);
      setMsg('⚠️ Check-Out Failed: You are not in the designated location!');
      setShowAlert(true);
      return;
    }

    const now = new Date();
    await setDoc(
      doc(db, 'Employee_CheckIn_CheckOut', today, 'employee_records', employeeId),
      {
        CheckOut: Timestamp.fromDate(now),
        LocationValid: inside,
      },
      { merge: true }
    );

    setStatus('checked-out');
    setTime(now.toLocaleTimeString());
    setMsg('✅ Check-Out Successful!');
    setShowAlert(true);
    setIsProcessing(false);
  };

  const handleTap = () => {
    if (isProcessing) return;
    if (status === 'not-checked') {
      confirmAction(handleCheckIn, 'Check In');
    } else if (status === 'checked-in') {
      confirmAction(handleCheckOut, 'Check Out');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-6 space-y-6">
        <Skeleton style={{ height: '8rem', borderRadius: '1rem' }} />
      </div>
    );
  }

  return (
    <>
      <style>
        {`
          .alert-success {
            --background: #e8f5e9;
            --color: #2e7d32;
            --border-color: #4caf50;
          }
          .alert-failed {
            --background: #ffebee;
            --color: #c62828;
            --border-color: #f44336;
          }
          .alert-success .alert-button {
            --background: #4caf50;
            --color: white;
          }
          .alert-failed .alert-button {
            --background: #f44336;
            --color: white;
          }
        `}
      </style>
      
      {/* ✅ UI remains exactly the same */}
      {status === 'not-checked' && (
        <IonCard
          button
          onClick={handleTap}
          disabled={isProcessing}
          className="ion-activatable ripple-parent"
          style={{
            '--background': '#ffffff',
            '--border-radius': '28px',
            margin: '20px',
            marginTop: '8px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            opacity: isProcessing ? 0.7 : 1,
          }}
        >
          <div
            style={{
              background: 'linear-gradient(135deg, #E0F7FA 0%, #B2EBF2 100%)',
              padding: '50px 20px 40px',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: 120,
                height: 120,
                backgroundColor: '#fff',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 10px',
                boxShadow: '0 20px 20px rgba(0,0,0,0.1)',
              }}
            >
              <div
                style={{
                  width: 100,
                  height: 100,
                  backgroundColor: '#16bc5b',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(22,188,91,0.3)',
                }}
              >
                {isProcessing ? (
                  <IonSpinner name="crescent" color="light" />
                ) : (
                  <IonText color="light" style={{ fontWeight: 700, fontSize: '16px' }}>
                    CHECK IN
                  </IonText>
                )}
              </div>
            </div>
            <h3 style={{ margin: '0 0 8px', fontWeight: 600, fontSize: '18px', color: '#e37704' }}>
              STATUS: Pending
            </h3>
            <p style={{ margin: 0, fontSize: '15px', color: '#0035f4' }}>{currentTime}</p>
          </div>
          <IonRippleEffect />
        </IonCard>
      )}

      {status === 'checked-in' && (
        <IonCard
          button
          onClick={handleTap}
          disabled={isProcessing}
          className="ion-activatable ripple-parent"
          style={{
            '--background': '#ffffff',
            '--border-radius': '20px',
            margin: '16px',
            marginTop: '24px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            opacity: isProcessing ? 0.7 : 1,
          }}
        >
          <div
            style={{
              backgroundColor: '#00BCD4',
              borderRadius: '20px 20px 0 0',
              padding: '24px 20px',
              display: 'flex',
              alignItems: 'center',
              position: 'relative',
            }}
          >
            <IonIcon icon={timeOutline} style={{ fontSize: '36px', color: '#fff', marginRight: '16px' }} />
            <IonText color="light">
              <h2 style={{ margin: 0, fontWeight: 700, fontSize: '18px' }}>
                {isProcessing ? 'PROCESSING...' : 'CHECK OUT'}
              </h2>
              <p style={{ margin: '4px 0 0', fontSize: '14px' }}>Tap to end your shift</p>
            </IonText>
            <div
              style={{
                position: 'absolute',
                right: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: 60,
                height: 60,
                background: '#fff',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
              }}
            >
              {isProcessing ? (
                <IonSpinner name="crescent" color="primary" />
              ) : (
                <IonIcon icon={checkmarkCircle} style={{ fontSize: '38px', color: '#00BCD4' }} />
              )}
            </div>
          </div>
          <IonCardContent style={{ padding: '16px 20px' }}>
            <h4 style={{ margin: 0, fontWeight: 600, color: '#29c546' }}>STATUS: Checked In</h4>
            <p style={{ margin: '6px 0 0', color: '#555', fontSize: '14px' }}>{time}</p>
          </IonCardContent>
          <IonRippleEffect />
        </IonCard>
      )}

      {status === 'checked-out' && (
        <IonCard
          style={{
            '--background': '#ffffff',
            '--border-radius': '20px',
            margin: '16px',
            marginTop: '24px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          }}
        >
          <div style={{ backgroundColor: '#3880ff', borderRadius: '20px 20px 0 0', padding: '24px 20px', display: 'flex', alignItems: 'center', position: 'relative' }}>
            <IonIcon icon={timeOutline} style={{ fontSize: '36px', color: '#fff', marginRight: '16px' }} />
            <IonText color="light">
              <h2 style={{ margin: 0, fontWeight: 700, fontSize: '18px' }}>DAY COMPLETE</h2>
              <p style={{ margin: '4px 0 0', fontSize: '14px' }}>Great job! See you tomorrow</p>
            </IonText>
          </div>
          <IonCardContent style={{ padding: '16px 20px' }}>
            <h4 style={{ margin: 0, fontWeight: 600, color: '#d32f2f' }}>STATUS: Checked Out</h4>
            <p style={{ margin: '6px 0 0', color: '#555', fontSize: '14px' }}>{time}</p>
          </IonCardContent>
        </IonCard>
      )}

      <IonModal
        isOpen={showModal}
        onDidDismiss={() => setShowModal(false)}
        backdropDismiss={false}
        mode="ios"
        style={{
          '--height': 'auto',
          '--width': '90%',
          '--max-width': '380px',
          '--border-radius': '24px',
        }}
      >
        <div style={{ padding: '32px 24px', textAlign: 'center' }}>
          <IonIcon icon={timeOutline} style={{ fontSize: '48px', color: 'var(--ion-color-primary)', marginBottom: '20px' }} />
          <h2 style={{ fontSize: '22px', fontWeight: 700, margin: '0 0 8px' }}>Confirm {modalTitle}</h2>
          <p style={{ fontSize: '15px', color: 'var(--ion-color-medium)', margin: '0 0 28px' }}>Are you sure you want to proceed?</p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <IonButton color="success" onClick={executeAction} disabled={isProcessing}>
              {isProcessing ? <IonSpinner name="crescent" slot="start" /> : <IonIcon icon={checkmark} slot="start" />}
              {isProcessing ? 'Processing...' : 'Confirm'}
            </IonButton>
            <IonButton fill="outline" color="medium" onClick={() => setShowModal(false)} disabled={isProcessing}>
              <IonIcon icon={close} slot="start" /> Cancel
            </IonButton>
          </div>
        </div>
      </IonModal>

      {/* Checking Location - styled like confirmation modal */}
      <IonModal
        isOpen={showLocationChecking}
        backdropDismiss={false}
        mode="ios"
        style={{
          '--height': 'auto',
          '--width': '90%',
          '--max-width': '380px',
          '--border-radius': '24px',
        }}
      >
        <div style={{ padding: '32px 24px', textAlign: 'center' }}>
          <IonSpinner name="crescent" color="primary" style={{ width: '48px', height: '48px', marginBottom: '20px' }} />
          <h2 style={{ fontSize: '22px', fontWeight: 700, margin: '0 0 8px' }}>Checking Location</h2>
          <p style={{ fontSize: '15px', color: 'var(--ion-color-medium)', margin: '0 0 28px' }}>Please wait while we verify your location...</p>
        </div>
      </IonModal>

      {/* Location Disabled */}
      <IonAlert
        isOpen={showLocationAlert}
        header="Location Required"
        message="We need your location to verify check-in/out. Tap below to turn it on."
        buttons={[
          {
            text: 'Turn On Location',
            cssClass: 'alert-button-success',
            handler: async () => {
              setShowLocationAlert(false);
              setShowLocationChecking(true);

              const success = await enableLocation();

              setShowLocationChecking(false);

              if (success && retryAction) {
                retryAction();
                setRetryAction(null);
              } else if (!success) {
                setMsg('Please turn on location in settings and try again.');
                setShowAlert(true);
              }
            },
          },
          {
            text: 'Cancel',
            role: 'cancel',
          },
        ]}
      />

      {/* Info Alert - styled like confirmation modal */}
      <IonModal
        isOpen={showAlert}
        onDidDismiss={() => setShowAlert(false)}
        backdropDismiss={false}
        mode="ios"
        style={{
          '--height': 'auto',
          '--width': '90%',
          '--max-width': '380px',
          '--border-radius': '24px',
        }}
      >
        <div style={{ padding: '32px 24px', textAlign: 'center' }}>
          <div style={{ 
            width: '60px', 
            height: '60px', 
            borderRadius: '50%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            margin: '0 auto 20px',
            backgroundColor: msg.includes('Failed') || msg.includes('Oops') || msg.includes('⚠️') ? '#ffebee' : '#e8f5e9'
          }}>
            <IonIcon 
              icon={msg.includes('Failed') || msg.includes('Oops') || msg.includes('⚠️') ? close : checkmark} 
              style={{ 
                fontSize: '32px', 
                color: msg.includes('Failed') || msg.includes('Oops') || msg.includes('⚠️') ? '#f44336' : '#4caf50' 
              }} 
            />
          </div>
          <h2 style={{ 
            fontSize: '22px', 
            fontWeight: 700, 
            margin: '0 0 8px',
            color: msg.includes('Failed') || msg.includes('Oops') || msg.includes('⚠️') ? '#c62828' : '#2e7d32'
          }}>
            {msg.includes('Failed') || msg.includes('Oops') || msg.includes('⚠️') ? 'Action Failed' : 'Success'}
          </h2>
          <p style={{ fontSize: '15px', color: 'var(--ion-color-medium)', margin: '0 0 28px' }}>{msg.replace(/⚠️|✅/g, '').trim()}</p>
          <IonButton 
            expand="block" 
            color={msg.includes('Failed') || msg.includes('Oops') || msg.includes('⚠️') ? 'danger' : 'success'}
            onClick={() => setShowAlert(false)}
          >
            OK
          </IonButton>
        </div>
      </IonModal>
    </>
  );
};

export default CheckIn_CheckOut;