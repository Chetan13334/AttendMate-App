// src/components/EventsSection.tsx
import React from 'react';
import {
  IonCard,
  IonCardContent,
  IonText,
  IonIcon,
  IonGrid,
  IonRow,
  IonCol,
} from '@ionic/react';
import { giftOutline, calendarOutline, peopleOutline, alarmOutline } from 'ionicons/icons';

const EventsSection: React.FC = () => {
  const birthday = {
    name: 'Sarah-In',
    subtitle: 'Happy Birthday, J. (Product Room A)',
  };

  const events = [
    { icon: giftOutline, title: 'Happy Birthday', color: '#FFCA28', bg: '#FFF8E1' },
    { icon: calendarOutline, title: 'Team Sync Meeting', color: '#4CAF50', bg: '#E8F5E9' },
    { icon: peopleOutline, title: 'Training Room', color: '#2196F3', bg: '#E3F2FD' },
    { icon: alarmOutline, title: 'Alert Meeting', color: '#9C27B0', bg: '#F3E5F5' },
  ];

  return (
    <div style={{ backgroundColor: '#ffffff', padding: '0 16px', marginTop: '16px', marginBottom: '100px' }}>
      <IonCard
        style={{
          borderRadius: '20px',
          backgroundColor: '#FFF8E1',
          margin: '0 0 20px 0',
          width: '96%',
          marginLeft: 'auto',
          marginRight: 'auto',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        }}
      >
        <IonCardContent style={{ padding: '18px' }}>
          <IonGrid>
            <IonRow className="ion-align-items-center">
              <IonCol size="2" >
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    backgroundColor: '#FFCA28',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: '12px',
                    position: 'relative',
                    right: '2px',
                    bottom: '2px',
                  }}
                >
                  <IonIcon icon={giftOutline} style={{ fontSize: '26px', color: '#fff' }} />
                </div>
              </IonCol>
              <IonCol size="10">
                <IonText>
                  <h3 style={{ margin: 0, fontWeight: 700, fontSize: '16px', color: '#333' }}>
                    Happy Birthday, {birthday.name}
                  </h3>
                  <p style={{ margin: '4px 0 0', fontSize: '14px', color: '#555' }}>
                    {birthday.subtitle}
                  </p>
                </IonText>
              </IonCol>
            </IonRow>
          </IonGrid>
        </IonCardContent>
      </IonCard>

      <IonText>
        <h2 style={{ fontWeight: 700, fontSize: '18px', margin: '0 0 16px 0', color: '#000' }}>
          TODAY'S EVENTS
        </h2>
      </IonText>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {events.map((ev, i) => (
          <IonCard
            key={i}
            style={{
              backgroundColor: ev.bg,
              borderRadius: '20px',
              minHeight: '80px',
              display: 'flex',
              alignItems: 'center',
              padding: '0 16px',
              boxShadow: '0 3px 8px rgba(0,0,0,0.08)',
            }}
          >
            <IonGrid style={{ padding: '14px 0' }}>
              <IonRow className="ion-align-items-center">
                <IonCol size="2">
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      backgroundColor: ev.color,
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: '12px',
                    }}
                  >
                    <IonIcon icon={ev.icon} style={{ fontSize: '24px', color: '#fff' }} />
                  </div>
                </IonCol>
                <IonCol size="10">
                  <IonText>
                    <p style={{ margin: 0, fontWeight: 600, fontSize: '15px', color: '#333' }}>
                      {ev.title}
                    </p>
                  </IonText>
                </IonCol>
              </IonRow>
            </IonGrid>
          </IonCard>
        ))}
      </div>
    </div>
  );
};

export default EventsSection;