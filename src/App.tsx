import { Redirect, Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet, setupIonicReact, IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import Home from './pages/Home';
// Import icons for the bottom navigation bar
import { home, calendar, list, person } from 'ionicons/icons'; 
// import LocationChecker from './components/OnLocation'; // 🛑 REMOVED: This component is not needed and doesn't exist.
import { Login } from './auth/Login'; // From friend's branch (auth)

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';
/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';
/* Optional CSS utils */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';
/* Theme variables */
import './theme/variables.css';

setupIonicReact();

const App: React.FC = () => (
    <IonApp>
        <IonReactRouter>
            <IonTabs>
                <IonRouterOutlet>
                    
                    {/* 1. AUTHENTICATION ROUTE (Login Page) 
                        When the user is here, the IonTabs (Footer) is hidden because 
                        the routes below define what pages show the footer.
                    */}
                    <Route exact path="/login">
                        <Login />
                    </Route>
                    
                    {/* 2. MAIN APP ROUTES (Dashboard and Tabs) */}
                    <Route exact path="/home">
                        <Home />
                    </Route>
                    <Route exact path="/schedule">
                        {/* We redirect all placeholder tab pages back to home for simplicity */}
                        <Redirect to="/home" /> 
                    </Route>
                    <Route exact path="/history">
                        <Redirect to="/home" /> 
                    </Route>
                    <Route exact path="/profile">
                        <Redirect to="/home" /> 
                    </Route>

                    {/* 3. DEFAULT REDIRECT: Start the app by redirecting to the login page */}
                    <Route exact path="/">
                        {/* This will be the first page the user sees */}
                        <Redirect to="/login" />
                    </Route>
                    
                </IonRouterOutlet>

                {/* Bottom Tab Bar (The Footer) 
                    This IonTabBar is what makes the footer visible on the routes defined above it.
                */}
                <IonTabBar slot="bottom">
                    <IonTabButton tab="home" href="/home">
                        <IonIcon icon={home} />
                        <IonLabel>Home</IonLabel>
                    </IonTabButton>

                    <IonTabButton tab="schedule" href="/schedule">
                        <IonIcon icon={calendar} />
                        <IonLabel>Schedule</IonLabel>
                    </IonTabButton>

                    <IonTabButton tab="history" href="/history">
                        <IonIcon icon={list} />
                        <IonLabel>History</IonLabel>
                    </IonTabButton>

                    <IonTabButton tab="profile" href="/profile">
                        <IonIcon icon={person} />
                        <IonLabel>Profile</IonLabel>
                    </IonTabButton>
                </IonTabBar>
            </IonTabs>
        </IonReactRouter>
    </IonApp>
);

export default App;