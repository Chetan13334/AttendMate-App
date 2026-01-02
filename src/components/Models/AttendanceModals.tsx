// import React from "react";
// import {
//   IonModal,
//   IonButton,
//   IonIcon,
//   IonSpinner
// } from "@ionic/react";
// import { timeOutline, close, checkmark } from "ionicons/icons";

// interface Props {
//   showModal: boolean;
//   modalTitle: string;
//   isProcessing: boolean;
//   executeAction: () => void;
//   setShowModal: (v: boolean) => void;

//   showLocationChecking: boolean;

//   showLocationAlert: boolean;
//   onTurnOnLocation: () => void;
//   onNoThanks: () => void;

//   showAlert: boolean;
//   msg: string;
//   setShowAlert: (v: boolean) => void;
// }

// const AttendancePopups: React.FC<Props> = ({
//   showModal,
//   modalTitle,
//   isProcessing,
//   executeAction,
//   setShowModal,

//   showLocationChecking,

//   showLocationAlert,
//   onTurnOnLocation,
//   onNoThanks,

//   showAlert,
//   msg,
//   setShowAlert,
// }) => {
//   return (
//     <>
//       {/* CONFIRM MODAL */}
//       <IonModal isOpen={showModal} backdropDismiss={false} mode="ios" className="confirm-modal">
//         <div className="confirm-modal-content">
//           <IonIcon icon={timeOutline} className="modal-icon" />
//           <h2>Confirm {modalTitle}</h2>
//           <p>Are you sure you want to proceed?</p>

//           <div className="modal-buttons">
//             <IonButton fill="outline" color="medium" onClick={() => setShowModal(false)}>
//               <IonIcon icon={close} slot="start" /> Cancel
//             </IonButton>

//             <IonButton color="success" onClick={executeAction} disabled={isProcessing}>
//               {isProcessing ? <IonSpinner name="crescent" slot="start" /> : <IonIcon icon={checkmark} slot="start" />}
//               {isProcessing ? "Processing..." : "Confirm"}
//             </IonButton>
//           </div>
//         </div>
//       </IonModal>

//       {/* LOCATION CHECKING */}
//       <IonModal isOpen={showLocationChecking} backdropDismiss={false} mode="ios" className="confirm-modal">
//         <div className="confirm-modal-content">
//           <IonSpinner name="crescent" color="primary" className="location-spinner" />
//           <h2>Checking Location</h2>
//           <p>Please wait while we verify your location...</p>
//         </div>
//       </IonModal>

//       {/* TURN ON LOCATION */}
//       <IonModal isOpen={showLocationAlert} backdropDismiss={false} mode="ios" className="confirm-modal">
//         <div className="confirm-modal-content">
//           <IonIcon icon={timeOutline} className="modal-icon" />
//           <h2>Turn On Location</h2>
//           <p>We need your location to verify check-in.</p>

//           <div className="modal-buttons">
//             <IonButton fill="outline" color="medium" onClick={onNoThanks}>
//               No thanks
//             </IonButton>
//             <IonButton color="success" fill="solid" onClick={onTurnOnLocation}>
//               OK
//             </IonButton>
//           </div>
//         </div>
//       </IonModal>

//       {/* ALERT MODAL */}
//       <IonModal isOpen={showAlert} backdropDismiss={false} mode="ios" className="confirm-modal">
//         <div className="alert-modal-content alert-modal-inner">
//           <h2>{msg.includes("Success") ? "Success" : "Action Failed"}</h2>
//           <p>{msg.replace(/Warning:|Success:/g, "").trim()}</p>

//           <IonButton expand="block" onClick={() => setShowAlert(false)} className="alert-ok-btn">
//             OK
//           </IonButton>
//         </div>
//       </IonModal>
//     </>
//   );
// };

// export default AttendancePopups;
