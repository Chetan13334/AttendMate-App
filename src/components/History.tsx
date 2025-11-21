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
      checkInTime: null,
      checkOutTime: null,
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
    checkInTime: checkIn,
    checkOutTime: checkOut,
  };
};

const History: React.FC = () => {
  const [records, setRecords] = useState<any[]>([]);
  const [todayRecord, setTodayRecord] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [employeeId, setEmployeeId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [liveDuration, setLiveDuration] = useState<string>("00h 00m"); // New state for live duration

  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [employeeName, setEmployeeName] = useState<string>("Employee");
  const [photoLoading, setPhotoLoading] = useState(true);
  const [photoError, setPhotoError] = useState(false);

  const liveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const userEmail = localStorage.getItem("userEmail");

  const userName = userEmail?.split("@")[0]?.replace(".", " ") || "Employee";
  const initials = getInitials(employeeName);

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
     FETCH USER PHOTO AND NAME
  ------------------------------------------- */
  useEffect(() => {
    const fetchUserPhotoAndName = async () => {
      if (!userEmail) return;
      try {
        setPhotoLoading(true);
        const q = query(collection(db, "Employee_Details"), where("Email", "==", userEmail));
        const snap = await getDocs(q);
        if (!snap.empty) {
          const employeeData = snap.docs[0].data();
          if (employeeData.Photo) {
            setUserPhoto(employeeData.Photo as string);
          }
          if (employeeData.Name) {
            setEmployeeName(employeeData.Name as string);
          }
        }
      } catch {
        setPhotoError(true);
      } finally {
        setPhotoLoading(false);
      }
    };
    fetchUserPhotoAndName();
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

  /* -------------------------------------------
     LIVE DURATION CALCULATION
  ------------------------------------------- */
  useEffect(() => {
    // Clear any existing timer
    if (liveTimerRef.current) {
      clearInterval(liveTimerRef.current);
      liveTimerRef.current = null;
    }

    // Log for debugging
    console.log("Today Record:", todayRecord);
    
    // Only start timer if we have a check-in time but no check-out time
    if (todayRecord?.checkInTime && !todayRecord?.checkOutTime) {
      console.log("Starting live duration timer");
      const updateLiveDuration = () => {
        const now = new Date();
        const checkInTime = new Date(todayRecord.checkInTime);
        const diffMs = now.getTime() - checkInTime.getTime();
        const hrs = Math.floor(diffMs / 3600000);
        const mins = Math.floor((diffMs % 3600000) / 60000);
        const seconds = Math.floor((diffMs % 60000) / 1000);
        const formattedDuration = `${hrs.toString().padStart(2, '0')}h ${mins.toString().padStart(2, '0')}m`;
        console.log("Live duration:", formattedDuration);
        setLiveDuration(formattedDuration);
      };

      // Initial update
      updateLiveDuration();
      
      // Update every second for real-time counting
      liveTimerRef.current = setInterval(updateLiveDuration, 1000);
    } else {
      // If not actively tracking, show the stored duration or default
      console.log("Not tracking live duration");
      if (todayRecord?.duration && todayRecord?.duration !== "N/A") {
        setLiveDuration(todayRecord.duration);
      } else {
        setLiveDuration("00h 00m");
      }
    }

    // Cleanup function
    return () => {
      if (liveTimerRef.current) {
        clearInterval(liveTimerRef.current);
        liveTimerRef.current = null;
      }
    };
  }, [todayRecord]);

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
        setTodayRecord(todayData);

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

        setRecords(merged);
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
          checkInTime: checkIn,
          checkOutTime: checkOut,
        };
        
        setTodayRecord(updatedTodayRecord);
      } else {
        // If document doesn't exist, update with default values
        const defaultTodayRecord = {
          date: today,
          checkIn: "Not marked",
          checkOut: "Not marked",
          duration: "N/A",
          checkInTime: null,
          checkOutTime: null,
        };
        
        setTodayRecord(defaultTodayRecord);
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
      // Clear live timer on unmount
      if (liveTimerRef.current) {
        clearInterval(liveTimerRef.current);
      }
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
        userName={employeeName}
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
        liveDuration={liveDuration} // Pass live duration to layout
      />
    </IonPage>
  );
};

export default History;