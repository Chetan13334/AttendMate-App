import React, { useState, useEffect } from 'react';
import {
  IonCard, IonCardContent, IonCardHeader, IonCardSubtitle,
  IonCardTitle, IonButton, IonSpinner
} from '@ionic/react';
import { doc, setDoc, collection, query, getDocs, where, Timestamp, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

const CheckIn_CheckOut = () => {
  const [checkInTime, setCheckInTime] = useState<string | null>(null);
  const [checkOutTime, setCheckOutTime] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [employeeId, setEmployeeId] = useState<string>('');

  // Get the logged-in user's email from localStorage
  const loggedInUserEmail = localStorage.getItem('userEmail') || "123radha@gmail.com";
  const today = new Date().toISOString().split('T')[0]; // e.g. 2025-11-04

  // Fetch employee ID and today's attendance record
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setCheckInTime(null);
      setCheckOutTime(null);

      try {
        // 🔹 1. Get Employee ID from Employee_Details collection
        const employeeCollection = collection(db, "Employee_Details");
        const q = query(employeeCollection, where("Email", "==", loggedInUserEmail));
        const employeeSnapshot = await getDocs(q);

        if (employeeSnapshot.empty) {
          console.error("Employee not found for email:", loggedInUserEmail);
          setLoading(false);
          return;
        }

        const employeeData = employeeSnapshot.docs[0].data();
        const empId = employeeData.EmployeeID;
        setEmployeeId(empId);

        // 🔹 2. Fetch attendance document
        const docRef = doc(db, 'Employee_CheckIn_CheckOut', today, empId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.CheckIn instanceof Timestamp) {
            setCheckInTime(data.CheckIn.toDate().toLocaleTimeString());
          } else if (data.CheckIn) {
            setCheckInTime(data.CheckIn);
          }
          
          if (data.CheckOut instanceof Timestamp) {
            setCheckOutTime(data.CheckOut.toDate().toLocaleTimeString());
          } else if (data.CheckOut) {
            setCheckOutTime(data.CheckOut);
          }
        }
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [today, loggedInUserEmail]);

  // 🔹 Handle Check-In
  const handleCheckIn = async () => {
    if (!employeeId) {
      console.error("Employee ID not found");
      return;
    }

    const now = new Date();
    const timeString = now.toLocaleTimeString();
    
    try {
      const docRef = doc(db, 'Employee_CheckIn_CheckOut', today, employeeId);
      // First check if document exists to preserve existing checkout time
      const docSnap = await getDoc(docRef);
      
      let checkoutData = null;
      if (docSnap.exists()) {
        const data = docSnap.data();
        checkoutData = data.CheckOut;
      }
      
      await setDoc(docRef, {
        CheckIn: Timestamp.fromDate(now),
        CheckOut: checkoutData
      }, { merge: true });

      setCheckInTime(timeString);
    } catch (error) {
      console.error("Error saving check-in:", error);
    }
  };

  // 🔹 Handle Check-Out
  const handleCheckOut = async () => {
    if (!employeeId) {
      console.error("Employee ID not found");
      return;
    }
    
    if (!checkInTime) {
      console.error("Cannot check out without checking in first");
      return;
    }

    const now = new Date();
    const timeString = now.toLocaleTimeString();
    
    try {
      const docRef = doc(db, 'Employee_CheckIn_CheckOut', today, employeeId);
      // First check if document exists to preserve existing checkin time
      const docSnap = await getDoc(docRef);
      
      let checkinData = null;
      if (docSnap.exists()) {
        const data = docSnap.data();
        checkinData = data.CheckIn;
      }
      
      await setDoc(docRef, {
        CheckIn: checkinData || Timestamp.fromDate(new Date()),
        CheckOut: Timestamp.fromDate(now)
      }, { merge: true });

      setCheckOutTime(timeString);
    } catch (error) {
      console.error("Error saving check-out:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full p-6">
        <div className="text-center">
          <IonSpinner name="crescent" />
          <p className="mt-2">Loading attendance data...</p>
        </div>
      </div>
    );
  }

  if (!employeeId) {
    return (
      <div className="flex justify-center items-center h-full p-6 text-center">
        <p>Employee not found for email: {loggedInUserEmail}</p>
      </div>
    );
  }

  return (
    <div>
      {/* Check-In Card */}
      <IonCard>
        <IonCardHeader>
          <IonCardTitle>Check-In</IonCardTitle>
          <IonCardSubtitle>Start your work day</IonCardSubtitle>
        </IonCardHeader>
        <IonCardContent>
          {checkInTime ? (
            <p>Checked in at: {checkInTime}</p>
          ) : (
            <p>Ready to start your day? Check in now!</p>
          )}
          <IonButton expand="block" onClick={handleCheckIn} disabled={!!checkInTime}>
            Check In
          </IonButton>
        </IonCardContent>
      </IonCard>

      {/* Check-Out Card */}
      <IonCard>
        <IonCardHeader>
          <IonCardTitle>Check-Out</IonCardTitle>
          <IonCardSubtitle>End your work day</IonCardSubtitle>
        </IonCardHeader>
        <IonCardContent>
          {checkOutTime ? (
            <p>Checked out at: {checkOutTime}</p>
          ) : (
            <p>Finishing work? Check out now!</p>
          )}
          <IonButton expand="block" onClick={handleCheckOut} disabled={!checkInTime || !!checkOutTime}>
            Check Out
          </IonButton>
        </IonCardContent>
      </IonCard>
    </div>
  );
};

export default CheckIn_CheckOut;