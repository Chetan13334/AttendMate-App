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
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  onSnapshot,
} from "firebase/firestore";

import { DB } from "../config/databaseConfig";

// ------------------ WEEK FUNCTIONS ------------------

const getWeekStart = () => {
  const today = new Date();
  const day = today.getDay(); // 0 = Sun, 1 = Mon...
  const diff = today.getDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday
  const start = new Date(today.setDate(diff));
  start.setHours(0, 0, 0, 0);
  return start;
};

const getWeekEnd = () => {
  const today = new Date();
  const day = today.getDay();
  const diff = today.getDate() - day + 7; // End = Sunday
  const end = new Date(today.setDate(diff));
  end.setHours(23, 59, 59, 999);
  return end;
};

// ------------------ TODAY RECORD FETCH ------------------

const fetchTodayRecordOnce = async (employeeId: string) => {
  const today = new Date();
  const todayKey = `${today.getFullYear()}-${String(
    today.getMonth() + 1
  ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

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
      ? checkIn.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
      : "Not marked",
    checkOut: checkOut
      ? checkOut.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
      : "Not marked",
    duration: checkIn && checkOut ? getDuration(checkIn, checkOut) : "N/A",
    checkInTime: checkIn,
    checkOutTime: checkOut,
  };
};

// ------------------ MAIN COMPONENT ------------------

const History: React.FC = () => {
  const [records, setRecords] = useState<any[]>([]);
  const [todayRecord, setTodayRecord] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [employeeId, setEmployeeId] = useState<string | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [liveDuration, setLiveDuration] = useState<string>("00h 00m");

  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [employeeName, setEmployeeName] = useState<string>("Employee");
  const [photoLoading, setPhotoLoading] = useState(true);
  const [photoError, setPhotoError] = useState(false);

  const liveTimerRef = useRef<NodeJS.Timeout | null>(null);

  const userEmail = localStorage.getItem("userEmail");
  const userName = userEmail?.split("@")[0]?.replace(".", " ") || "Employee";
  const initials = getInitials(employeeName);

  // ------------------ DEFAULT WEEK (FIXED) ------------------

  const [startDate, setStartDate] = useState<Date>(getWeekStart);
  const [endDate, setEndDate] = useState<Date>(getWeekEnd);

  // ------------------ FETCH USER DETAILS ------------------

  useEffect(() => {
    const fetchUserPhotoAndName = async () => {
      if (!userEmail) return;
      try {
        setPhotoLoading(true);
        const q = query(
          collection(db, "Employee_Details"),
          where("Email", "==", userEmail)
        );
        const snap = await getDocs(q);

        if (!snap.empty) {
          const employeeData = snap.docs[0].data();
          if (employeeData.Photo) setUserPhoto(employeeData.Photo);
          if (employeeData.Name) setEmployeeName(employeeData.Name);
        }
      } catch {
        setPhotoError(true);
      } finally {
        setPhotoLoading(false);
      }
    };

    fetchUserPhotoAndName();
  }, [userEmail]);



  useEffect(() => {
    const loadEmployeeId = async () => {
      if (!userEmail) return;
      const id = await fetchEmployeeId(userEmail);
      if (id) setEmployeeId(id);
    };
    loadEmployeeId();
  }, [userEmail]);



  useEffect(() => {
    if (liveTimerRef.current) clearInterval(liveTimerRef.current);

    if (todayRecord?.checkInTime && !todayRecord?.checkOutTime) {
      const updateDuration = () => {
        const now = new Date();
        const checkInTime = new Date(todayRecord.checkInTime);
        const diff = now.getTime() - checkInTime.getTime();
        const h = Math.floor(diff / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        setLiveDuration(`${String(h).padStart(2, "0")}h ${String(m).padStart(2, "0")}m`);
      };

      updateDuration();
      liveTimerRef.current = setInterval(updateDuration, 1000);
    } else {
      if (todayRecord?.duration && todayRecord.duration !== "N/A") {
        setLiveDuration(todayRecord.duration);
      } else {
        setLiveDuration("00h 00m");
      }
    }

    return () => {
      if (liveTimerRef.current) clearInterval(liveTimerRef.current);
    };
  }, [todayRecord]);



  const loadAllRecords = async () => {
    if (!employeeId) return;
    setLoading(true);

    try {
      const todayData = await fetchTodayRecordOnce(employeeId);
      setTodayRecord(todayData);

      const pastRecords = await fetchPastRecords(
        employeeId,
        startDate,
        endDate
      );

      const filtered = pastRecords.filter((rec) => {
        const d1 = new Date(rec.date);
        const d2 = new Date(todayData.date);
        d1.setHours(0, 0, 0, 0);
        d2.setHours(0, 0, 0, 0);
        return d1.getTime() !== d2.getTime();
      });

      const merged = [todayData, ...filtered].sort(
        (a, b) => b.date.getTime() - a.date.getTime()
      );

      setRecords(merged);
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    loadAllRecords();
  }, [employeeId, startDate.getTime(), endDate.getTime()]);

  useEffect(() => {
    if (!showModal) {
      setTimeout(() => loadAllRecords(), 150);
    }
  }, [showModal]);



  useEffect(() => {
    if (!employeeId) return;

    const today = new Date();
    const key = `${today.getFullYear()}-${String(
      today.getMonth() + 1
    ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

    const unsub = onSnapshot(DB.employeeRecord(key, employeeId), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        const checkIn = data.CheckIn ? data.CheckIn.toDate() : null;
        const checkOut = data.CheckOut ? data.CheckOut.toDate() : null;

        setTodayRecord({
          date: today,
          checkIn: checkIn
            ? checkIn.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            : "Not marked",
          checkOut: checkOut
            ? checkOut.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            : "Not marked",
          duration:
            checkIn && checkOut ? getDuration(checkIn, checkOut) : "N/A",
          checkInTime: checkIn,
          checkOutTime: checkOut,
        });
      }
    });

    return () => unsub();
  }, [employeeId]);


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
        liveDuration={liveDuration}
      />
    </IonPage>
  );
};

export default History;
