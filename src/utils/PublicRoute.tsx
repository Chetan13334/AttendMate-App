import React from "react";
import { Redirect, Route } from "react-router-dom";

interface PublicRouteProps {
  component: React.ComponentType<any>;
  isLoggedIn: boolean;
  exact?: boolean;
  path: string;
}

const PublicRoute: React.FC<PublicRouteProps> = ({
  component: Component,
  isLoggedIn,
  ...rest
}) => {
  return (
    <Route
      {...rest}
      render={(props) =>
        !isLoggedIn ? <Component {...props} /> : <Redirect to="/home" />
      }
    />
  );
};

export default PublicRoute;
