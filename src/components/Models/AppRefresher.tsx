import React from "react";
import {
  IonRefresher,
  IonRefresherContent
} from "@ionic/react";

interface Props {
  onRefresh?: () => Promise<void> | void;
}

const AppRefresher: React.FC<Props> = ({ onRefresh }) => {

  const handleRefresh = async (event: CustomEvent) => {
    try {
      if (onRefresh) await onRefresh();
    } finally {
      setTimeout(() => {
        event.detail.complete();
      }, 700);
    }
  };

  return (
    <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
      <IonRefresherContent
        pullingIcon="chevron-down-circle-outline"
        pullingText="Pull to refresh"
        refreshingSpinner="crescent"
        refreshingText="Refreshing data..."
      />
    </IonRefresher>
  );
};

export default AppRefresher;
