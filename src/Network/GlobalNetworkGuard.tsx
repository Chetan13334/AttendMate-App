import React from "react";
import useNetworkStatus from "./useNetworkStatus";
import NetworkErrorScreen from "./NoNetwork";

interface GuardProps {
    children: React.ReactNode;
}

export default function GlobalNetworkGuard({ children }: GuardProps) {
    const isOnline = useNetworkStatus();

    if (!isOnline) {
        return <NetworkErrorScreen />;
    }

    return <>{children}</>;
}
