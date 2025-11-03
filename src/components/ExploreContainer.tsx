import './ExploreContainer.css';
import  LocationBTN from "./LocationBTN";
import  Location from "./OnLocation";
import CheckIn from "./CheckInBTN";

interface ContainerProps { }

const ExploreContainer: React.FC<ContainerProps> = () => {
  return (
    <div id="container">
      <div><Location /></div>
      <div><LocationBTN /></div>
      
    
    

      <br />
      <div>
      <strong>WELCOME TO THE SCALER TECHHUB TEAM</strong>
        <CheckIn />
      </div>
      <br />
      
    </div>
    
  );
};

export default ExploreContainer;