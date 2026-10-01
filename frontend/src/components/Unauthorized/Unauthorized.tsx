// import { Button } from "../ui/Button/Button";
// import { handleLogout } from "../../auth/auth.api";

const Unauthorized = () => {
  return (
    <div
      style={{
        display: "grid",
        placeItems: "center",
        height: "100vh",
        textAlign: "center",
      }}
    >
      <div>
        <h1>🔒 Access Denied</h1>
        <p>You don't have permission to view this page.</p>
        {/* <Button onClick={handleLogout}>Log Out</Button> */}
      </div>
    </div>
  );
};

export default Unauthorized;
