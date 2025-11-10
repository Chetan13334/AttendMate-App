import React, { useState, useEffect, useRef } from "react";
import { IonPage } from "@ionic/react";
import HistoryLayout from "./HistoryLayout";
import {
  getInitials,
  getDuration,
  fetchEmployeeId,
  fetchPastRecords,
  subscribeToTodayRecord,
} from "../Services/HistoryService";

const History: React.FC = () => {
  const [records, setRecords] = useState<any[]>([]);
  const [todayRecord, setTodayRecord] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [employeeId, setEmployeeId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  const userEmail = localStorage.getItem("userEmail");
  const userName = userEmail?.split("@")[0]?.replace(".", " ") || "Employee";
  const initials = getInitials(userName);

  const [startDate, setStartDate] = useState<Date>(
    new Date(new Date().setDate(new Date().getDate() - 6))
  );
  const [endDate, setEndDate] = useState<Date>(new Date());
  const liveTimerRef = useRef<NodeJS.Timeout | null>(null);


  useEffect(() => {
    if (!userEmail) return;
    const loadEmployeeId = async () => {
      const id = await fetchEmployeeId(userEmail);
      if (id) setEmployeeId(id);
    };
    loadEmployeeId();
  }, [userEmail]);

  useEffect(() => {
    if (!employeeId) return;
    setLoading(true);

    const unsub = subscribeToTodayRecord(
      employeeId,
      ({ checkIn, checkOut }) => {
        if (liveTimerRef.current) clearInterval(liveTimerRef.current);

        const today = new Date();
        if (checkIn && !checkOut) {
          const updateLiveDuration = () => {
            const now = new Date();
            const liveDuration = getDuration(checkIn, now);
            const liveRecord = {
              date: today,
              checkIn: checkIn.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              checkOut: "Not marked",
              duration: liveDuration,
            };
            setTodayRecord(liveRecord);
            setRecords((prev) => {
              const others = prev.filter(
                (r) => r.date.toDateString() !== today.toDateString()
              );
              return [liveRecord, ...others].sort(
                (a, b) => b.date.getTime() - a.date.getTime()
              );
            });
          };
          updateLiveDuration();
          liveTimerRef.current = setInterval(updateLiveDuration, 30000);
        } else if (checkIn && checkOut) {
          const finalRecord = {
            date: today,
            checkIn: checkIn.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            checkOut: checkOut.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            duration: getDuration(checkIn, checkOut),
          };
          setTodayRecord(finalRecord);
          setRecords((prev) => {
            const others = prev.filter(
              (r) => r.date.toDateString() !== today.toDateString()
            );
            return [finalRecord, ...others].sort(
              (a, b) => b.date.getTime() - a.date.getTime()
            );
          });
        }
      },
      () => {
        setTodayRecord(null);
        setRecords((prev) =>
          prev.filter((r) => r.date.toDateString() !== new Date().toDateString())
        );
      }
    );

    const loadPastRecords = async () => {
      const pastRecords = await fetchPastRecords(employeeId, startDate, endDate);
      setRecords((prev) => [...prev, ...pastRecords]);
      setLoading(false);
    };
    loadPastRecords();

    return () => {
      unsub();
      if (liveTimerRef.current) clearInterval(liveTimerRef.current);
    };
  }, [employeeId, startDate, endDate]);

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
      />
    </IonPage>
  );
};

export default History;
