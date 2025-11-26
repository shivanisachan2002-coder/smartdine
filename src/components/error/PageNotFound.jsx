import { BsExclamationTriangle, BsArrowLeftCircle } from "react-icons/bs";
import { Link } from "react-router-dom";

const PageNotFound = () => {

  return (
    <div className="d-flex flex-column justify-content-center align-items-center vh-100 bg-light text-center p-4">
      <BsExclamationTriangle size={80} className="text-warning mb-3" />
      <h1 className="display-4 fw-bold mb-3">404 - Page Not Found</h1>
      <p className="lead mb-4 text-muted">
        Oops! The page you are looking for does not exist or has been moved.
      </p>
      <Link
        className="btn btn-primary d-flex align-items-center gap-2"
        to="/smartdine-"
      >
        <BsArrowLeftCircle size={20} />
        Go Back Home
      </Link>
    </div>
  );
};

export default PageNotFound;
