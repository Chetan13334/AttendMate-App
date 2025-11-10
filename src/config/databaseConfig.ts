import { db, auth, storage } from "../firebase";
import { collection, doc } from "firebase/firestore";



export const DB = {

    collections: {
        Employee_CheckIn_CheckOut: collection(db, "Employee_CheckIn_CheckOut"),
        Events: collection(db, "Events"),
        Employee_Details: collection(db, "Employee_Details"),
    },

    employeeRecord: (dateKey: string, empId: string) =>
        doc(db, "Employee_CheckIn_CheckOut", dateKey, "employee_records", empId),

    eventDoc: (eventId: string) => doc(db, "Events", eventId),


    auth,
    storage,
};

export default DB;
