import React from "react";
import { IonModal, IonButton } from "@ionic/react";

interface ConfirmPopupProps {
    isOpen: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

import "../theme/components/ConfirmLogoutPopup.css";

const ConfirmPopup: React.FC<ConfirmPopupProps> = ({
    isOpen,
    onConfirm,
    onCancel
}) => {
    return (
        <IonModal
            isOpen={isOpen}
            onDidDismiss={onCancel}
            className="logout-popup-modal"
            backdropDismiss={true}
            mode="ios"
        >
            <div className="popup-container">
                <h2 className="popup-title">
                    Logout Confirmation
                </h2>

                <p className="popup-message">
                    Are you sure you want to logout?
                </p>

                <div className="popup-buttons">


                    <IonButton
                        expand="block"
                        className="popup-btn"
                        fill="outline"
                        onClick={onCancel}
                        color="medium"
                    >
                        Cancel
                    </IonButton>
                    <IonButton
                        expand="block"
                        className="popup-btn"
                        onClick={onConfirm}
                        color="primary"
                    >
                        Confirm
                    </IonButton>
                </div>
            </div>
        </IonModal>
    );
};

export default ConfirmPopup;
