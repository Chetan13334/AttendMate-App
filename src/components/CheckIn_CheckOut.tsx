// src/components/CheckIn_CheckOut.tsx
import React, { useState, useEffect } from 'react';
import { IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonButton } from '@ionic/react';

const CheckIn_CheckOut: React.FC = () => {
  return (
    <IonCard>
      <IonCardHeader>
        <IonCardTitle>Check In/Out</IonCardTitle>
      </IonCardHeader>
      <IonCardContent>
        <IonButton expand="block" color="primary">Check In</IonButton>
        <IonButton expand="block" color="secondary" className="ion-margin-top">Check Out</IonButton>
      </IonCardContent>
    </IonCard>
  );
};

export default CheckIn_CheckOut;
