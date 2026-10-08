import { Outlet, useLocation } from "@tanstack/react-router";
import { Navbar } from "./Navbar/Navbar";
import { ROUTES } from "../../constants/routes.constants";
import "./style.scss";
import Sidebar from "./Sidebar/Sidebar";

const HIDE_NAVBAR_PATHS: string[] = [
  ROUTES.LOGIN.path,
  ROUTES.REGISTER.path,
  ROUTES.ONBOARDING.path,
];
const hideSidebarPaths: string[] = [
  ROUTES.LOGIN.path,
  ROUTES.REGISTER.path,
  ROUTES.ONBOARDING.path,
  ROUTES.NOORGANIZATION.path,
];

const RootLayout = () => {
  const location = useLocation();
  const hideNavbar = HIDE_NAVBAR_PATHS.includes(location.pathname);
  return (
    <>
      <div className="root-layout" style={{ fontFamily: "Inter, sans-serif" }}>
        {/* <Sidebar /> */}
        <div className="root-layout-main f1">
          {!hideSidebarPaths.includes(location.pathname) && <Sidebar />}
          <div className="root-layout-content">
            {!hideNavbar && <Navbar />}

            <div className="root-container">
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default RootLayout;
