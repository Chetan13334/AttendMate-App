import React from "react";
import { IonTabBar, IonTabButton, IonIcon, IonLabel } from "@ionic/react";
import {
  homeOutline,
  documentOutline,
  personOutline,
} from "ionicons/icons";

const BottomTabs: React.FC = () => {
  return (
    <IonTabBar
      slot="bottom"
      className="
        bg-white border-t border-gray-200 shadow-[0_-2px_10px_rgba(0,0,0,0.08)]
        flex justify-around items-center
        h-[64px] rounded-t-2xl
        backdrop-blur-md
      "
    >
      <IonTabButton
        tab="home"
        href="/home"
        className="
          flex flex-col items-center justify-center text-gray-500
          hover:text-blue-600 transition-all duration-200
          data-[selected=true]:text-blue-600 data-[selected=true]:font-semibold
          active:scale-95
        "
      >
        <IonIcon icon={homeOutline} className="text-[22px] mb-[2px]" />
        <IonLabel className="text-[13px] tracking-wide">Home</IonLabel>
      </IonTabButton>

      <IonTabButton
        tab="history"
        href="/history"
        className="
          flex flex-col items-center justify-center text-gray-500
          hover:text-blue-600 transition-all duration-200
          data-[selected=true]:text-blue-600 data-[selected=true]:font-semibold
          active:scale-95
        "
      >
        <IonIcon icon={documentOutline} className="text-[22px] mb-[2px]" />
        <IonLabel className="text-[13px] tracking-wide">History</IonLabel>
      </IonTabButton>

      <IonTabButton
        tab="profile"
        href="/profile"
        className="
          flex flex-col items-center justify-center text-gray-500
          hover:text-blue-600 transition-all duration-200
          data-[selected=true]:text-blue-600 data-[selected=true]:font-semibold
          active:scale-95
        "
      >
        <IonIcon icon={personOutline} className="text-[22px] mb-[2px]" />
        <IonLabel className="text-[13px] tracking-wide">Profile</IonLabel>
      </IonTabButton>
    </IonTabBar>
  );
};

export default BottomTabs;