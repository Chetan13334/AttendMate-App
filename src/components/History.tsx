import React, { useState, useEffect, useRef } from "react";
import { IonPage } from "@ionic/react";
import HistoryLayout from "./HistoryLayout";
import {
  getInitials,
  getDuration,
  fetchEmployeeId,
  fetchPastRecords,
} from "../Services/HistoryService";
import {
  listenToAttendance,
  fetchTodayRecord
} from "../Services/AttendanceService";



const getWeekStart = () => {
  const today = new Date();
  const day = today.getDay();
  const diff = today.getDate() - day + (day === 0 ? -6 : 1);
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

  /* const userEmail = localStorage.getItem("userEmail"); */
  /* const userName = userEmail?.split("@")[0]?.replace(".", " ") || "Employee"; */
  const initials = getInitials(employeeName);

  // ------------------ DEFAULT WEEK (FIXED) ------------------

  const [startDate, setStartDate] = useState<Date>(getWeekStart);
  const [endDate, setEndDate] = useState<Date>(getWeekEnd);

  // ------------------ FETCH USER DETAILS ------------------

  useEffect(() => {
    const fetchUserPhotoAndName = async () => {
      // Use LocalStorage for basic details to avoid extra calls if possible,
      // or implement a ProfileService call if needed. 
      // For now, attempting to read from stored EmployeeData
      try {
        setPhotoLoading(true);
        const data = localStorage.getItem("employeeData");
        if (data) {
          const parsed = JSON.parse(data);
          if (parsed.image || parsed.Photo) setUserPhoto(parsed.image || parsed.Photo);
          if (parsed.name || parsed.Name) setEmployeeName(parsed.name || parsed.Name);
        }
      } catch {
        setPhotoError(true);
      } finally {
        setPhotoLoading(false);
      }
    };

    fetchUserPhotoAndName();
  }, []);

  useEffect(() => {
    const loadEmployeeId = async () => {
      // Fetch ID from LocalStorage via Service
      const id = await fetchEmployeeId();
      if (id) setEmployeeId(id);
    };
    loadEmployeeId();
  }, []);

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
      // 1. Fetch Today's Record (API)
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      const todayRaw = await fetchTodayRecord(todayStr, employeeId);

      let todayFormatted: any = null;
      if (todayRaw) {
        const checkIn = todayRaw.CheckIn ? todayRaw.CheckIn.toDate() : null;
        const checkOut = todayRaw.CheckOut ? todayRaw.CheckOut.toDate() : null;

        todayFormatted = {
          date: today,
          checkIn: checkIn ? checkIn.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Not marked",
          checkOut: checkOut ? checkOut.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Not marked",
          duration: checkIn && checkOut ? getDuration(checkIn, checkOut) : "N/A",
          checkInTime: checkIn,
          checkOutTime: checkOut,
        };
        setTodayRecord(todayFormatted);
      } else {
        // Default empty record
        const empty = {
          date: today,
          checkIn: "Not marked",
          checkOut: "Not marked",
          duration: "N/A",
          checkInTime: null,
          checkOutTime: null,
        };
        setTodayRecord(empty);
        todayFormatted = empty;
      }

      // 2. Fetch History (API)
      const pastRecords = await fetchPastRecords(
        employeeId,
        startDate,
        endDate
      );

      // Filter out today and empty records
      const filtered = pastRecords.filter((rec) => {
        // Filter out today
        const d1 = new Date(rec.date);
        const d2 = new Date(today);
        d1.setHours(0, 0, 0, 0);
        d2.setHours(0, 0, 0, 0);
        if (d1.getTime() === d2.getTime()) return false;

        // Filter out records without check-in
        if (!rec.checkIn || rec.checkIn === "Not marked") return false;

        return true;
      });

      const merged = [todayFormatted, ...filtered].sort(
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

  // Real-time listener for TODAY
  useEffect(() => {
    if (!employeeId) return;

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    // Use AttendanceService socket listener
    const unsubscribe = listenToAttendance(todayStr, employeeId, (data: any) => {
      if (data) {
        const checkIn = data.CheckIn ? data.CheckIn.toDate() : null;
        const checkOut = data.CheckOut ? data.CheckOut.toDate() : null;

        setTodayRecord({
          date: today,
          checkIn: checkIn ? checkIn.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Not marked",
          checkOut: checkOut ? checkOut.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Not marked",
          duration: checkIn && checkOut ? getDuration(checkIn, checkOut) : "N/A",
          checkInTime: checkIn,
          checkOutTime: checkOut,
        });
      }
    });

    return () => unsubscribe();
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
