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

type Status = 'not-checked' | 'checked-in' | 'checked-out';

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

  const loggedInUserEmail = localStorage.getItem('userEmail');
  const today = new Date().toISOString().split('T')[0];

  const formatTime = () => new Date().toLocaleString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  useEffect(() => {
    const update = () => setCurrentTime(formatTime());
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const employeeCollection = collection(db, "Employee_Details");
        const q = query(employeeCollection, where("Email", "==", loggedInUserEmail));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
          console.error("Employee not found for email:", loggedInUserEmail);
          setMsg("Employee not found. Please contact administrator.");
          setShowAlert(true);
          return;
        }

        const empData = snapshot.docs[0].data();
        const empId = empData.EmployeeID;
        setEmployeeId(empId);

        const docRef = doc(db, 'Employee_CheckIn_CheckOut', today, 'employee_records', empId);
        const record = await getDoc(docRef);

        if (record.exists()) {
          const data = record.data();
          if (data.CheckIn && !data.CheckOut) {
            setStatus('checked-in');
            setTime(data.CheckIn.toDate().toLocaleTimeString());
          } else if (data.CheckOut) {
            setStatus('checked-out');
            setTime(data.CheckOut.toDate().toLocaleTimeString());
          }
        } else {
          setStatus('not-checked');
        }
      } catch (err) {
        console.error(err);
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
    pendingAction();
    setShowModal(false);
  };

  const handleCheckIn = async () => {
    if (!employeeId) return;
    const now = new Date();
    const docRef = doc(db, 'Employee_CheckIn_CheckOut', today, 'employee_records', employeeId);
    await setDoc(docRef, { CheckIn: Timestamp.fromDate(now) }, { merge: true });
    setStatus('checked-in');
    setTime(now.toLocaleTimeString());
    setMsg('Check In Successful');
    setShowAlert(true);
  };

  const handleCheckOut = async () => {
    if (!employeeId) return;
    const now = new Date();
    const docRef = doc(db, 'Employee_CheckIn_CheckOut', today, 'employee_records', employeeId);
    await setDoc(docRef, { CheckOut: Timestamp.fromDate(now) }, { merge: true });
    setStatus('checked-out');
    setTime(now.toLocaleTimeString());
    setMsg('Checked Out Successfully');
    setShowAlert(true);
  };

  const handleTap = () => {
    if (status === 'not-checked') {
      confirmAction(handleCheckIn, 'Check In');
    } else if (status === 'checked-in') {
      confirmAction(handleCheckOut, 'Check Out');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full p-6">
        <IonSpinner name="crescent" />
        <p className="mt-2">Loading attendance...</p>
      </div>
    );
  }

  return (
    <>
      {status === 'not-checked' && (
        <IonCard
          button
          onClick={handleTap}
          style={{
            '--background': '#ffffff',
            '--border-radius': '28px',
            margin: '20px',
            marginTop: '30px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
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
                <IonText color="light" style={{ fontWeight: 700, fontSize: '16px' }}>
                  CHECK IN
                </IonText>
              </div>
            </div>
            <h3 style={{ margin: '0 0 8px', fontWeight: 600, fontSize: '18px', color: '#e37704' }}>
              STATUS: Pending
            </h3>
            <p style={{ margin: 0, fontSize: '15px', color: '#0035f4' }}>
              {currentTime}
            </p>
          </div>
          <IonRippleEffect />
        </IonCard>
      )}

      {status === 'checked-in' && (
        <IonCard
          button
          onClick={handleTap}
          style={{
            '--background': '#ffffff',
            '--border-radius': '20px',
            margin: '16px',
            marginTop: '24px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
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
              <h2 style={{ margin: 0, fontWeight: 700, fontSize: '18px' }}>CHECK OUT</h2>
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
              <IonIcon icon={checkmarkCircle} style={{ fontSize: '38px', color: '#00BCD4' }} />
            </div>
          </div>
          <IonCardContent style={{ padding: '16px 20px' }}>
            <h4 style={{ margin: 0, fontWeight: 600, color: '#29c546', display: 'flex', alignItems: 'center', fontSize: '15px' }}>
              STATUS: Checked In
              <span style={{ width: 10, height: 10, background: '#13cb57', borderRadius: '50%', marginLeft: '8px' }} />
            </h4>
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
              <IonIcon icon={checkmarkCircle} style={{ fontSize: '38px', color: '#3880ff' }} />
            </div>
          </div>
          <IonCardContent style={{ padding: '16px 20px' }}>
            <h4 style={{ margin: 0, fontWeight: 600, color: '#d32f2f', display: 'flex', alignItems: 'center', fontSize: '15px' }}>
              STATUS: Checked Out
              <span style={{ width: 10, height: 10, background: '#d32f2f', borderRadius: '50%', marginLeft: '8px' }} />
            </h4>
            <p style={{ margin: '6px 0 0', color: '#555', fontSize: '14px' }}>{time}</p>
          </IonCardContent>
        </IonCard>
      )}

      {/* CONFIRMATION MODAL */}
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
          <h2 style={{ fontSize: '22px', fontWeight: 700, margin: '0 0 8px' }}>
            Confirm {modalTitle}
          </h2>
          <p style={{ fontSize: '15px', color: 'var(--ion-color-medium)', margin: '0 0 28px' }}>
            Are you sure you want to proceed?
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <IonButton color="success" onClick={executeAction}>
              <IonIcon icon={checkmark} slot="start" />
              Confirm
            </IonButton>
            <IonButton fill="outline" color="medium" onClick={() => setShowModal(false)}>
              <IonIcon icon={close} slot="start" />
              Cancel
            </IonButton>
          </div>
        </div>
      </IonModal>

      {/* SUCCESS ALERT */}
      <IonAlert
        isOpen={showAlert}
        message={msg}
        buttons={['OK']}
        onDidDismiss={() => setShowAlert(false)}
      />
    </>
  );
};

export default CheckIn_CheckOut;
