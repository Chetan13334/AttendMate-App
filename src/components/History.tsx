import React, { useState, useEffect, useRef } from "react";
import { IonPage } from "@ionic/react";
import HistoryLayout from "./HistoryLayout";
import {
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


const History: React.FC = () => {
  const [records, setRecords] = useState<any[]>([]);
  const [todayRecord, setTodayRecord] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [employeeId, setEmployeeId] = useState<string | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [liveDuration, setLiveDuration] = useState<string>("00h 00m");

  const [employeeName, setEmployeeName] = useState<string>("Employee");

  const liveTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [startDate, setStartDate] = useState<Date>(getWeekStart);
  const [endDate, setEndDate] = useState<Date>(getWeekEnd);

  useEffect(() => {
    const fetchUserPhotoAndName = async () => {
      try {
        const data = localStorage.getItem("employeeData");
        if (data) {
          const parsed = JSON.parse(data);
          if (parsed.name || parsed.Name) setEmployeeName(parsed.name || parsed.Name);
        }
      } catch {
        console.error("Failed to load user name");
      }
    };

    fetchUserPhotoAndName();
  }, []);

  useEffect(() => {
    const loadEmployeeId = async () => {
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
      const today = new Date();
      const todayStr = today.toLocaleDateString("en-CA"); // YYYY-MM-DD
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

      const pastRecords = await fetchPastRecords(
        employeeId,
        startDate,
        endDate
      );

      const filtered = pastRecords.filter((rec) => {
        const dDate = new Date(rec.date);
        dDate.setHours(0, 0, 0, 0);

        const dToday = new Date(today);
        dToday.setHours(0, 0, 0, 0);

        // 1. Skip if it's today (we handle today's record separately via todayFormatted)
        if (dDate.getTime() === dToday.getTime()) return false;

        // 2. Skip if not marked
        if (!rec.checkIn || rec.checkIn === "Not marked") return false;

        // 3. STRICT RANGE CHECK (Ensures records outside Jan 5 - Jan 11 are hidden in default view)
        const dStart = new Date(startDate);
        dStart.setHours(0, 0, 0, 0);
        const dEnd = new Date(endDate);
        dEnd.setHours(23, 59, 59, 999);

        if (dDate.getTime() < dStart.getTime() || dDate.getTime() > dEnd.getTime()) return false;

        return true;
      });

      const isTodayInRange = today.getTime() >= startDate.getTime() && today.getTime() <= endDate.getTime();

      const merged = isTodayInRange
        ? [todayFormatted, ...filtered].sort((a, b) => b.date.getTime() - a.date.getTime())
        : filtered.sort((a, b) => b.date.getTime() - a.date.getTime());

      setRecords(merged);
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    if (!showModal) {
      loadAllRecords();
    }
  }, [employeeId, startDate.getTime(), endDate.getTime(), showModal]);

  useEffect(() => {
    if (!employeeId) return;

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

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


  const isThisWeek =
    startDate.getTime() === getWeekStart().getTime() &&
    endDate.getTime() === getWeekEnd().getTime();

  const rangeLabel = isThisWeek
    ? `This Week: ${startDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })} - ${endDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })}`
    : `Custom Range: ${startDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })} - ${endDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })}`;



  return (
    <IonPage>
      <HistoryLayout
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
        liveDuration={liveDuration}
      />
    </IonPage>
  );
};

export default History;
