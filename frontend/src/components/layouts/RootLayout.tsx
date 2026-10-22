import { Outlet, useRouterState } from "@tanstack/react-router";
import { Navbar } from "./Navbar/Navbar";
import { ROUTES } from "../../constants/routes.constants";
import "./style.scss";
import Sidebar from "./Sidebar/Sidebar";

const HIDE_NAVBAR_PATHS: string[] = [
  ROUTES.LOGIN.path,
  ROUTES.REGISTER.path,
  ROUTES.ONBOARDING.path,
  ROUTES.FORGETPASSWORD.path,
  ROUTES.RESETPASSWORD.path,
];
const hideSidebarPaths = new Set<string>([
  ROUTES.LOGIN.path,
  ROUTES.REGISTER.path,
  ROUTES.ONBOARDING.path,
  ROUTES.NOORGANIZATION.path,
  ROUTES.FORGETPASSWORD.path,
  ROUTES.RESETPASSWORD.path,
]);

const RootLayout = () => {
  // `location` is the pending target during a navigation, `resolvedLocation`
  // is what is actually on screen. Hiding chrome if EITHER says hide means
  // the Sidebar/Navbar never flash on the wrong page — e.g. while the org
  // guard fetches and bounces Home -> NoOrg, the last committed (chromeless)
  // state is kept until the redirect resolves.
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const resolvedPathname = useRouterState({
    select: (s) => s.resolvedLocation?.pathname ?? s.location.pathname,
  });
  const hideNavbar =
    HIDE_NAVBAR_PATHS.includes(pathname) ||
    HIDE_NAVBAR_PATHS.includes(resolvedPathname);
  const hideSidebar =
    hideSidebarPaths.has(pathname) || hideSidebarPaths.has(resolvedPathname);
  return (
    <div className="root-layout" style={{ fontFamily: "Inter, sans-serif" }}>
      {/* <Sidebar /> */}
      <div className="root-layout-main f1">
        {!hideSidebar && <Sidebar />}
        <div className="root-layout-content">
          {!hideNavbar && <Navbar />}

          <div className="root-container">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RootLayout;
