import React, { useState, useEffect } from "react";
import { IonModal, IonButton, IonPopover, IonDatetime } from "@ionic/react";
import "../theme/components/HistoryLayout.css";

interface DateFilterModalProps {
  showModal: boolean;
  startDate: Date;
  endDate: Date;
  setShowModal: (v: boolean) => void;
  setStartDate: (v: Date) => void;
  setEndDate: (v: Date) => void;
}

function getStartOfWeek() {
  const today = new Date();
  const day = today.getDay();
  const diff = today.getDate() - day + (day === 0 ? -6 : 1);
  const start = new Date(today.setDate(diff));
  start.setHours(0, 0, 0, 0);
  return start;
}

function getEndOfWeek() {
  const today = new Date();
  const day = today.getDay();
  const diff = today.getDate() - day + 7;
  const end = new Date(today.setDate(diff));
  end.setHours(23, 59, 59, 999);
  return end;
}

const DateFilterModal: React.FC<DateFilterModalProps> = ({
  showModal,
  startDate,
  endDate,
  setShowModal,
  setStartDate,
  setEndDate,
}) => {


  const [tempStart, setTempStart] = useState<Date>(startDate);
  const [tempEnd, setTempEnd] = useState<Date>(endDate);

  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);


  useEffect(() => {
    if (showModal) {
      setTempStart(startDate);
      setTempEnd(endDate);
    }
  }, [showModal, startDate, endDate]);


  const handleReset = () => {
    const start = getStartOfWeek();
    const end = getEndOfWeek();
    setTempStart(start);
    setTempEnd(end);
  };
  const applyFilter = () => {
    setStartDate(tempStart);
    setEndDate(tempEnd);
    setShowModal(false);
  };

  return (
    <IonModal
      isOpen={showModal}
      onDidDismiss={() => setShowModal(false)}
      initialBreakpoint={0.55}
      breakpoints={[0, 0.55, 0.75]}
      className="popup-modal"
    >
      <div className="popup-container">

        <div className="popup-body">

          <div className="popup-field">
            <label>Start Date</label>

            <div
              className="popup-date-input"
              onClick={() => setShowStartPicker(true)}
            >
              {tempStart.toLocaleDateString("en-CA")}
            </div>

            <IonPopover
              isOpen={showStartPicker}
              onDidDismiss={() => setShowStartPicker(false)}
              className="small-popover"
            >
              <div className="calendar-wrapper">
                <IonDatetime
                  presentation="date"
                  value={tempStart.toLocaleDateString("en-CA")}
                  onIonChange={(e) => {
                    if (e.detail.value) {
                      const d = new Date(e.detail.value as string);
                      d.setHours(0, 0, 0, 0);
                      setTempStart(d);
                    }
                    setShowStartPicker(false);
                  }}
                />
              </div>
            </IonPopover>
          </div>

          
          <div className="popup-field">
            <label>End Date</label>

            <div
              className="popup-date-input"
              onClick={() => setShowEndPicker(true)}
            >
              {tempEnd.toLocaleDateString("en-CA")}
            </div>

            <IonPopover
              isOpen={showEndPicker}
              onDidDismiss={() => setShowEndPicker(false)}
              className="small-popover"
            >
              <div className="calendar-wrapper">
                <IonDatetime
                  presentation="date"
                  value={tempEnd.toLocaleDateString("en-CA")}
                  onIonChange={(e) => {
                    if (e.detail.value) {
                      const d = new Date(e.detail.value as string);
                      d.setHours(23, 59, 59, 999);
                      setTempEnd(d);
                    }
                    setShowEndPicker(false);
                  }}
                />
              </div>
            </IonPopover>
          </div>

          
          <button
            className="clear-filter-text-btn"
            onClick={handleReset}
          >
            Clear Filter
          </button>

          
          <IonButton
            expand="block"
            className="popup-done-btn"
            onClick={applyFilter}
          >
            Done
          </IonButton>

        </div>
      </div>
    </IonModal>
  );
};

export default DateFilterModal;
