import React from "react";
import { Redirect, Route } from "react-router-dom";

interface ProtectedRouteProps {
  component: React.ComponentType<any>;
  isLoggedIn: boolean;
  exact?: boolean;
  path: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  component: Component,
  isLoggedIn,
  ...rest
}) => {
  return (
    <Route
      {...rest}
      render={(props) =>
        isLoggedIn ? <Component {...props} /> : <Redirect to="/login" />
      }
    />
  );
};

export default ProtectedRoute;
