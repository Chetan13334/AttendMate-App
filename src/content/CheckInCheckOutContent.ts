// src/content/CheckInCheckOutContent.ts
export const CheckInCheckOutContent = {
  notChecked: {
    title: "CHECK IN",
    status: "STATUS: Pending",
    statusColor: "#e37704",
    timeColor: "#0035f4",
    buttonColor: "#16bc5b",
    bgGradient: "linear-gradient(135deg, #E0F7FA 0%, #B2EBF2 100%)",
    successMsg: "✅ Check-In Successful!",
    failMsg: "⚠️ Check-In Failed: You are not in the designated location!",
  },

  checkedIn: {
    title: "CHECK OUT",
    subtitle: "Tap to end your shift",
    status: "STATUS: Checked In",
    statusColor: "#29c546",
    headerBg: "#00BCD4",
    iconColor: "#00BCD4",
    successMsg: "✅ Check-Out Successful!",
    failMsg: "⚠️ Check-Out Failed: You are not in the designated location!",
  },

  checkedOut: {
    title: "DAY COMPLETE",
    subtitle: "Great job! See you tomorrow",
    status: "STATUS: Checked Out",
    statusColor: "#d32f2f",
    headerBg: "#3880ff",
  },

  modals: {
    confirmTitle: "Confirm",
    confirmMsg: "Are you sure you want to proceed?",
    processingText: "Processing...",
    checkingTitle: "Checking Location",
    checkingMsg: "Please wait while we verify your location...",
  },

  alerts: {
    locationRequiredTitle: "Location Required",
    // locationRequiredMsg: "Location is off. Please turn on location to continue.",
    locationError: "Please turn on location in settings and try again.",
    successTitle: "Success",
    failTitle: "Action Failed",
  },
};
