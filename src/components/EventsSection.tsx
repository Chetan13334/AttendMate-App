import React from 'react';
import { IonCard, IonCardContent, IonList, IonItem, IonLabel, IonIcon, IonText, IonGrid, IonRow, IonCol } from '@ionic/react';
// 🛑 FIX: Changed 'mapPin' to 'locationOutline' or 'location'
import { star, calendar, happy, locationOutline } from 'ionicons/icons'; 

// Mock data structure 
const mockEvents = {
    birthday: {
        name: "Sarah J.J.",
        team: "Product Team",
    },
    otherEvents: [
        // ... mock events data
        {
            title: "Team Sync Meeting",
            time: "10:30 AM",
            location: "Conference Room A",
            icon: calendar
        },
        {
            title: "New Hire Onboarding",
            time: "All Day",
            location: "Training Room",
            icon: happy
        }
    ]
};


const EventsSection: React.FC = () => {
    const { birthday, otherEvents } = mockEvents;
    
    return (
        <div className="ion-padding-horizontal ion-margin-top">
            <h2 className="ion-padding-start ion-no-margin">Today's Events</h2>
            
            {/* Birthday Card (Prominent Card as requested) */}
            {birthday && (
                <IonCard 
                    color="tertiary" 
                    className="ion-margin-vertical"
                    style={{
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                        borderRadius: '12px',
                    }}
                >
                    <IonCardContent className="ion-no-padding">
                        <IonGrid>
                            <IonRow className="ion-align-items-center ion-padding">
                                <IonCol size="2" className="ion-text-center">
                                    <IonIcon icon={star} style={{ fontSize: '32px', color: 'white' }} />
                                </IonCol>
                                <IonCol size="10">
                                    <IonText color="light">
                                        <h3 className="ion-no-margin" style={{ fontWeight: 700 }}>Birthday Celebration!</h3>
                                        <p className="ion-no-margin">Happy Birthday, **{birthday.name}** ({birthday.team})</p>
                                    </IonText>
                                </IonCol>
                            </IonRow>
                        </IonGrid>
                    </IonCardContent>
                </IonCard>
            )}

            {/* Other Events List (Compact List as requested) */}
            <IonList 
                lines="full" 
                className="ion-margin-bottom"
                style={{
                    borderRadius: '12px',
                    overflow: 'hidden',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                }}
            >
                {otherEvents.map((event, index) => (
                    <IonItem key={index} detail={false}>
                        <IonIcon icon={event.icon} slot="start" color="primary" />
                        <IonLabel>
                            <h3 style={{ fontWeight: 600 }}>{event.title}</h3>
                            <p className="ion-text-wrap">
                                {/* 🛑 FIX: Using the imported 'locationOutline' icon */}
                                <IonIcon icon={locationOutline} color="medium" style={{ fontSize: '12px', verticalAlign: 'middle', marginRight: '4px' }}/>
                                {event.location}
                                <span className="ion-padding-start">|</span>
                                <IonText color="dark" className="ion-padding-start">
                                    **{event.time}**
                                </IonText>
                            </p>
                        </IonLabel>
                    </IonItem>
                ))}
            </IonList>
        </div>
    );
};

export default EventsSection;