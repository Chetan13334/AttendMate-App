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
  const liveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const dateRangeRef = useRef<{start: number, end: number} | null>(null);

  const userEmail = localStorage.getItem("userEmail");
  const userName = userEmail?.split("@")[0]?.replace(".", " ") || "Employee";
  const initials = getInitials(userName);

  const [startDate, setStartDate] = useState<Date>(() => {
    const date = new Date();
    date.setDate(date.getDate() - 6);
    date.setHours(0, 0, 0, 0);
    console.log("Initial start date:", date.toISOString());
    return date;
  });
  const [endDate, setEndDate] = useState<Date>(() => {
    const date = new Date();
    date.setHours(23, 59, 59, 999);
    console.log("Initial end date:", date.toISOString());
    return date;
  });

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
    console.log(" useEffect triggered with:", { 
      employeeId, 
      startDate: startDate.toISOString(), 
      endDate: endDate.toISOString() 
    });
    
    // Log the previous date range vs new date range
    if (dateRangeRef.current) {
      console.log("Previous date range:", 
        new Date(dateRangeRef.current.start).toISOString(), 
        "to", 
        new Date(dateRangeRef.current.end).toISOString());
    }
    dateRangeRef.current = {start: startDate.getTime(), end: endDate.getTime()};
    console.log("Stored new date range in ref");

    const today = new Date();
    const unsub = subscribeToTodayRecord(
      employeeId,
      ({ checkIn, checkOut }) => {
        if (liveTimerRef.current) clearInterval(liveTimerRef.current);

        if (checkIn && !checkOut) {
          const updateLiveDuration = () => {
            const now = new Date();
            const liveDuration = getDuration(checkIn, now);
            const liveRecord = {
              date: today,
              checkIn: checkIn.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
              checkOut: "Not marked",
              duration: liveDuration,
            };
            setTodayRecord(liveRecord);
            setRecords((prev) => {
              const others = prev.filter((r) => {
                const recordDate = new Date(r.date);
                recordDate.setHours(0, 0, 0, 0);
                const todayDate = new Date(today);
                todayDate.setHours(0, 0, 0, 0);
                return recordDate.getTime() !== todayDate.getTime();
              });
              return [liveRecord, ...others].sort(
                (a, b) => b.date.getTime() - a.date.getTime()
              );
            });
          };
          updateLiveDuration();
          liveTimerRef.current = setInterval(updateLiveDuration, 5000);
        } else if (checkIn && checkOut) {
          const finalRecord = {
            date: today,
            checkIn: checkIn.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            checkOut: checkOut.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            duration: getDuration(checkIn, checkOut),
          };
          setTodayRecord(finalRecord);
          setRecords((prev) => {
            const others = prev.filter((r) => {
              const recordDate = new Date(r.date);
              recordDate.setHours(0, 0, 0, 0);
              const todayDate = new Date(today);
              todayDate.setHours(0, 0, 0, 0);
              return recordDate.getTime() !== todayDate.getTime();
            });
            return [finalRecord, ...others].sort(
              (a, b) => b.date.getTime() - a.date.getTime()
            );
          });
        } else {
          const emptyRecord = {
            date: today,
            checkIn: "Not marked",
            checkOut: "Not marked",
            duration: "N/A",
          };
          setTodayRecord(emptyRecord);
          setRecords((prev) => {
            const others = prev.filter((r) => {
              const recordDate = new Date(r.date);
              recordDate.setHours(0, 0, 0, 0);
              const todayDate = new Date(today);
              todayDate.setHours(0, 0, 0, 0);
              return recordDate.getTime() !== todayDate.getTime();
            });
            return [emptyRecord, ...others].sort(
              (a, b) => b.date.getTime() - a.date.getTime()
            );
          });
        }
      },
      () => {
        setTodayRecord(null);
        setRecords((prev) =>
          prev.filter((r) => {
            const recordDate = new Date(r.date);
            recordDate.setHours(0, 0, 0, 0);
            const todayDate = new Date();
            todayDate.setHours(0, 0, 0, 0);
            return recordDate.getTime() !== todayDate.getTime();
          })
        );
      }
    );

    /* Fetch past records every time date range changes */
    const loadPastRecords = async () => {
      try {
        const today = new Date();
        let start = new Date(startDate);
        let end = new Date(endDate);
        if (start > end) [start, end] = [end, start];
      
        console.log("Date range in History component:", start.toISOString(), "to", end.toISOString());
        console.log("Start time:", start.getTime(), "End time:", end.getTime());
      
        // Ensure start and end are properly normalized
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        
        console.log("Normalized date range:", start.toISOString(), "to", end.toISOString());
        console.log("Normalized start time:", start.getTime(), "Normalized end time:", end.getTime());
      
        const pastRecords = await fetchPastRecords(employeeId, start, end);
      
        console.log("Received past records:", pastRecords.length);
        pastRecords.forEach((record, index) => {
          console.log(`Past Record ${index}:`, record.date.toISOString());
        });
      
        // Filter out today's record from past records since it's handled separately
        const filteredPast = pastRecords.filter((rec) => {
          const recordDate = new Date(rec.date);
          recordDate.setHours(0, 0, 0, 0);
          const todayDate = new Date(today);
          todayDate.setHours(0, 0, 0, 0);
          const shouldInclude = recordDate.getTime() !== todayDate.getTime();
          console.log("Filtering record:", recordDate.toISOString(), "Today:", todayDate.toISOString(), "Include:", shouldInclude);
          return shouldInclude;
        });

        console.log("Filtered past records:", filteredPast.length);

        // Update records state with filtered past records
        setRecords((prev) => {
          console.log("Previous records count:", prev.length);
          prev.forEach((record, index) => {
            console.log(`Previous Record ${index}:`, record.date.toISOString());
          });
          
          // When narrowing date range, we should completely replace past records
          // not try to merge with previous ones
          const combined = todayRecord
            ? [todayRecord, ...filteredPast]
            : [...filteredPast];
            
          console.log("Setting records with:", combined.length, "records");
          combined.forEach((record, index) => {
            console.log(`Combined Record ${index}:`, record.date.toISOString());
          });
          
          return combined.sort((a, b) => b.date.getTime() - a.date.getTime());
        });
      } catch (err) {
        console.error("Error loading past records:", err);
      } finally {
        setLoading(false);
      }
    };

    loadPastRecords();

    return () => {
      unsub();
      if (liveTimerRef.current) clearInterval(liveTimerRef.current);
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
      />
    </IonPage>
  );
};

export default History;
