import React, { useState, useEffect } from "react";
import { IonPage } from "@ionic/react";
import { db } from "../firebase";
import {
  collection,
  query,
  where,
  doc,
  onSnapshot,
  getDocs,
  getDoc,
} from "firebase/firestore";
import HistoryLayout from "./HistoryLayout";

/* --------------------- Utility Functions --------------------- */
const getInitials = (name: string) =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

const getDuration = (checkIn: Date, checkOut: Date) => {
  const diffMs = checkOut.getTime() - checkIn.getTime();
  const hrs = Math.floor(diffMs / (1000 * 60 * 60));
  const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  return `${hrs}h ${mins}m`;
};

/* --------------------- Component --------------------- */
const History: React.FC = () => {
  const [records, setRecords] = useState<any[]>([]);
  const [todayRecord, setTodayRecord] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [employeeId, setEmployeeId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  const userEmail = localStorage.getItem("userEmail");
  const userName = userEmail?.split("@")[0]?.replace(".", " ") || "Employee";
  const initials = getInitials(userName);

  // Default range (last 6 days + today)
  const [startDate, setStartDate] = useState<Date>(
    new Date(new Date().setDate(new Date().getDate() - 6))
  );
  const [endDate, setEndDate] = useState<Date>(new Date());

  /* --------------------- Fetch Employee ID --------------------- */
  useEffect(() => {
    const fetchEmployeeId = async () => {
      if (!userEmail) return;
      try {
        const q = query(
          collection(db, "Employee_Details"),
          where("Email", "==", userEmail)
        );
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          const emp = snapshot.docs[0].data();
          setEmployeeId(emp.EmployeeID);
        }
      } catch (err) {
        console.error("Error fetching EmployeeID:", err);
      }
    };
    fetchEmployeeId();
  }, [userEmail]);

  /* --------------------- Real-time + Past Records --------------------- */
  useEffect(() => {
    if (!employeeId) return;

    setLoading(true);
    const today = new Date();
    const todayKey = `${today.getFullYear()}-${String(
      today.getMonth() + 1
    ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

    /* 🔹 Real-time listener for today's record */
    const todayRef = doc(
      db,
      "Employee_CheckIn_CheckOut",
      todayKey,
      "employee_records",
      employeeId
    );

    const unsubToday = onSnapshot(todayRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        const checkIn = data.CheckIn ? data.CheckIn.toDate() : null;
        const checkOut = data.CheckOut ? data.CheckOut.toDate() : null;

        const updatedRecord = {
          date: new Date(today),
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
        };

        setTodayRecord(updatedRecord);

        // 🔄 Also update the same record inside list view in real-time
        setRecords((prev) => {
          const otherRecords = prev.filter(
            (r) => r.date.toDateString() !== updatedRecord.date.toDateString()
          );
          return [updatedRecord, ...otherRecords].sort(
            (a, b) => b.date.getTime() - a.date.getTime()
          );
        });
      } else {
        setTodayRecord(null);
      }
    });

    /* 🔹 Fetch last 6 days' records once */
    const fetchPreviousRecords = async () => {
      const allRecords: any[] = [];
      try {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const current = new Date(start);

        while (current <= end) {
          const dateKey = `${current.getFullYear()}-${String(
            current.getMonth() + 1
          ).padStart(2, "0")}-${String(current.getDate()).padStart(2, "0")}`;

          const recordRef = doc(
            db,
            "Employee_CheckIn_CheckOut",
            dateKey,
            "employee_records",
            employeeId
          );
          const snap = await getDoc(recordRef);
          if (snap.exists()) {
            const data = snap.data();
            const checkIn = data.CheckIn ? data.CheckIn.toDate() : null;
            const checkOut = data.CheckOut ? data.CheckOut.toDate() : null;

            allRecords.push({
              date: new Date(current),
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
              duration:
                checkIn && checkOut ? getDuration(checkIn, checkOut) : "N/A",
            });
          }
          current.setDate(current.getDate() + 1);
        }

        const sorted = allRecords.sort(
          (a, b) => b.date.getTime() - a.date.getTime()
        );
        const limited = sorted.slice(0, 6);

        // Merge today’s record cleanly
        setRecords((prev) => {
          const finalList = [...limited];
          if (
            todayRecord &&
            !finalList.some(
              (r) =>
                r.date.toDateString() === new Date(todayRecord.date).toDateString()
            )
          ) {
            finalList.unshift(todayRecord);
          }
          return finalList.sort((a, b) => b.date.getTime() - a.date.getTime());
        });
      } catch (err) {
        console.error("Error fetching past records:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPreviousRecords();

    return () => {
      unsubToday();
    };
  }, [employeeId, startDate, endDate]);

  /* --------------------- Date Range Label --------------------- */
  const rangeLabel = `This Week: ${startDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })} - ${endDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })}`;

  /* --------------------- Render --------------------- */
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