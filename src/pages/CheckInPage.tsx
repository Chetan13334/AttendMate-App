import React from 'react';
import { IonPage, IonContent } from '@ionic/react';
import AppHeader from '../components/AppHeader';
import Checkin from '../components/CheckIn_CheckOut';

const CheckInPage: React.FC = () => {
  return (
    <IonPage>
      <AppHeader title="Check In / Check Out" />
      <IonContent className="ion-padding">
        <Checkin />
      </IonContent>
    </IonPage>
  );
};

export default CheckInPage;
