import { Outlet, useLocation } from "@tanstack/react-router";
import Navbar from "./Navbar/Navbar";
import { ROUTES } from "../../constants/routes.constants";
import "./style.scss";

const HIDE_NAVBAR_PATHS: string[] = [ROUTES.LOGIN.path, ROUTES.REGISTER.path];

const RootLayout = () => {
  const location = useLocation();
  const hideNavbar = HIDE_NAVBAR_PATHS.includes(location.pathname);

  return (
    <>
      <div className="root-layout" style={{ fontFamily: "Inter, sans-serif" }}>
        {/* <Sidebar /> */}
        <div className="root-layout-main">
          {!hideNavbar && <Navbar />}

          <div className="root-container">
            <Outlet />
          </div>
        </div>
      </div>
    </>
  );
};

export default RootLayout;
