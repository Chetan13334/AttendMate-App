// src/components/AttendanceCard.tsx
import React, { useState, useEffect } from 'react';
import {
  IonCard,
  IonCardContent,
  IonText,
  IonIcon,
  IonAlert,
} from '@ionic/react';
import { timeOutline, checkmarkCircle } from 'ionicons/icons';

type Status = 'not-checked' | 'checked-in' | 'checked-out';

const AttendanceCard: React.FC = () => {
  const [status, setStatus] = useState<Status>('not-checked');
  const [time, setTime] = useState('');
  const [currentTime, setCurrentTime] = useState(''); // Live clock
  const [showAlert, setShowAlert] = useState(false);
  const [msg, setMsg] = useState('');

  const formatTime = () => {
    const d = new Date();
    return d.toLocaleString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Update live clock every second
  useEffect(() => {
    const updateClock = () => {
      setCurrentTime(formatTime());
    };

    updateClock(); // Initial call
    const interval = setInterval(updateClock, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleTap = () => {
    const now = formatTime();

    if (status === 'not-checked') {
      setStatus('checked-in');
      setTime(now);
      setMsg('Check In Successful');
    } else if (status === 'checked-in') {
      setStatus('checked-out');
      setTime(now);
      setMsg('Checked Out Successfully');
    } else {
      setStatus('not-checked');
      setTime('');
      setMsg('Ready to Check In');
    }
    setShowAlert(true);
  };

  return (
    <>
      {/* ==================== 1. NOT CHECKED IN (Green Circle + LIVE TIME) ==================== */}
      {status === 'not-checked' && (
        <IonCard
          style={{
            borderRadius: '28px',
            margin: '20px',
            marginTop: '30px',
            overflow: 'hidden',
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            backgroundColor: '#ffffff',
          }}
          onClick={handleTap}
        >
          <div
            style={{
              background: 'linear-gradient(135deg, #E0F7FA 0%, #B2EBF2 100%)',
              padding: '50px 20px 40px',
              textAlign: 'center',
              position: 'relative',
            }}
          >
            <div
              style={{
                width: '120px',
                height: '120px',
                backgroundColor: '#ffffff',
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
                  width: '100px',
                  height: '100px',
                  backgroundColor: '#16bc5bff',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(0,200,83,0.3)',
                }}
              >
                <IonText color="light" style={{ fontWeight: 700, fontSize: '16px' }}>
                  CHECK IN
                </IonText>
              </div>
            </div>

            <IonText>
              <h3
                style={{
                  margin: '0 0 8px',
                  fontWeight: 600,
                  fontSize: '18px',
                  color: '#e37704ff',
                  letterSpacing: '0.5px',
                }}
              >
                STATUS: Pending
              </h3>
              <p
                style={{
                  margin: 0,
                  fontSize: '15px',
                  color: '#0035f4ff',
                  fontWeight: 400,
                }}
              >
                {currentTime}  {/* LIVE DATE & TIME */}
              </p>
            </IonText>
          </div>
        </IonCard>
      )}

      {/* ==================== 2. CHECKED IN (Teal Header + Check Mark) ==================== */}
      {status === 'checked-in' && (
        <IonCard
          style={{
            borderRadius: '20px',
            margin: '16px',
            marginTop: '24px',
            overflow: 'hidden',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            backgroundColor: '#ffffff',
          }}
          onClick={handleTap}
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
              <h2 style={{ margin: 0, fontWeight: 700, fontSize: '18px' }}>CHECKED IN</h2>
              <p style={{ margin: '4px 0 0', fontSize: '14px' }}>Tap to Check Out</p>
            </IonText>

            <div
              style={{
                position: 'absolute',
                right: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '60px',
                height: '60px',
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

          <IonCardContent
            style={{
              padding: '16px 20px',
              backgroundColor: '#ffffff',
              borderRadius: '0 0 20px 20px',
            }}
          >
            <IonText>
              <h4
                style={{
                  margin: 0,
                  fontWeight: 600,
                  color: '#29c546ff',
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: '15px',
                }}
              >
                STATUS: Checked In
                <span
                  style={{
                    width: '10px',
                    height: '10px',
                    background: '#13cb57ff',
                    borderRadius: '50%',
                    marginLeft: '8px',
                  }}
                />
              </h4>
              <p style={{ margin: '6px 0 0', color: '#555', fontSize: '14px' }}>{time}</p>
            </IonText>
          </IonCardContent>
        </IonCard>
      )}

      {/* ==================== 3. CHECKED OUT (Blue Header + Check Mark) ==================== */}
      {status === 'checked-out' && (
        <IonCard
          style={{
            borderRadius: '20px',
            margin: '16px',
            marginTop: '24px',
            overflow: 'hidden',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            backgroundColor: '#ffffff',
          }}
          onClick={handleTap}
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
              <h2 style={{ margin: 0, fontWeight: 700, fontSize: '18px' }}>CHECKED OUT</h2>
              <p style={{ margin: '4px 0 0', fontSize: '14px' }}>Tap to record your attendance</p>
            </IonText>

            <div
              style={{
                position: 'absolute',
                right: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '60px',
                height: '60px',
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

          <IonCardContent
            style={{
              padding: '16px 20px',
              backgroundColor: '#ffffff',
              borderRadius: '0 0 20px 20px',
            }}
          >
            <IonText>
              <h4
                style={{
                  margin: 0,
                  fontWeight: 600,
                  color: '#d32f2f',
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: '15px',
                }}
              >
                STATUS: Checked Out
                <span
                  style={{
                    width: '10px',
                    height: '10px',
                    background: '#d32f2f',
                    borderRadius: '50%',
                    marginLeft: '8px',
                  }}
                />
              </h4>
              <p style={{ margin: '6px 0 0', color: '#555', fontSize: '14px' }}>{time}</p>
            </IonText>
          </IonCardContent>
        </IonCard>
      )}

      <IonAlert
        isOpen={showAlert}
        message={msg}
        buttons={['OK']}
        onDidDismiss={() => setShowAlert(false)}
      />
    </>
  );
};

export default AttendanceCard;