import { Link } from "@tanstack/react-router";
import { ROUTES } from "../../constants/routes.constants";

const NotFound = () => {
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
        <h1>Oops! 😕</h1>
        <p>Something went wrong.</p>

        <Link to={ROUTES.LOGIN}>Go Home</Link>
      </div>
    </div>
  );
};

export default NotFound;
