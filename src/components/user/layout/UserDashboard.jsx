import { useContext, useState, useEffect } from "react";
import { UserContext } from "../../../context/Context";
import { Link } from "react-router-dom";
import { BsGeoAltFill, BsClock, BsStarFill, BsBookmarkStar } from "react-icons/bs";

const UserDashboard = () => {
  const { localRestaurantData, getLocation } = useContext(UserContext);

  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");

  const filteredRestaurants = localRestaurantData
    ? localRestaurantData.filter((restaurant) => {
        const matchesSearch =
          restaurant.res_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          restaurant.city?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filter === "all" || restaurant.cuisine_type === filter;
        return matchesSearch && matchesFilter;
      })
    : [];

  const cuisineTypes = localRestaurantData
    ? [...new Set(localRestaurantData.map((r) => r.cuisine_type).filter(Boolean))]
    : [];

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(getLocation);
  }, [getLocation]);

  return (
    <div className="container py-4">
      {/* Search and Filter */}
      <div className="row mb-4">
        <div className="col-md-8">
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              placeholder="Search restaurants..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="btn btn-danger" type="button">
              <i className="bi bi-search"></i>
            </button>
          </div>
        </div>
        <div className="col-md-4 mt-3 mt-md-0">
          <select
            className="form-select"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All Cuisines</option>
            {cuisineTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Restaurants Grid */}
      <div className="mb-5">
        {filteredRestaurants.length > 0 ? (
          <div className="row g-4">
            {filteredRestaurants.map((restaurant) => (
              <div key={restaurant.id} className="col-md-6 col-lg-4">
                <div className="card h-100 shadow-sm border rounded-4 hover-lift">
                  <div className="position-relative overflow-hidden rounded-top">
                    <img
                      src={restaurant.restaurant_image}
                      alt={restaurant.res_name}
                      className="card-img-top"
                      style={{ height: "180px", objectFit: "cover", transition: "transform 0.3s ease" }}
                    />
                    <span className="badge bg-warning text-dark position-absolute top-0 start-0 m-3 d-flex align-items-center gap-1 shadow-sm rounded-pill fs-6 fw-semibold">
                      <BsStarFill />
                      {restaurant.rating || "4.5"}
                    </span>
                  </div>
                  <div className="card-body d-flex flex-column">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <h5
                        className="card-title fw-bold mb-0"
                        title={restaurant.res_name}
                        style={{
                          flexGrow: 1,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {restaurant.res_name}
                      </h5>
                      <Link
                        to={restaurant.google_location_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="cl1 ms-2"
                        title="View on Map"
                      >
                        <BsGeoAltFill size={20} />
                      </Link>
                    </div>

                    <p className="text-muted mb-1 d-flex align-items-center gap-1">
                      <BsGeoAltFill className="cl1" />
                      {restaurant.city}
                    </p>

                    <span
                      className="badge bg-secondary mb-3 align-self-start px-3 py-2 rounded-pill text-uppercase fw-semibold"
                      title="Cuisine Type"
                    >
                      {restaurant.cuisine_type || "Various"}
                    </span>

                    <div className="bg-light p-3 rounded mb-3">
                      <div className="d-flex align-items-center gap-2 text-secondary">
                        <BsClock />
                        <div className="fw-semibold">
                          {new Date(`1970-01-01T${restaurant.opening_time}`).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                          {" - "}
                          {new Date(`1970-01-01T${restaurant.closing_time}`).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                    </div>

                    <Link
                      to={`bookings/${restaurant.id}`}
                      className="btn btn-primary mt-auto d-flex align-items-center justify-content-center gap-2"
                    >
                      <BsBookmarkStar />
                      Book Table
                    </Link>
                  </div>
                  <style jsx>{`
                    .hover-lift:hover img {
                      transform: scale(1.05);
                    }
                    .hover-lift:hover {
                      box-shadow: 0 0.75rem 1.5rem rgba(0, 0, 0, 0.15);
                    }
                  `}</style>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="alert alert-secondary" role="alert">
            No Restaurants Available
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
