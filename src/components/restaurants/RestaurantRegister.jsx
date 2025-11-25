import React, { useContext, useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import emailjs from "emailjs-com";
import bgImg from "../../assets/image/user/kitchen-6878026.jpg";
import { MainContext } from "../../context/Context";
// Bootstrap React Icons
import {
  BsPerson, BsEnvelope, BsTelephone, BsGeoAlt,
  BsLock, BsLockFill, BsArrowRight, BsArrowLeft,
  BsBuilding, BsCheckCircle, BsFileEarmarkPdf
} from "react-icons/bs";

const RestaurantRegister = () => {
  document.title = "Restaurant Register | SmartDine";

  const [formFields, setFormFields] = useState({
    res_name: "",
    res_address: "",
    res_contact_no: "",
    google_location_url: "",
    state: "",
    city: "",
    owner_name: "",
    owner_mobile_no: "",
    email: "",
    fssai_license_no: "",
    gst_registration_no: "",
    password: "",
    confirm_password: "",
    terms_accepted: false,
  });

  const { locations, getLocations, contactData = {}, fetchAllExistingContacts } = useContext(MainContext);
  const [cities, setCities] = useState([]);
  const [fssaiPdf, setFssaiPdf] = useState(null);
  const [gstPdf, setGstPdf] = useState(null);
  const [activeSection, setActiveSection] = useState("restaurant");
  const navigate = useNavigate();

  useEffect(() => {
    getLocations();
    fetchAllExistingContacts();
  }, []);

  // Validation helpers
  const isValidEmail = email =>
    /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(email);

  const isValidMobile = mobile =>
    /^(\+91[-\s]?)?[0]?(91)?[6789]\d{9}$/.test(mobile);

  const isValidUrl = url =>
    /^(https?:\/\/)?([\w-]+\.)+[a-z]{2,}(:\d+)?(\/\S*)?$/.test(url);

  const contactExists = (field, value) => {
    if (
      !contactData ||
      (!Array.isArray(contactData.emails) && !Array.isArray(contactData.mobiles))
    ) return false;
    if (field === "email") {
      return contactData.emails?.some(
        email => email.trim().toLowerCase() === value.trim().toLowerCase()
      );
    }
    if (field === "mobile") {
      const normalize = v => v.replace(/[^0-9]/g, '').replace(/^0+/, '');
      const val = normalize(value);
      return contactData.mobiles?.some(mobile => normalize(mobile) === val);
    }
    return false;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormFields((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (name === "state") {
      const selectedState = locations.find(loc => loc.name === value);
      setCities(selectedState ? selectedState.cities : []);
      setFormFields(prev => ({ ...prev, city: "" }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    if (name === "email" && value) {
      if (!isValidEmail(value)) toast.error("Invalid email format.");
      else if (contactExists("email", value)) toast.error("Email already registered.");
    }
    if ((name === "owner_mobile_no" || name === "res_contact_no") && value) {
      if (!isValidMobile(value)) toast.error("Invalid mobile format. Use 10-digit or +91 format.");
      else if (contactExists("mobile", value)) toast.error("Mobile number already registered.");
    }
    if (name === "google_location_url" && value && !isValidUrl(value)) {
      toast.error("Invalid URL format.");
    }
  };

  const handleFssaiPdfChange = (e) => { setFssaiPdf(e.target.files[0]); };
  const handleGstPdfChange = (e) => { setGstPdf(e.target.files[0]); };

  const getProgress = () => {
    switch (activeSection) {
      case "restaurant": return 33;
      case "owner": return 66;
      case "documents": return 100;
      default: return 0;
    }
  };

  const getProgressText = () => {
    switch (activeSection) {
      case "restaurant": return "Step 1 of 3 completed";
      case "owner": return "Step 2 of 3 completed";
      case "documents": return "Step 3 of 3 completed";
      default: return "";
    }
  };

  const nextSection = () => {
    if (activeSection === "restaurant") setActiveSection("owner");
    else if (activeSection === "owner") setActiveSection("documents");
  };

  const prevSection = () => {
    if (activeSection === "documents") setActiveSection("owner");
    else if (activeSection === "owner") setActiveSection("restaurant");
  };

  const validateBeforeSubmit = () => {
    if (formFields.password !== formFields.confirm_password) {
      toast.error("Passwords do not match."); return false;
    }
    if (!formFields.terms_accepted) {
      toast.error("You must accept the terms and conditions."); return false;
    }
    return true;
  };

  const isRestaurantSectionValid = () =>
    formFields.res_name.trim() !== "" &&
    formFields.res_address.trim() !== "" &&
    formFields.res_contact_no.trim() !== "" &&
    formFields.google_location_url.trim() !== "" &&
    formFields.state.trim() !== "" &&
    formFields.city.trim() !== "";

  const isOwnerSectionValid = () =>
    formFields.owner_name.trim() !== "" &&
    formFields.owner_mobile_no.trim() !== "" &&
    formFields.email.trim() !== "";

  const isDone = () =>
    !formFields.password ||
    !formFields.confirm_password ||
    !formFields.terms_accepted;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (contactExists("email", formFields.email)) {
      toast.error("Email is already registered."); return;
    }
    if (contactExists("mobile", formFields.owner_mobile_no) || contactExists("mobile", formFields.res_contact_no)) {
      toast.error("Mobile number is already registered."); return;
    }
    if (!fssaiPdf) { toast.error("FSSAI PDF is required."); return; }
    if (!gstPdf) { toast.error("GST PDF is required."); return; }
    if (!isValidUrl(formFields.google_location_url)) {
      toast.error("Enter a valid Google Maps URL."); return;
    }
    if (!validateBeforeSubmit()) return;

    const data = new FormData();
    Object.entries(formFields).forEach(([key, value]) => data.append(key, value));
    data.append("fssai_license_url", fssaiPdf);
    data.append("gst_registration_url", gstPdf);
    const otp = Math.floor(10000 + Math.random() * 90000).toString();

    toast.promise(
      emailjs.send(
        process.env.REACT_APP_EMAIL_JS_SERVICE_ID,
        process.env.REACT_APP_USER_OTP_TEMPLATE_ID,
        {
          to_email: formFields.email,
          otp,
        },
        process.env.REACT_APP_EMAIL_JS_PUBLIC_KEY
      ),
      {
        loading: "Sending OTP...",
        success: () => {
          navigate("/otp-verification", {
            state: { data: Object.fromEntries(data), otp, type: "restaurant" },
          });
          return "OTP sent to your email!";
        },
        error: () => "Failed to send OTP. Try again!",
      }
    );
  };

  // -------- Main Render ----------
  return (
    <div className='container-fluid py-5' style={{ backgroundImage: `url(${bgImg})` }}>
      <div className="row justify-content-center">
        <div className="col-lg-8 col-md-10 col-12">
          <div className="card shadow-lg rounded-3 mt-5">
            <div className="card-body p-4">
              <div className="mb-4 text-center">
                <h3 className="fw-bold fs-3 mb-2"><BsBuilding className="me-2" />
                  Restaurant Registration
                </h3>
                <p>Complete all sections to register your restaurant</p>
              </div>
              <hr />
              <div className="d-flex mb-3 gap-2">
                <button className={`btn ${activeSection === "restaurant" ? "btn-primary" : "btn-outline-primary"} flex-fill`} onClick={() => setActiveSection("restaurant")}>Restaurant Details</button>
                <button className={`btn ${activeSection === "owner" ? "btn-success" : "btn-outline-success"} flex-fill`} onClick={() => {
                  if (!isRestaurantSectionValid()) return toast.error("Please fill all Restaurant Details before continuing."); setActiveSection("owner");
                }}>Owner Details</button>
                <button className={`btn ${activeSection === "documents" ? "btn-info" : "btn-outline-info"} flex-fill`} onClick={() => {
                  if (!isRestaurantSectionValid() || !isOwnerSectionValid()) return toast.error("Please fill all required fields in previous steps before continuing."); setActiveSection("documents");
                }}>Documents & Account</button>
              </div>
              <div className="progress mb-2" style={{ height: "10px" }}>
                <div className="progress-bar bg-success progress-bar-striped progress-bar-animated"
                  role="progressbar"
                  style={{
                    width: `${getProgress()}%`,
                    ariaValuenow: `${getProgress()}`,
                    ariaValuemin: "0",
                    ariaValuemax: "100",
                  }}>
                </div>
              </div>
              <p className="mb-0 small text-muted">{getProgressText()}</p>
              <form onSubmit={handleSubmit} method="post" encType="multipart/form-data">
                {activeSection === "restaurant" && (
                  <div className="row">
                    {/* Restaurant Name */}
                    <div className="col-md-12 mb-3">
                      <label className="form-label fw-semibold">Restaurant Name</label>
                      <div className="input-group">
                        <span className="input-group-text"><BsPerson /></span>
                        <input type="text" className="form-control shadow-sm"
                          name="res_name"
                          value={formFields.res_name}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          required />
                      </div>
                    </div>
                    {/* Restaurant Address */}
                    <div className="col-md-12 mb-3">
                      <label className="form-label fw-semibold">Restaurant Address</label>
                      <div className="input-group">
                        <span className="input-group-text"><BsGeoAlt /></span>
                        <input type="text" className="form-control shadow-sm"
                          name="res_address"
                          value={formFields.res_address}
                          onChange={handleChange}
                          required />
                      </div>
                    </div>
                    {/* Contact Number */}
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-semibold">Contact Number</label>
                      <div className="input-group">
                        <span className="input-group-text"><BsTelephone /></span>
                        <input type="text" className="form-control shadow-sm"
                          name="res_contact_no"
                          maxLength={15}
                          value={formFields.res_contact_no}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          required />
                      </div>
                    </div>
                    {/* Google Location URL */}
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-semibold">Google Location URL</label>
                      <div className="input-group">
                        <span className="input-group-text"><BsGeoAlt /></span>
                        <input type="url" className="form-control shadow-sm"
                          name="google_location_url"
                          value={formFields.google_location_url}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          required />
                      </div>
                    </div>
                    {/* State & City */}
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-semibold">State</label>
                      <select className="form-select shadow-sm"
                        name="state"
                        value={formFields.state}
                        onChange={handleChange}
                        required>
                        <option value="">Select state</option>
                        {locations.map((loc) => (
                          <option key={loc.id} value={loc.name}>{loc.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-semibold">City</label>
                      <select className="form-select shadow-sm"
                        name="city"
                        value={formFields.city}
                        onChange={handleChange}
                        required
                        disabled={!formFields.state}>
                        <option value="">Select city</option>
                        {cities.map((city) => (
                          <option key={city.id} value={city.name}>{city.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="d-flex justify-content-end mt-4">
                      <button type="button"
                        className="btn btn-danger rounded-pill px-4"
                        onClick={nextSection}
                        disabled={!isRestaurantSectionValid()}>
                        Next: Owner Details <BsArrowRight className="ms-2" />
                      </button>
                    </div>
                  </div>
                )}
                {activeSection === "owner" && (
                  <div className="row">
                    {/* Owner Name */}
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-semibold">Owner Name</label>
                      <div className="input-group">
                        <span className="input-group-text"><BsPerson /></span>
                        <input type="text" className="form-control shadow-sm"
                          name="owner_name"
                          value={formFields.owner_name}
                          onChange={handleChange}
                          required />
                      </div>
                    </div>
                    {/* Owner Mobile */}
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-semibold">Mobile Number</label>
                      <div className="input-group">
                        <span className="input-group-text"><BsTelephone /></span>
                        <input type="text" className="form-control shadow-sm"
                          name="owner_mobile_no"
                          maxLength={15}
                          value={formFields.owner_mobile_no}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          required />
                      </div>
                    </div>
                    {/* Owner Email */}
                    <div className="col-md-12 mb-3">
                      <label className="form-label fw-semibold">Email Address</label>
                      <div className="input-group">
                        <span className="input-group-text"><BsEnvelope /></span>
                        <input type="email" className="form-control shadow-sm"
                          name="email"
                          value={formFields.email}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          required />
                      </div>
                    </div>
                    <div className="d-flex justify-content-between mt-4">
                      <button type="button"
                        className="btn btn-outline-secondary rounded-pill px-4"
                        onClick={prevSection}>
                        <BsArrowLeft className="me-2" /> Previous
                      </button>
                      <button type="button"
                        className="btn btn-danger rounded-pill px-4"
                        onClick={nextSection}
                        disabled={!isOwnerSectionValid()}>
                        Next: Documents <BsArrowRight className="ms-2" />
                      </button>
                    </div>
                  </div>
                )}
                {activeSection === "documents" && (
                  <div className="row">
                    {/* FSSAI License */}
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-semibold">FSSAI License Number</label>
                      <div className="input-group">
                        <span className="input-group-text"><BsFileEarmarkPdf /></span>
                        <input type="text" className="form-control shadow-sm"
                          name="fssai_license_no"
                          value={formFields.fssai_license_no}
                          onChange={handleChange}
                          required />
                      </div>
                      <label className="form-label mt-3">FSSAI License PDF</label>
                      <input type="file" className="form-control shadow-sm"
                        accept="application/pdf"
                        onChange={handleFssaiPdfChange}
                        required />
                    </div>
                    {/* GST Registration */}
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-semibold">GST Registration Number</label>
                      <div className="input-group">
                        <span className="input-group-text"><BsFileEarmarkPdf /></span>
                        <input type="text" className="form-control shadow-sm"
                          name="gst_registration_no"
                          value={formFields.gst_registration_no}
                          onChange={handleChange}
                          required />
                      </div>
                      <label className="form-label mt-3">GST Registration PDF</label>
                      <input type="file" className="form-control shadow-sm"
                        accept="application/pdf"
                        onChange={handleGstPdfChange}
                        required />
                    </div>
                    {/* Passwords */}
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-semibold">Create Password</label>
                      <div className="input-group">
                        <span className="input-group-text"><BsLock /></span>
                        <input type="password" className="form-control shadow-sm"
                          name="password"
                          minLength={8}
                          maxLength={128}
                          value={formFields.password}
                          onChange={handleChange}
                          required />
                      </div>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-semibold">Confirm Password</label>
                      <div className="input-group">
                        <span className="input-group-text"><BsLockFill /></span>
                        <input type="password" className="form-control shadow-sm"
                          name="confirm_password"
                          minLength={8}
                          maxLength={128}
                          value={formFields.confirm_password}
                          onChange={handleChange}
                          required />
                      </div>
                    </div>
                    {/* Terms */}
                    <div className="col-12 mb-3">
                      <div className="form-check">
                        <input className="form-check-input"
                          type="checkbox"
                          id="termsCheck"
                          name="terms_accepted"
                          checked={formFields.terms_accepted}
                          onChange={handleChange}
                          required />
                        <label className="form-check-label" htmlFor="termsCheck">I agree to the terms and conditions</label>
                      </div>
                    </div>
                    <div className="d-flex justify-content-between mt-4">
                      <button type="button"
                        className="btn btn-outline-secondary rounded-pill px-4"
                        onClick={prevSection}>
                        <BsArrowLeft className="me-2" /> Previous
                      </button>
                      <button type="submit"
                        className="btn btn-success rounded-pill px-4"
                        disabled={isDone()}>
                        <BsCheckCircle className="me-2" /> Submit Registration
                      </button>
                    </div>
                  </div>
                )}
              </form>
              <div className="card-footer text-center text-muted py-3 mt-3">
                Already have an account? <Link to="/restaurant-login" className="fw-semibold cl1">Login here</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default RestaurantRegister;
