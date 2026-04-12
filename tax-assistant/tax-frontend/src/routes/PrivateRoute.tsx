import { Navigate, Outlet } from "react-router-dom";

function PrivateRoute() {
  const isAuth = localStorage.getItem("isAuth");

  return isAuth ? <Outlet /> : <Navigate to="/" />;
}

export default PrivateRoute;