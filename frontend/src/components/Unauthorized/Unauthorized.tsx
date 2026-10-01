import { Link } from "@tanstack/react-router";

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
        <Link to="/login">Go to Login</Link>
      </div>
    </div>
  );
};

export default Unauthorized;
