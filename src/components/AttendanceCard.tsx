// src/components/CheckIn_CheckOut.tsx
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
import { doc, setDoc, collection, query, getDocs, where, Timestamp, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Geolocation } from '@capacitor/geolocation';
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
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Non-blocking location check
const quickGeoCheck = async () => {
  try {
    const pos = await Geolocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 8000,
    });
    const distance = getDistance(
      officeLat,
      officeLng,
      pos.coords.latitude,
      pos.coords.longitude
    );
    return { inside: distance <= GEOFENCE_RADIUS, distance };
  } catch {
    return { inside: false, distance: 0 };
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
  const [pendingAction, setPendingAction] = useState<() => void>(() => {});
  const [employeeId, setEmployeeId] = useState('');
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showLocationLoader, setShowLocationLoader] = useState(false);

  const loggedInUserEmail = localStorage.getItem('userEmail');
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

  // Fetch employee and record
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const q = query(collection(db, 'Employee_Details'), where('Email', '==', loggedInUserEmail));
        const snapshot = await getDocs(q);
        if (snapshot.empty) return;
        const empData = snapshot.docs[0].data();
        const empId = empData.EmployeeID;
        setEmployeeId(empId);

        const recordRef = doc(db, 'Employee_CheckIn_CheckOut', today, 'employee_records', empId);
        const record = await getDoc(recordRef);

        if (record.exists()) {
          const data = record.data();
          if (data.CheckIn && !data.CheckOut) {
            setStatus('checked-in');
            setTime(data.CheckIn.toDate().toLocaleTimeString());
          } else if (data.CheckOut) {
            setStatus('checked-out');
            setTime(data.CheckOut.toDate().toLocaleTimeString());
          }
        }
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [today, loggedInUserEmail]);

  const confirmAction = (action: () => void, title: string) => {
    setPendingAction(() => action);
    setModalTitle(title);
    setShowModal(true);
  };

  const executeAction = () => {
    setShowModal(false);
    pendingAction();
  };

  const handleCheckIn = async () => {
    if (!employeeId) return;
    setIsProcessing(true);

    // Update UI instantly
    setStatus('checked-in');
    setTime(new Date().toLocaleTimeString());
    setMsg('Processing Check-In...');
    setShowAlert(true);

    // Run background Firestore + location
    (async () => {
      const { inside } = await quickGeoCheck();
      const now = new Date();
      await setDoc(doc(db, 'Employee_CheckIn_CheckOut', today, 'employee_records', employeeId), {
        CheckIn: Timestamp.fromDate(now),
        LocationValid: inside,
      }, { merge: true });
      setMsg(inside ? ' Check-In Successful!' : '⚠️ Checked In (Outside Location)');
      setShowAlert(true);
      setIsProcessing(false);
    })();
  };

  const handleCheckOut = async () => {
    if (!employeeId) return;
    setIsProcessing(true);
    setStatus('checked-out');
    setTime(new Date().toLocaleTimeString());
    setMsg('Processing Check-Out...');
    setShowAlert(true);

    (async () => {
      const { inside } = await quickGeoCheck();
      const now = new Date();
      await setDoc(doc(db, 'Employee_CheckIn_CheckOut', today, 'employee_records', employeeId), {
        CheckOut: Timestamp.fromDate(now),
        LocationValid: inside,
      }, { merge: true });
      setMsg(inside ? ' Checked Out Successfully!' : '⚠️ Checked Out (Outside Location)');
      setShowAlert(true);
      setIsProcessing(false);
    })();
  };

  const handleTap = () => {
    if (isProcessing) return;
    if (status === 'not-checked') confirmAction(handleCheckIn, 'Check In');
    else if (status === 'checked-in') confirmAction(handleCheckOut, 'Check Out');
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
      {/* === UI UNCHANGED BELOW === */}
      {status === 'not-checked' && (
        <IonCard
          button
          onClick={handleTap}
          disabled={isProcessing}
          style={{
            '--background': '#ffffff',
            '--border-radius': '28px',
            margin: '20px',
            marginTop: '30px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            opacity: isProcessing ? 0.7 : 1,
          }}
          className="ion-activatable ripple-parent"
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
                margin: '0 auto 30px',
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
          style={{
            '--background': '#ffffff',
            '--border-radius': '20px',
            margin: '16px',
            marginTop: '24px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            opacity: isProcessing ? 0.7 : 1,
          }}
          className="ion-activatable ripple-parent"
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
              <h2 style={{ margin: 0, fontWeight: 700, fontSize: '18px' }}>{isProcessing ? 'PROCESSING...' : 'CHECK OUT'}</h2>
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
              {isProcessing ? <IonSpinner name="crescent" color="primary" /> : <IonIcon icon={checkmarkCircle} style={{ fontSize: '38px', color: '#00BCD4' }} />}
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
          <div
            style={{
              backgroundColor: '#3880ff',
              borderRadius: '20px 20px 0 0',
              padding: '24px 20px',
              display: 'flex',
              alignItems: 'center',
              position: 'relative',
            }}
          >
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

      {/* CONFIRMATION MODAL (unchanged) */}
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
          <div
            style={{
              width: 80,
              height: 80,
              background: 'var(--ion-color-light)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              boxShadow: '0 4px 16px rgba(56, 128, 255, 0.15)',
            }}
          >
            <IonIcon icon={timeOutline} style={{ fontSize: '48px', color: 'var(--ion-color-primary)' }} />
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: 700, margin: '0 0 8px' }}>Confirm {modalTitle}</h2>
          <p style={{ fontSize: '15px', color: 'var(--ion-color-medium)', margin: '0 0 28px' }}>
            Are you sure you want to proceed?
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <IonButton color="success" onClick={executeAction} disabled={isProcessing}>
              {isProcessing ? <IonSpinner name="crescent" slot="start" /> : <IonIcon icon={checkmark} slot="start" />}
              {isProcessing ? 'Processing...' : 'Confirm'}
            </IonButton>
            <IonButton fill="outline" color="medium" onClick={() => setShowModal(false)} disabled={isProcessing}>
              <IonIcon icon={close} slot="start" />
              Cancel
            </IonButton>
          </div>
        </div>
      </IonModal>

      {/* SAME LOADER MODAL */}
      <IonModal isOpen={showLocationLoader} backdropDismiss={false} mode="ios">
        <div style={{ padding: '32px 24px', textAlign: 'center' }}>
          <IonSpinner name="crescent" color="primary" style={{ width: '48px', height: '48px' }} />
          <h2 style={{ fontSize: '18px', fontWeight: 600, marginTop: '10px' }}>Checking Location</h2>
          <p style={{ fontSize: '14px', color: 'var(--ion-color-medium)' }}>Please wait while we verify your location...</p>
        </div>
      </IonModal>

      <IonAlert isOpen={showAlert} message={msg} buttons={['OK']} onDidDismiss={() => setShowAlert(false)} />
    </>
  );
};

export default CheckIn_CheckOut;
