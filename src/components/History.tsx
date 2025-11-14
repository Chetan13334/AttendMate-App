import React, { useState, useEffect, useRef } from "react";
import { IonPage } from "@ionic/react";
import HistoryLayout from "./HistoryLayout";
import {
  getInitials,
  getDuration,
  fetchEmployeeId,
  fetchPastRecords,
} from "../Services/HistoryService";
import { db } from "../firebase";
import { collection, query, where, getDocs, getDoc, onSnapshot } from "firebase/firestore";
import { DB } from "../config/databaseConfig";

/* ---------------------------------------------------
   NEW FUNCTION: Load today's record instantly ONCE
---------------------------------------------------- */
const fetchTodayRecordOnce = async (employeeId: string) => {
  const today = new Date();
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(today.getDate()).padStart(2, "0")}`;

  const snap = await getDoc(DB.employeeRecord(todayKey, employeeId));

  if (!snap.exists()) {
    return {
      date: today,
      checkIn: "Not marked",
      checkOut: "Not marked",
      duration: "N/A",
    };
  }

  const data = snap.data();
  const checkIn = data.CheckIn ? data.CheckIn.toDate() : null;
  const checkOut = data.CheckOut ? data.CheckOut.toDate() : null;

  return {
    date: today,
    checkIn: checkIn
      ? checkIn.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      : "Not marked",
    checkOut: checkOut
      ? checkOut.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      : "Not marked",
    duration: checkIn && checkOut ? getDuration(checkIn, checkOut) : "N/A",
  };
};

const History: React.FC = () => {
  const [records, setRecords] = useState<any[]>([]);
  const [todayRecord, setTodayRecord] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [employeeId, setEmployeeId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [photoLoading, setPhotoLoading] = useState(true);
  const [photoError, setPhotoError] = useState(false);

  const liveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const userEmail = localStorage.getItem("userEmail");

  const userName = userEmail?.split("@")[0]?.replace(".", " ") || "Employee";
  const initials = getInitials(userName);

  const [startDate, setStartDate] = useState<Date>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 6);
    d.setHours(0, 0, 0, 0);
    return d;
  });

  const [endDate, setEndDate] = useState<Date>(() => {
    const d = new Date();
    d.setHours(23, 59, 59, 999);
    return d;
  });

  /* -------------------------------------------
     FETCH USER PHOTO
  ------------------------------------------- */
  useEffect(() => {
    const fetchUserPhoto = async () => {
      if (!userEmail) return;
      try {
        setPhotoLoading(true);
        const q = query(collection(db, "Employee_Details"), where("Email", "==", userEmail));
        const snap = await getDocs(q);
        if (!snap.empty && snap.docs[0].data().Photo) {
          setUserPhoto(snap.docs[0].data().Photo as string);
        }
      } catch {
        setPhotoError(true);
      } finally {
        setPhotoLoading(false);
      }
    };
    fetchUserPhoto();
  }, [userEmail]);

  /* -------------------------------------------
     FETCH EMPLOYEE ID
  ------------------------------------------- */
  useEffect(() => {
    if (!userEmail) return;

    const loadEmployeeId = async () => {
      const id = await fetchEmployeeId(userEmail);
      if (id) setEmployeeId(id);
    };

    loadEmployeeId();
  }, [userEmail]);

  /* ----------------------------------------------------------
     MAIN LOGIC: LOAD (Today + Past Records) TOGETHER FAST
  ----------------------------------------------------------- */
  useEffect(() => {
    if (!employeeId) return;
    setLoading(true);

    const loadAllRecords = async () => {
      try {
        // 1️⃣ Load today's record immediately (no listener delay)
        const todayData = await fetchTodayRecordOnce(employeeId);
        // Only update todayRecord if we don't have a real-time listener update
        // setTodayRecord(todayData);

        // 2️⃣ Load past records
        const pastRecords = await fetchPastRecords(employeeId, startDate, endDate);

        // remove today's record from past
        const filteredPast = pastRecords.filter((rec) => {
          const d1 = new Date(rec.date);
          const d2 = new Date(todayData.date);
          d1.setHours(0, 0, 0, 0);
          d2.setHours(0, 0, 0, 0);
          return d1.getTime() !== d2.getTime();
        });

        // 3️⃣ Merge today + past instantly
        const merged = [todayData, ...filteredPast].sort(
          (a, b) => b.date.getTime() - a.date.getTime()
        );

        // Update records but keep the real-time today record if it exists
        setRecords(prevRecords => {
          // Keep the real-time today record if it exists
          const todayRecordExists = prevRecords.find(rec => {
            const recDate = new Date(rec.date);
            recDate.setHours(0, 0, 0, 0);
            const todayDate = new Date(todayData.date);
            todayDate.setHours(0, 0, 0, 0);
            return recDate.getTime() === todayDate.getTime();
          });
          
          if (todayRecordExists) {
            return [todayRecordExists, ...filteredPast].sort(
              (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
            );
          } else {
            return merged;
          }
        });
      } catch (err) {
        console.error("Load error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadAllRecords();

    /* Live listener AFTER initial load */
    // Set up a listener for today's record specifically
    const today = new Date();
    const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(today.getDate()).padStart(2, "0")}`;
    
    // Set up a listener for today's record specifically
    const unsubscribeToday = onSnapshot(DB.employeeRecord(todayKey, employeeId), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        const checkIn = data.CheckIn ? data.CheckIn.toDate() : null;
        const checkOut = data.CheckOut ? data.CheckOut.toDate() : null;
        
        const updatedTodayRecord = {
          date: today,
          checkIn: checkIn
            ? checkIn.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            : "Not marked",
          checkOut: checkOut
            ? checkOut.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            : "Not marked",
          duration: checkIn && checkOut ? getDuration(checkIn, checkOut) : "N/A",
        };
        
        setTodayRecord(updatedTodayRecord);
        
        // Update the records array with the new today record
        setRecords(prevRecords => {
          // Remove the old today record if it exists
          const filteredRecords = prevRecords.filter(rec => {
            const recDate = new Date(rec.date);
            recDate.setHours(0, 0, 0, 0);
            const todayDate = new Date(today);
            todayDate.setHours(0, 0, 0, 0);
            return recDate.getTime() !== todayDate.getTime();
          });
          
          // Add the updated today record
          return [updatedTodayRecord, ...filteredRecords].sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          );
        });
      } else {
        // If document doesn't exist, update with default values
        const defaultTodayRecord = {
          date: today,
          checkIn: "Not marked",
          checkOut: "Not marked",
          duration: "N/A",
        };
        
        setTodayRecord(defaultTodayRecord);
        
        // Update the records array with the default today record
        setRecords(prevRecords => {
          // Remove the old today record if it exists
          const filteredRecords = prevRecords.filter(rec => {
            const recDate = new Date(rec.date);
            recDate.setHours(0, 0, 0, 0);
            const todayDate = new Date(today);
            todayDate.setHours(0, 0, 0, 0);
            return recDate.getTime() !== todayDate.getTime();
          });
          
          // Add the default today record
          return [defaultTodayRecord, ...filteredRecords].sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          );
        });
      }
    });

    // For simplicity, we'll reload past records periodically
    // A more sophisticated approach would be to listen to all relevant documents
    const intervalId = setInterval(() => {
      loadAllRecords();
    }, 30000); // Refresh every 30 seconds

    return () => {
      unsubscribeToday();
      clearInterval(intervalId);
    };
  }, [employeeId, startDate.getTime(), endDate.getTime()]);

  const rangeLabel = `This Week: ${startDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })} - ${endDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })}`;

  return (
    <IonPage>
      <HistoryLayout
        initials={initials}
        userName={userName}
        todayRecord={todayRecord}
        rangeLabel={rangeLabel}
        loading={loading}
        records={records}
        showModal={showModal}
        startDate={startDate}
        endDate={endDate}
        setShowModal={setShowModal}
        setStartDate={setStartDate}
        setEndDate={setEndDate}
        userPhoto={userPhoto}
        photoLoading={photoLoading}
        photoError={photoError}
      />
    </IonPage>
  );
};

export default History;
