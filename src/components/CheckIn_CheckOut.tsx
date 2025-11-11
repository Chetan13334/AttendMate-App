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
import { App } from '@capacitor/app';
import { Skeleton } from './ui/skeleton';

import { enableLocation, quickGeoCheck } from '../Services/LocationService';
import {
  fetchEmployeeId,
  fetchTodayRecord,
  listenToAttendance,
  saveCheckIn,
  saveCheckOut,
} from "../Services/AttendanceService";

import '../theme/components/CheckIn_CheckOut.css';

type Status = 'not-checked' | 'checked-in' | 'checked-out';

const CheckIn_CheckOut: React.FC = () => {
  const [status, setStatus] = useState<Status>('not-checked');
  const [time, setTime] = useState('');
  const [currentTime, setCurrentTime] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [msg, setMsg] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [pendingAction, setPendingAction] = useState<(inside: boolean) => void>(() => () => { });
  const [employeeId, setEmployeeId] = useState('');
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showLocationAlert, setShowLocationAlert] = useState(false);
  const [showLocationChecking, setShowLocationChecking] = useState(false);
  const [retryAction, setRetryAction] = useState<(() => void) | null>(null);

  const loggedInUserEmail = localStorage.getItem('userEmail') || '';
  const today = new Date().toISOString().split('T')[0];

  const isWeb = typeof (window as any).capacitor === 'undefined' || !(window as any).capacitor?.isNative;

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
      if (listener && typeof listener.remove === 'function') listener.remove();
    };
  }, [retryAction]);

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
    if (!inside) {
      setMsg('Warning: Check-In Failed: You are not in the designated location!');
      setShowAlert(true);
      setIsProcessing(false);
      return;
    }
    const now = await saveCheckIn(today, employeeId, inside);
    setStatus('checked-in');
    setTime(now.toLocaleTimeString());
    setMsg('Success: Check-In Successful!');
    setShowAlert(true);
    setIsProcessing(false);
  };

  const handleCheckOut = async (inside: boolean) => {
    if (!employeeId) return;
    setIsProcessing(true);
    if (!inside) {
      setMsg('Warning: Check-Out Failed: You are not in the designated location!');
      setShowAlert(true);
      setIsProcessing(false);
      return;
    }
    const now = await saveCheckOut(today, employeeId, inside);
    setStatus('checked-out');
    setTime(now.toLocaleTimeString());
    setMsg('Success: Check-Out Successful!');
    setShowAlert(true);
    setIsProcessing(false);
  };

  const handleTap = () => {
    if (isProcessing) return;

    if (isWeb) {
      setMsg('Check-in/out requires GPS and is only available on the mobile app.');
      setShowAlert(true);
      return;
    }

    if (status === 'not-checked') confirmAction(handleCheckIn, 'Check In');
    else if (status === 'checked-in') confirmAction(handleCheckOut, 'Check Out');
  };

  if (loading) {
    return (
      <div className="skeleton-wrapper">
        <Skeleton style={{ height: '200px', borderRadius: '28px' }} />
      </div>
    );
  }

  return (
    <>
      {status === 'not-checked' && (
        <IonCard
          button
          onClick={handleTap}
          disabled={isProcessing}
          className="checkin-card ion-activatable ripple-parent"
        >
          <div className="checkin-header">
            <div className="checkin-circle-outer">
              <div className="checkin-circle-inner">
                {isProcessing ? (
                  <IonSpinner name="crescent" color="light" />
                ) : (
                  <IonText color="light" style={{ fontWeight: 700, fontSize: '16px' }}>
                    CHECK IN
                  </IonText>
                )}
              </div>
            </div>
            <h3 className="checkin-status">STATUS: Pending</h3>
            <p className="checkin-time">{currentTime}</p>
          </div>
          <IonRippleEffect />
        </IonCard>
      )}

      {status === 'checked-in' && (
        <IonCard
          button
          onClick={handleTap}
          disabled={isProcessing}
          className="checkedin-card ion-activatable ripple-parent"
        >
          <div className="checkedin-header">
            <IonIcon icon={timeOutline} className="checkedin-icon" />
            <IonText color="light">
              <h2>{isProcessing ? 'PROCESSING...' : 'CHECK OUT'}</h2>
              <p>Tap to end your shift</p>
            </IonText>
            <div className="checkedin-badge">
              {isProcessing ? (
                <IonSpinner name="crescent" color="primary" />
              ) : (
                <IonIcon icon={checkmarkCircle} className="checkedin-badge-icon" />
              )}
            </div>
          </div>
          <IonCardContent className="checkedin-content">
            <h4>STATUS: Checked In</h4>
            <p>{time}</p>
          </IonCardContent>
          <IonRippleEffect />
        </IonCard>
      )}

      {status === 'checked-out' && (
        <IonCard className="checkedout-card">
          <div className="checkedout-header">
            <IonIcon icon={timeOutline} className="checkedout-icon" />
            <IonText color="light">
              <h2>DAY COMPLETE</h2>
              <p>Great job! See you tomorrow</p>
            </IonText>
          </div>
          <IonCardContent className="checkedout-content">
            <h4>STATUS: Checked Out</h4>
            <p>{time}</p>
          </IonCardContent>
        </IonCard>
      )}

      
      <IonModal
        isOpen={showModal}
        onDidDismiss={() => setShowModal(false)}
        backdropDismiss={false}
        mode="ios"
        className="confirm-modal"
      >
        <div className="confirm-modal-content">
          <IonIcon icon={timeOutline} className="modal-icon" />
          <h2>Confirm {modalTitle}</h2>
          <p>Are you sure you want to proceed?</p>
          <div className="modal-buttons">
            <IonButton color="success" onClick={executeAction} disabled={isProcessing}>
              {isProcessing ? (
                <IonSpinner name="crescent" slot="start" />
              ) : (
                <IonIcon icon={checkmark} slot="start" />
              )}
              {isProcessing ? 'Processing...' : 'Confirm'}
            </IonButton>
            <IonButton
              fill="outline"
              color="medium"
              onClick={() => setShowModal(false)}
              disabled={isProcessing}
            >
              <IonIcon icon={close} slot="start" /> Cancel
            </IonButton>
          </div>
        </div>
      </IonModal>

      
      <IonModal
        isOpen={showLocationChecking}
        backdropDismiss={false}
        mode="ios"
        className="confirm-modal"
      >
        <div className="confirm-modal-content">
          <IonSpinner name="crescent" color="primary" className="location-spinner" />
          <h2>Checking Location</h2>
          <p>Please wait while we verify your location...</p>
        </div>
      </IonModal>

      
      <IonAlert
        isOpen={showLocationAlert}
        header="Location Required"
        message="We need your location to verify check-in/out. Please turn it on."
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
              } else {
                const webMsg = 'Location access is not supported on laptops. Please use the mobile app.';
                const nativeMsg = 'Please turn on location in your device settings and return to the app.';
                setMsg(isWeb ? webMsg : nativeMsg);
                setShowAlert(true);
              }
            },
          },
          {
            text: 'Cancel',
            role: 'cancel',
            handler: () => {
              setRetryAction(null);
            },
          },
        ]}
      />

      
      <IonModal
        isOpen={showAlert}
        onDidDismiss={() => setShowAlert(false)}
        backdropDismiss={false}
        mode="ios"
        className="confirm-modal"
      >
        <div
          className="alert-modal-content"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '30px 20px',
          }}
        >
          {(() => {
            const isBlocking = msg.includes('requires GPS') || msg.includes('not supported');
            const isSuccess = msg.includes('Successful');
            const isWarning = msg.includes('Warning') || msg.includes('Failed');

            return (
              <>
                <div
                  className={`alert-icon-container ${isBlocking || isWarning ? 'alert-failed' : 'alert-success'}`}
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: '70px',
                    height: '70px',
                    borderRadius: '50%',
                    marginBottom: '20px',
                  }}
                >
                  <IonIcon
                    icon={isBlocking || isWarning ? close : checkmark}
                    className="alert-icon"
                    style={{ fontSize: '34px', color: '#fff' }}
                  />
                </div>

                <h2
                  className={isBlocking || isWarning ? 'alert-failed-title' : 'alert-success-title'}
                  style={{
                    fontWeight: '700',
                    fontSize: '20px',
                    marginBottom: '8px',
                  }}
                >
                  {isBlocking ? 'Action Required' : isWarning ? 'Action Failed' : 'Success'}
                </h2>

                <p style={{ marginBottom: '20px', fontSize: '14px', color: '#444' }}>
                  {msg.replace(/Warning:|Success:|Action Required:/g, '').trim()}
                </p>

                <IonButton
                  expand="block"
                  color={isBlocking || isWarning ? 'danger' : 'success'}
                  onClick={() => setShowAlert(false)}
                  style={{
                    width: '80%',
                    maxWidth: '220px',
                    fontWeight: 600,
                    borderRadius: '10px',
                  }}
                >
                  OK
                </IonButton>
              </>
            );
          })()}
        </div>
      </IonModal>
    </>
  );
};

export default CheckIn_CheckOut;