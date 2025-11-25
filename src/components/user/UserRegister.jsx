import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import emailjs from "emailjs-com";
import bgImg from '../../assets/image/user/kitchen-6878026.jpg';
import { MainContext } from '../../context/Context';

const UserRegister = () => {
  document.title = "User Register | SmartDine 🍽️";
  const navigate = useNavigate();
  const icon = 'input-group-text text-muted';
  const { contactData = {}, fetchAllExistingContacts } = useContext(MainContext);

  const [formData, setFormData] = useState({
    user_name: '',
    user_email: '',
    user_mobile_no: '',
    user_password: '',
    user_confirm_password: ''
  });

  useEffect(() => {
    fetchAllExistingContacts();
     // eslint-disable-next-line
  }, []);

  // Helpers
  const isValidEmail = (email) =>
    /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(email);

  const isValidMobile = (mobile) =>
    /^(\+91[-\s]?)?[0]?(91)?[6789]\d{9}$/.test(mobile);

  const contactExists = (field, value) => {
    if (!contactData || (!Array.isArray(contactData.emails) && !Array.isArray(contactData.mobiles))) return false;
    if (field === "email") {
      return contactData.emails.some(
        email => email.trim().toLowerCase() === value.trim().toLowerCase()
      );
    }
    if (field === "mobile") {
      const normalize = v => v.replace(/[^0-9]/g, '').replace(/^0+/, '');
      const val = normalize(value);
      return contactData.mobiles.some(mobile => normalize(mobile) === val);
    }
    return false;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Optional: validate on blur for instant error feedback
  const handleBlur = (e) => {
    const { name, value } = e.target;
    if (name === "user_email" && value) {
      if (!isValidEmail(value)) toast.error("Invalid email format.");
      else if (contactExists("email", value)) toast.error("Email already registered.");
    }
    if (name === "user_mobile_no" && value) {
      if (!isValidMobile(value)) toast.error("Invalid mobile format. Use 10-digit or +91 format.");
      else if (contactExists("mobile", value)) toast.error("Mobile already registered.");
    }
  };

  // Validate Password and Confirm Password
  const validateBeforeSubmit = () => {
    if (formData.user_password !== formData.user_confirm_password) {
      toast.error('Passwords do not match.');
      return false;
    }
    return true;
  };

  // Submit handler with duplicate and format checks
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate email/mobile formats and duplicates before OTP send
    if (!isValidEmail(formData.user_email)) {
      toast.error("Invalid email format.");
      return;
    }
    if (!isValidMobile(formData.user_mobile_no)) {
      toast.error("Invalid mobile format. Use 10-digit or +91 format.");
      return;
    }
    if (contactExists("email", formData.user_email)) {
      toast.error("Email is already registered.");
      return;
    }
    if (contactExists("mobile", formData.user_mobile_no)) {
      toast.error("Mobile number is already registered.");
      return;
    }
    if (!validateBeforeSubmit()) return;

    const otp = Math.floor(10000 + Math.random() * 90000).toString();

    toast.promise(
      emailjs.send(
        process.env.REACT_APP_EMAIL_JS_SERVICE_ID,
        process.env.REACT_APP_USER_OTP_TEMPLATE_ID,
        {
          to_email: formData.user_email,
          otp: otp,
        },
        process.env.REACT_APP_EMAIL_JS_PUBLIC_KEY
      ),
      {
        loading: "Sending OTP...",
        success: () => {
          navigate("/otp-verification", { state: { data: formData, otp, type: "user" } });
          return "OTP sent to your email!";
        },
        error: (err) => {
          console.error("EmailJS error:", err);
          return "Failed to send OTP. Try again!";
        },
      }
    );
  };

  return (
    <div className="smartdine-banner" style={{ backgroundImage: `url(${bgImg})` }} id="userregister">
      <div className="smartdine-overlay opacity-75"></div>
      <div className="position-relative z-1 w-100">
        <div className="container px-3">
          <div className="row">
            <div className="col-md-3"></div>
            <div className="col-md-6 p-md-5 px-4 py-5 shadow rounded smartdine-overlay position-relative">
              <div className="row cl5 mb-3">
                <span className="fs-3 fw-semibold f2">
                  <i className="bi bi-person-plus me-3"></i>
                  User Registration
                </span>
              </div>
              <hr className="border-light border-1" />
              <form onSubmit={handleSubmit} className='f5'>
                {/* Name */}
                <div className="my-3 input-group">
                  <span className={icon}>
                    <i className="bi bi-person"></i>
                  </span>
                  <input
                    type="text"
                    name="user_name"
                    value={formData.user_name}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="Name"
                    required
                  />
                </div>
                {/* Email */}
                <div className="my-3 input-group">
                  <span className={icon}>
                    <i className="bi bi-envelope"></i>
                  </span>
                  <input
                    type="email"
                    name="user_email"
                    value={formData.user_email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="form-control"
                    placeholder="Email Address"
                    required
                  />
                </div>
                {/* Mobile No */}
                <div className="my-3 input-group">
                  <span className={icon}>
                    <i className="bi bi-telephone"></i>
                  </span>
                  <input
                    type="tel"
                    name="user_mobile_no"
                    value={formData.user_mobile_no}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="form-control"
                    placeholder="Mobile No"
                    required
                  />
                </div>
                {/* Password */}
                <div className="my-3 input-group">
                  <span className={icon}>
                    <i className="bi bi-lock"></i>
                  </span>
                  <input
                    type="password"
                    name="user_password"
                    value={formData.user_password}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="Password"
                    minLength="8"
                    maxLength="30"
                    required
                  />
                </div>
                {/* Confirm Password */}
                <div className="my-3 input-group">
                  <span className={icon}>
                    <i className="bi bi-lock-fill"></i>
                  </span>
                  <input
                    type="password"
                    name="user_confirm_password"
                    value={formData.user_confirm_password}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="Confirm Password"
                    minLength="8"
                    maxLength="30"
                    required
                  />
                </div>
                <button type="submit" className="btn btn-danger w-100 mt-3">
                  <i className="bi bi-person-plus me-2"></i>
                  Register
                </button>
                <hr className='border-light my-4' />
                <div className="d-grid justify-content-center mt-3">
                  <span className='cl5'>
                    Already have an account?
                    <Link to="/user-login" className='text-decoration-none mx-2 fw-semibold cl1'>
                      Login
                    </Link>
                  </span>
                </div>
              </form>
            </div>
            <div className="col-md-3"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserRegister;
