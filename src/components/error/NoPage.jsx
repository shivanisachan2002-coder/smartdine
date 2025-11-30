import React from "react";
import { Link } from "react-router-dom";
import { BsXCircle, BsArrowLeftCircle } from "react-icons/bs";

const NoPage = () => {
  return (
    <>
      <style>{`
        @keyframes fadeScaleIn {
          0% {
            opacity: 0;
            transform: scale(0.95);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fadeScaleIn {
          animation: fadeScaleIn 0.8s ease forwards;
        }
      `}</style>

      <div className="d-flex flex-column justify-content-center align-items-center vh-100 bg-light text-center px-3">
        <BsXCircle
          color="#dc3545"
          size={90}
          className="mb-3 animate-fadeScaleIn"
          aria-label="Error icon"
          style={{ animationDelay: "0s" }}
        />
        <h1
          className="display-1 fw-bold text-danger animate-fadeScaleIn"
          style={{ animationDelay: "0.2s" }}
        >
          404
        </h1>
        <h3
          className="mb-4 animate-fadeScaleIn"
          style={{ animationDelay: "0.4s" }}
        >
          Oops! Page Not Found
        </h3>
        <p
          className="mb-4 text-muted animate-fadeScaleIn"
          style={{ animationDelay: "0.6s" }}
        >
          The page you are looking for doesn't exist or has been moved.
        </p>
        <Link
          to="/"
          className="btn btn-primary px-4 d-inline-flex align-items-center animate-fadeScaleIn"
          style={{ animationDelay: "0.8s" }}
        >
          <BsArrowLeftCircle className="me-2" />
          Go to Home
        </Link>
      </div>
    </>
  );
};

export default NoPage;
