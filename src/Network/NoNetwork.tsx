import React, { useState } from "react";
import { WifiOff, RotateCcw } from "lucide-react";
import { Network } from "@capacitor/network";
import "./NoNetwork.css";

const NetworkErrorScreen: React.FC = () => {
    const [isReloading, setIsReloading] = useState(false);
    const [showStatus, setShowStatus] = useState(false);
    const [statusMessage, setStatusMessage] = useState("");

   
    const getStatus = async () => {
        const status = await Network.getStatus();
        return status.connected; 
    };

   
    const handleReload = async () => {
        if (isReloading) return;

        setIsReloading(true);
        setStatusMessage("Checking network...");
        setShowStatus(true);

        setTimeout(async () => {
            const isOnline = await getStatus();

            setIsReloading(false);

            if (isOnline) {
                setStatusMessage("Reconnected! Loading...");

               
                setTimeout(() => {
                    setShowStatus(false);
                }, 600);
            } else {
                setStatusMessage("Still offline. Check Wi-Fi or mobile data.");
            }
        }, 1500);
    };

    return (
        <div className="nes-container">
          
            <div className="nes-illustration-wrapper">
                <div className="nes-moon"></div>

                <div className={`nes-ufo ${isReloading ? "nes-ufo-rotate" : ""}`}>
                    <div className="nes-ufo-top"></div>
                </div>

                <div className="nes-icon-wrapper">
                    <WifiOff className="nes-icon" />
                </div>

                {isReloading && (
                    <RotateCcw className="nes-spinner" />
                )}
            </div>

            
            <h1 className="nes-heading">Connection Lost</h1>
            <p className="nes-description">
                You are currently offline. Please check your internet connection.
            </p>

            
            <button
                className={`nes-button ${isReloading ? "nes-button-disabled" : ""}`}
                disabled={isReloading}
                onClick={handleReload}
            >
                {isReloading ? "Reconnecting..." : "Reload Page"}
            </button>

            
            {showStatus && (
                <div className="nes-modal-overlay" onClick={() => setShowStatus(false)}>
                    <div className="nes-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="nes-modal-content">
                            {isReloading && <RotateCcw className="nes-modal-spinner" />}
                            <p>{statusMessage}</p>
                        </div>

                        <button
                            className="nes-modal-close"
                            onClick={() => setShowStatus(false)}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NetworkErrorScreen;
