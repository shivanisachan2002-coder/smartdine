import { useState, useEffect, useContext } from "react";
import { UserContext } from "../../../context/Context";

const CONFIG = {
  formFields: {
    name: { label: "Full Name", type: "text", required: true },
    email: { label: "Email Address", type: "email", required: true, disabled: true },
    mobile: { label: "Mobile Number", type: "tel", required: true, pattern: "[0-9]{10}", disabled: true },
    address: { label: "Address", type: "textarea", required: true },
    pincode: { label: "Pincode", type: "text", required: true, pattern: "[0-9]{6}" },
    city: { label: "City", type: "text", required: true }
  },
  messages: {
    saveSuccess: "Profile updated successfully!",
    fillRequired: "Please fill all required fields",
    invalidMobile: "Please enter a valid 10-digit mobile number",
    invalidPincode: "Please enter a valid 6-digit pincode"
  }
};

const iconMap = {
  name: "bi-person-fill",
  email: "bi-envelope-fill",
  mobile: "bi-telephone-fill",
  address: "bi-geo-alt-fill",
  pincode: "bi-123",
  city: "bi-geo-fill"
};

const apiToUi = (user) => ({
  name: user.user_name || "",
  email: user.user_email || "",
  mobile: user.user_mobile_no || "",
  address: user.user_address || "",
  pincode: user.user_pincode || "",
  city: user.user_city || ""
});

const uiToApi = (data) => ({
  user_name: data.name,
  user_email: data.email,
  user_mobile_no: data.mobile,
  user_address: data.address,
  user_pincode: data.pincode,
  user_city: data.city
});

const UserProfile = () => {
  const { userData, updateUserData, loading } = useContext(UserContext);
  const [formData, setFormData] = useState(apiToUi({}));
  const [errors, setErrors] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    document.title = "User Profile | SmartDine 🍽️";
    if (userData) setFormData(apiToUi(userData));
  }, [userData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Prevent changes for disabled fields
    if (CONFIG.formFields[name].disabled) return;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // Validate Form Data
  const validateForm = () => {
    const newErrors = {};
    Object.keys(CONFIG.formFields).forEach((field) => {
      if (
        CONFIG.formFields[field].required &&
        (!formData[field] || !formData[field].trim())
      )
        newErrors[field] = `${CONFIG.formFields[field].label} is required`;
    });
    if (formData.mobile && !/^[0-9]{10}$/.test(formData.mobile))
      newErrors.mobile = CONFIG.messages.invalidMobile;
    if (formData.pincode && !/^[0-9]{6}$/.test(formData.pincode))
      newErrors.pincode = CONFIG.messages.invalidPincode;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Form Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    const apiData = uiToApi(formData);
    const result = await updateUserData(apiData);
    if (result !== false) {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  };

  return (
    <div className="container my-md-5 my-4">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card shadow border">
            <div className="card-header bg-primary text-white d-flex align-items-center">
              <i className="bi bi-person-badge fs-3 me-2"></i>
              <h3 className="mb-0">User Profile</h3>
            </div>
            <div className="card-body">
              {showSuccess && (
                <div
                  className="alert alert-success d-flex align-items-center"
                  role="alert"
                >
                  <i className="bi bi-check-circle-fill me-2"></i>
                  {CONFIG.messages.saveSuccess}
                </div>
              )}
              <form onSubmit={handleSubmit}>
                {Object.entries(CONFIG.formFields).map(([fieldKey, fieldConfig]) => (
                  <div className="mb-3" key={fieldKey}>
                    <label htmlFor={fieldKey} className="form-label fw-semibold">
                      <i className={`bi ${iconMap[fieldKey]} me-2 text-primary`}></i>
                      {fieldConfig.label}
                      {fieldConfig.required && <span className="text-danger">*</span>}
                    </label>
                    {fieldConfig.type === "textarea" ? (
                      <textarea
                        className={`form-control ${errors[fieldKey] ? "is-invalid" : ""}`}
                        id={fieldKey}
                        name={fieldKey}
                        value={formData[fieldKey]}
                        onChange={handleChange}
                        rows="3"
                        disabled={fieldConfig.disabled || false}
                      />
                    ) : (
                      <input
                        type={fieldConfig.type}
                        className={`form-control ${errors[fieldKey] ? "is-invalid" : ""}`}
                        id={fieldKey}
                        name={fieldKey}
                        value={formData[fieldKey]}
                        onChange={handleChange}
                        pattern={fieldConfig.pattern}
                        disabled={fieldConfig.disabled || false}
                      />
                    )}
                    {errors[fieldKey] && (
                      <div className="invalid-feedback">
                        <i className="bi bi-exclamation-circle me-1"></i>
                        {errors[fieldKey]}
                      </div>
                    )}
                  </div>
                ))}
                <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        Saving...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-save2-fill me-2"></i>Save Changes
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
