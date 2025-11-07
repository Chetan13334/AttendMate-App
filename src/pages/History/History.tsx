import React, { useState, useEffect } from "react";
import { IonPage } from "@ionic/react";
import { db } from "../../firebase";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc,
} from "firebase/firestore";
import HistoryLayout from "./HistoryLayout";

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

const History: React.FC = () => {
  const [startDate, setStartDate] = useState<Date>(
    new Date(new Date().setDate(new Date().getDate() - 6))
  );
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [records, setRecords] = useState<any[]>([]);
  const [todayRecord, setTodayRecord] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [employeeId, setEmployeeId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  const userEmail = localStorage.getItem("userEmail");
  const userName = userEmail?.split("@")[0]?.replace(".", " ") || "Employee";
  const initials = getInitials(userName);

  // Fetch Employee ID
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

  // Fetch Attendance
  useEffect(() => {
    if (!employeeId) return;

    const fetchTodayAttendance = async () => {
      setLoading(true);
      try {
        const today = new Date();
        const dateKey = `${today.getFullYear()}-${String(
          today.getMonth() + 1
        ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

        const docRef = doc(
          db,
          "Employee_CheckIn_CheckOut",
          dateKey,
          "employee_records",
          employeeId
        );
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const data = snap.data();
          const checkIn = data.CheckIn ? data.CheckIn.toDate() : null;
          const checkOut = data.CheckOut ? data.CheckOut.toDate() : null;
          setTodayRecord({
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
        } else {
          setTodayRecord(null);
        }
      } catch (err) {
        console.error("Error fetching today's record:", err);
      } finally {
        setLoading(false);
      }
    };

    const fetchRangeData = async () => {
      setLoading(true);
      const allRecords: any[] = [];
      try {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const current = new Date(start);

        while (current <= end) {
          const dateKey = `${current.getFullYear()}-${String(
            current.getMonth() + 1
          ).padStart(2, "0")}-${String(current.getDate()).padStart(2, "0")}`;

          const docRef = doc(
            db,
            "Employee_CheckIn_CheckOut",
            dateKey,
            "employee_records",
            employeeId
          );
          const snap = await getDoc(docRef);
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
        setRecords(allRecords);
      } catch (err) {
        console.error("Error fetching range data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTodayAttendance();
    fetchRangeData();
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
