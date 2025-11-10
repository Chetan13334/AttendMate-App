import React, { useState, useEffect } from 'react';
import {
  IonCard,
  IonCardContent,
  IonText,
  IonIcon,
  IonModal,
  IonButton,
  IonRippleEffect,
  IonSpinner,
  IonAlert,
} from '@ionic/react';
import { timeOutline, checkmarkCircle, checkmark, close } from 'ionicons/icons';
import { App } from '@capacitor/app';
import { Skeleton } from './ui/skeleton';

// ✅ Imported separated logic
import {
  enableLocation,
  quickGeoCheck,
} from '../Services/locationService';

import {
  fetchEmployeeId,
  fetchTodayRecord,
  listenToAttendance,
  saveCheckIn,
  saveCheckOut,
} from '../Services/AttendanceService';

type Status = 'not-checked' | 'checked-in' | 'checked-out';

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

  // Handle app resume after opening location settings
  useEffect(() => {
    let listener: any;

    const setupListener = async () => {
      listener = await App.addListener('resume', async () => {
        const success = await enableLocation();
        if (success && retryAction) {
          retryAction();
          setRetryAction(null);
          setShowLocationAlert(false);
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

  // 🔹 Fetch employee & today record
  useEffect(() => {
    const loadData = async () => {
      try {
        const empId = await fetchEmployeeId(loggedInUserEmail);
        if (!empId) {
          setLoading(false);
          return;
        }

        setEmployeeId(empId);
        const data = await fetchTodayRecord(today, empId);

        if (data) {
          if (data.CheckIn && !data.CheckOut) {
            setStatus('checked-in');
            setTime(data.CheckIn.toDate().toLocaleTimeString());
          } else if (data.CheckOut) {
            setStatus('checked-out');
            setTime(data.CheckOut.toDate().toLocaleTimeString());
          }
        }
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [loggedInUserEmail]);

  // 🔄 Real-time updates for attendance
  useEffect(() => {
    if (!employeeId) return;
    const unsubscribe = listenToAttendance(today, employeeId, (data: any) => {
      if (data) {
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
    });

    return () => unsubscribe();
  }, [employeeId, today]);

  // Confirmation modal handler
  const confirmAction = (action: (inside: boolean) => void, title: string) => {
    setPendingAction(() => action);
    setModalTitle(title);
    setShowModal(true);
  };

  // Executes check-in/check-out after confirmation
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

    if (!inside) {
      setMsg('⚠️ Check-In Failed: You are not in the designated location!');
      setShowAlert(true);
      setIsProcessing(false);
      return;
    }

    const now = await saveCheckIn(today, employeeId, inside);
    setStatus('checked-in');
    setTime(now.toLocaleTimeString());
    setMsg('✅ Check-In Successful!');
    setShowAlert(true);
    setIsProcessing(false);
  };

  const handleCheckOut = async (inside: boolean) => {
    if (!employeeId) return;
    setIsProcessing(true);

    if (!inside) {
      setMsg('⚠️ Check-Out Failed: You are not in the designated location!');
      setShowAlert(true);
      setIsProcessing(false);
      return;
    }

    const now = await saveCheckOut(today, employeeId, inside);
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

  // ⏳ Loading skeleton
  if (loading) {
    return (
      <div style={{ padding: '20px', margin: '20px' }}>
        <Skeleton style={{ height: '200px', borderRadius: '28px' }} />
      </div>
    );
  }

  // ✅ --- UI Layer (UNCHANGED) ---
  return (
    <>
      {/* All your UI from the previous version stays exactly the same */}
      {/* (Cards, Modals, Alerts, etc.) */}

      {/* Location Alert */}
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

      {/* Everything else from your previous JSX (CheckIn, CheckOut, Modals, Alerts, etc.) */}
    </>
  );
};

export default CheckIn_CheckOut;
