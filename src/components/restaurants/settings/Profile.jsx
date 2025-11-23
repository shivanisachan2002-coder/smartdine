import React, { useContext, useEffect, useState, useRef } from "react";
import { RestaurantContext, MainContext } from "../../../context/Context"; // adjust import

const apiToUi = (data) => ({
  owner_name: data.owner_name || "",
  owner_mobile_no: data.owner_mobile_no || "",
  owner_email: data.email || "",
  owner_city: data.city || "",
  owner_state: data.state || "",
  opening_time: data.opening_time?.slice(0, 5) || "",
  closing_time: data.closing_time?.slice(0, 5) || "",
  is_open: !!data.is_open,
  res_name: data.res_name || "",
  res_address: data.res_address || "",
  id: data.id || "",
  res_contact_no: data.res_contact_no || "",
  google_location_url: data.google_location_url || "",
  restaurant_image: data.restaurant_image || "https://picsum.photos/seed/default/800/600",
});

const Profile = () => {
  const { restaurantData, updateRestaurantData } = useContext(RestaurantContext);
  const { locations, getLocations } = useContext(MainContext);
  // Place in your component, after useState/useContext

  const [form, setForm] = useState(apiToUi(restaurantData));
  const [successMsg, setSuccessMsg] = useState("");
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const fileInputRef = useRef(null);

  // Fetch states/cities if not loaded yet
  useEffect(() => {
    if (!locations || locations.length === 0) getLocations();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    setForm(apiToUi(restaurantData));
    setSelectedImageFile(null);
  }, [restaurantData]);

  // Find current state's city list for dropdown
  // const cityOptions =
  //   locations && form.owner_state
  //     ? (locations.find(l => l.state === form.owner_state)?.cities || [])
  //     : [];

  const handleChange = (field, value) => {
    // If state changes, reset city
    if (field === "owner_state") {
      setForm(prev => ({ ...prev, owner_state: value, owner_city: "" }));
    } else {
      setForm(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleImageChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      const imgFile = event.target.files[0];
      setSelectedImageFile(imgFile);
      setForm(prev => ({
        ...prev,
        restaurant_image: URL.createObjectURL(imgFile), // For preview only
      }));
    }
  };

  // Save Owner section
  const handleSaveOwner = async () => {
    const updateData = {
      owner_name: form.owner_name,
      city: form.owner_city,
      state: form.owner_state,
    };
    const res = await updateRestaurantData(updateData);
    setSuccessMsg(res ? "Owner details updated!" : "Error updating owner details");
    setTimeout(() => setSuccessMsg(""), 2000);
  };

  // Save Operational Hours section
  const handleSaveOperationalHours = async () => {
    const updateData = {
      opening_time: form.opening_time,
      closing_time: form.closing_time,
      is_open: form.is_open,
    };
    const res = await updateRestaurantData(updateData);
    setSuccessMsg(res ? "Operational hours updated!" : "Error updating hours");
    setTimeout(() => setSuccessMsg(""), 2000);
  };

  // Save Restaurant section, image upload if new file selected
  const handleSaveRestaurant = async () => {
    let updateData = {
      res_name: form.res_name,
      res_address: form.res_address,
      res_contact_no: form.res_contact_no,
      google_location_url: form.google_location_url,
    };
    if (selectedImageFile) {
      const formData = new FormData();
      for (const key in updateData) formData.append(key, updateData[key]);
      formData.append("restaurant_image", selectedImageFile);
      const res = await updateRestaurantData(formData, true);
      setSuccessMsg(res ? "Restaurant details updated!" : "Error updating restaurant");
    } else {
      const res = await updateRestaurantData(updateData);
      setSuccessMsg(res ? "Restaurant details updated!" : "Error updating restaurant");
    }
    setTimeout(() => setSuccessMsg(""), 2000);
  };

  return (
    <div className="container py-4">
      {successMsg && (
        <div style={{
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: 10,
          zIndex: 1050,
          display: 'flex',
          justifyContent: 'center',
          pointerEvents: 'none',
        }}>
          <div className="alert alert-success w-50" style={{ pointerEvents: 'auto' }}>
            {successMsg}
          </div>
        </div>
      )}
      <div className="row">
        {/* Left Column */}
        <div className="col-lg-5 mb-4">
          {/* Owner Details */}
          <div className="card shadow-sm mb-4">
            <div className="card-header bg-light">
              <h5 className="mb-0"><i className="bi bi-person-fill me-2"></i>Owner Details</h5>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label className="form-label">Name</label>
                <input type="text" className="form-control"
                  value={form.owner_name}
                  onChange={e => handleChange('owner_name', e.target.value)} />
              </div>
              <div className="mb-3">
                <label className="form-label">Mobile</label>
                <input type="tel" className="form-control"
                  value={form.owner_mobile_no} disabled />
              </div>
              <div className="mb-3">
                <label className="form-label">Email</label>
                <input type="email" className="form-control"
                  value={form.owner_email} disabled />
              </div>
              <div className="mb-3">
                <label className="form-label">State</label>
                <select
                  className="form-select"
                  value={form.owner_state}
                  onChange={e => handleChange("owner_state", e.target.value)}
                >
                  <option value="">Select State</option>
                  {locations && locations.map(item => (
                    <option key={item.id} value={item.name}>{item.name}</option>
                  ))}
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label">City</label>
                <select
                  className="form-select"
                  value={form.owner_city}
                  onChange={e => handleChange("owner_city", e.target.value)}
                  disabled={!form.owner_state}
                >
                  <option value="">Select City</option>
                  {(locations.find(s => s.name === form.owner_state)?.cities || []).map(city => (
                    <option key={city.id} value={city.name}>{city.name}</option>
                  ))}
                </select>
              </div>
              <button className="btn btn-primary w-100" onClick={handleSaveOwner}>
                <i className="bi bi-save2 me-2"></i>Save Owner Details
              </button>
            </div>

          </div>
          {/* Operational Hours */}
          <div className="card shadow-sm">
            <div className="card-header bg-light">
              <h5 className="mb-0"><i className="bi bi-clock-history me-2"></i>Operational Hours</h5>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label className="form-label">Opening Time</label>
                <input type="time" className="form-control" value={form.opening_time} onChange={e => handleChange('opening_time', e.target.value)} />
              </div>
              <div className="mb-3">
                <label className="form-label">Closing Time</label>
                <input type="time" className="form-control" value={form.closing_time} onChange={e => handleChange('closing_time', e.target.value)} />
              </div>
              <div className="mb-3 form-check">
                <input className="form-check-input" type="checkbox" id="isOpen" checked={form.is_open} onChange={e => handleChange('is_open', e.target.checked)} />
                <label className="form-check-label" htmlFor="isOpen">Currently Open</label>
              </div>
              <button className="btn btn-primary w-100" onClick={handleSaveOperationalHours}>
                <i className="bi bi-save2 me-2"></i>Save Hours
              </button>
            </div>
          </div>
        </div>
        {/* Right Column */}
        <div className="col-lg-7 mb-4">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-light">
              <h5 className="mb-0"><i className="bi bi-shop me-2"></i>Restaurant Details</h5>
            </div>
            <div className="card-body d-flex flex-column">
              <img src={form.restaurant_image} className="img-fluid rounded-top mb-3" alt="Restaurant"
                style={{ maxHeight: '250px', objectFit: 'cover' }} />
              <div className="mb-3">
                <label className="form-label">Name</label>
                <input type="text" className="form-control" value={form.res_name} onChange={e => handleChange('res_name', e.target.value)} />
              </div>
              <div className="mb-3">
                <label className="form-label">Address</label>
                <textarea className="form-control" rows="2" value={form.res_address} onChange={e => handleChange('res_address', e.target.value)}></textarea>
              </div>
              <div className="mb-3">
                <label className="form-label">ID</label>
                <input type="text" className="form-control" value={form.id} readOnly />
              </div>
              <div className="mb-3">
                <label className="form-label">Contact Number</label>
                <input type="tel" className="form-control" value={form.res_contact_no} onChange={e => handleChange('res_contact_no', e.target.value)} />
              </div>
              <div className="mb-3">
                <label className="form-label">Google Location</label>
                <input type="url" className="form-control" value={form.google_location_url} onChange={e => handleChange('google_location_url', e.target.value)} />
              </div>
              <div className="mt-auto d-grid gap-2">
                <button className="btn btn-secondary" onClick={() => fileInputRef.current.click()}>
                  <i className="bi bi-image"></i> Update Image
                </button>
                <button className="btn btn-primary" onClick={handleSaveRestaurant}>
                  <i className="bi bi-save2 me-2"></i>Save Restaurant Details
                </button>
              </div>
              {/* Hidden file input */}
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleImageChange}
                accept="image/*"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Profile;
