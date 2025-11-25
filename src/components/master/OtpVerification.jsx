import React, { useContext, useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import ApiService from "../../apiservice/ApiService";
import { RestaurantContext } from "../../context/Context";
import logo from '../../assets/image/general/logo.png'
import bgImg from '../../assets/image/user/kitchen-6878026.jpg'


const OtpVerification = () => {
    document.title = "Email Verification | SmartDine";

    // Context and hooks
    const { sendWelcomeEmail } = useContext(RestaurantContext);
    const location = useLocation();
    const navigate = useNavigate();

    // State initialization
    const { data, otp, type } = location.state || {};
    const [otpValues, setOtpValues] = useState(["", "", "", "", ""]);
    const inputRefs = useRef([]);
    const [timeLeft, setTimeLeft] = useState(120);

    // Effect for validation and timer
    useEffect(() => {
        // Check if data or otp is missing
        if (!data || !otp) {
            toast.error("Invalid access. Please register again.");
            if (type === "restaurant") {
                navigate("/restaurant-register");
            } else {
                navigate("/user-register");
            }
        }

        // Handle OTP timeout
        if (timeLeft <= 0) {
            toast.error("OTP expired. Please try again.");
            if (type === "user") {
                // navigate("/user-register");
            } else if (type === "restaurant") {
                navigate("/restaurant-register");
            } else {
                // navigate("/smartdine"); // fallback
            }
            return;
        }

        // Countdown timer
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [navigate, data, otp, type, timeLeft]);

    // OTP input change handler
    const handleChange = (e, index) => {
        const value = e.target.value.replace(/[^0-9]/g, "");
        const newOtp = [...otpValues];
        newOtp[index] = value;
        setOtpValues(newOtp);

        // Auto-focus next input box
        if (value && index < otpValues.length - 1) {
            inputRefs.current[index + 1].focus();
        }
    };

    // OTP input backspace handler
    const handleKeyDown = (e, index) => {
        if (e.key === "Backspace" && !otpValues[index] && index > 0) {
            inputRefs.current[index - 1].focus();
        }
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        const enteredOtp = otpValues.join("");
        if (enteredOtp !== otp) {
            toast.error("Invalid OTP. Try again.");
            return;
        }

        if (type === "user") {
            toast.promise(
                ApiService.post("user/registration/", data),
                {
                    loading: "Verifying...",
                    success: () => {
                        navigate("/user-login");
                        return "User registered successfully!";
                    },
                    error: () => "Registration failed. Try again.",
                }
            );
        }
        else if (type === "restaurant") {
            // Prepare FormData for restaurant registration
            const formDataToSend = new FormData();
            Object.entries(data).forEach(([key, value]) => {
                formDataToSend.append(key, value);
            });

            toast.promise(
                ApiService.post("restaurant/registration/", formDataToSend, {
                    headers: { "Content-Type": "multipart/form-data" },
                    timeout: 0,
                })
                    .then(() => {
                        // Send welcome email after successful registration
                        return sendWelcomeEmail(
                            data.owner_name,
                            data.res_name,
                            data.email
                        )
                            .then(() => {
                                navigate("/restaurant-login");
                                return "Restaurant registered successfully! 🎉";
                            })
                            .catch((err) => {
                                console.error("📧 Email sending failed:", err);
                                navigate("/restaurant-login");
                                return "Restaurant registered successfully!";
                            });
                    })
                    .catch((err) => {
                        console.error("❌ Registration failed:", err);
                        throw err;
                    }),
                {
                    loading: "Verifying...",
                    success: (msg) => msg,
                    error: (err) => err.message || "Registration failed. Try again.",
                }
            );
        }
    };

    return (
        <>
            <div className='smartdine-banner' style={{ backgroundImage: `url(${bgImg})` }} id='userlogin'>
                <div className="smartdine-overlay opacity-75"></div>
                <div className="position-relative z-1 w-100">
                    <div className="container px-3">
                        <div className="row">
                            <div className="col-md-3"></div>

                            {/* User OTP Page */}
                            <div className="col-md-6 p-5 shadow-lg rounded-4 position-relative bg-dark bg-opacity-75">
                                <div className="mb-4 text-center">
                                    <i className="bi bi-envelope-check-fill fs-2 cl1 mb-2"></i>
                                    <h3 className="text-white fw-bold mb-1">
                                        Verify your email address
                                    </h3>
                                    <p className="text-light small">
                                        Please enter the 5-digit code sent to <b>{data?.email}</b>
                                        <br />
                                        <span className="badge bg-warning text-dark mt-1">
                                            {type === "user" ? "User Registration" : "Restaurant Registration"}
                                        </span>
                                    </p>
                                </div>

                                <hr className="border-light opacity-50" />

                                <form onSubmit={handleSubmit} className="mt-2">
                                    <div className="d-flex justify-content-center gap-2 mb-4">
                                        {otpValues.map((val, index) => (
                                            <input
                                                key={index}
                                                type="text"
                                                maxLength="1"
                                                className="form-control text-center fw-bold"
                                                style={{
                                                    width: "52px",
                                                    height: "52px",
                                                    background: "rgba(0,0,0,0.6)",
                                                    border: "1px solid black",
                                                    borderRadius: "10px",
                                                    color: "white",
                                                    fontSize: "20px",
                                                    boxShadow: "0 2px 8px rgba(0,0,0,0.10)",
                                                    outline: "none",
                                                }}
                                                value={val}
                                                ref={el => inputRefs.current[index] = el}
                                                onChange={e => handleChange(e, index)}
                                                onKeyDown={e => handleKeyDown(e, index)}
                                                required
                                            />
                                        ))}
                                    </div>
                                    <hr />
                                    <div className="d-flex justify-content-start ps-1 mb-3">
                                        {timeLeft > 0 ? (
                                            <small className="text-light">
                                                <i className="bi bi-clock-history text-warning me-1"></i>
                                                Redirect in <span className="fw-bold text-warning">{timeLeft}</span>s
                                            </small>
                                        ) : (
                                            <Link to="/" className="small text-decoration-none text-primary">
                                                <i className="bi bi-arrow-repeat me-1"></i>
                                                Resend
                                            </Link>
                                        )}
                                    </div>

                                    <button type="submit" className="btn btn-danger w-100 mb-2 rounded-pill">
                                        <i className="bi bi-check2-circle me-2"></i>
                                        Verify
                                    </button>

                                    <button type="button"
                                        className="btn btn-outline-light w-100 rounded-pill"
                                        onClick={() => navigate(-1)}>
                                        <i className="bi bi-x-circle me-2"></i>
                                        Cancel
                                    </button>
                                </form>
                            </div>

                            <div className="col-md-3"></div>
                        </div>
                    </div>
                </div>
            </div>

        </>

    );
};

export default OtpVerification