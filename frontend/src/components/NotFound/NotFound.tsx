// import { Link } from "react-router-dom";

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

        {/* <Link to="/">Go Home</Link> */}
      </div>
    </div>
  );
};

export default NotFound;
