import useAuth from "@/hooks/useAuth";
import { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import TopNav from "./TopNav";
import LeftNav from "./LeftNav";
import BottomNav from "./BottomNav";

const AppContainer = () => {
  const { user, isLoading } = useAuth();
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return isLoading ? (
    <div>Loading...</div>
  ) : user ? (
    <div>
      <TopNav />
      <LeftNav />
      <Outlet />
      <BottomNav />
    </div>
  ) : (
    <Navigate
      to="/login"
      replace
      state={{ redirectUrl: window.location.pathname }}
    />
  );
};

export default AppContainer;
