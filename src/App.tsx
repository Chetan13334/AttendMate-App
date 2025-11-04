import { Redirect, Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet, setupIonicReact, IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import Home from './pages/Home';
// Import icons for the bottom navigation bar
import { home, calendar, list, person } from 'ionicons/icons'; 
import LocationChecker from './components/OnLocation'; // From friend's branch (testing)
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
            {/* ROUTES WITHOUT FOOTER (Authentication pages)
                These are placed outside the IonTabs definition.
            */}
            <IonRouterOutlet id="main-router">
                <Route exact path="/login">
                    <Login />
                </Route>
                <Route exact path="/onlocation">
                    <LocationChecker />
                </Route>
                
                {/* DEFAULT REDIRECT: Redirects to login page */}
                <Route exact path="/">
                    {/* TODO: In the final version, this logic should check the user's logged-in state */}
                    <Redirect to="/login" />
                </Route>
            </IonRouterOutlet>
            
            {/* ION TABS WRAPPER (FOR ROUTES WITH FOOTER)
                The footer only appears for pages rendered inside this IonTabs wrapper.
            */}
            <IonTabs>
                <IonRouterOutlet>
                    {/* Primary Dashboard Route */}
                    <Route exact path="/home">
                        <Home />
                    </Route>
                    
                    {/* Placeholder Tab Routes */}
                    <Route exact path="/schedule">
                        <Redirect to="/home" /> 
                    </Route>
                    <Route exact path="/history">
                        <Redirect to="/home" /> 
                    </Route>
                    <Route exact path="/profile">
                        <Redirect to="/home" /> 
                    </Route>
                </IonRouterOutlet>

                {/* Bottom Tab Bar (The Footer) */}
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