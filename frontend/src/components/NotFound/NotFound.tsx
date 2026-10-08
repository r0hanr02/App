import { Link } from "@tanstack/react-router";
import { ROUTES } from "../../constants/routes.constants";

const NotFound = () => {
  return (
    <div
      style={{
        display: "grid",
        placeItems: "center",
        flex: 1,
        textAlign: "center",
      }}
    >
      <div>
        <h1>Oops! 😕</h1>
        <p>Something went wrong.</p>

        <Link to={ROUTES.LOGIN.path}>Go Home</Link>
      </div>
    </div>
  );
};

export default NotFound;
