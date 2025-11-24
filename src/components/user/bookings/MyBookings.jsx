import React, { useState, useEffect, useMemo, useContext } from "react";
import BookingCard from "./BookingCard";
import { UserContext } from "../../../context/Context"; // Adjust the path if needed

// Sort ASCENDING: earliest booking first
function sortBookingsAsc(bookings) {
  return [...bookings].sort((a, b) => {
    const dtA = new Date(`${a.booking_date}T${a.booking_time}`);
    const dtB = new Date(`${b.booking_date}T${b.booking_time}`);
    return dtA - dtB;
  });
}

// Sort DESCENDING: latest booking first
function sortBookingsDesc(bookings) {
  return [...bookings].sort((a, b) => {
    const dtA = new Date(`${a.booking_date}T${a.booking_time}`);
    const dtB = new Date(`${b.booking_date}T${b.booking_time}`);
    return dtB - dtA;
  });
}

const MyBookings = () => {
  const { myBookings, fetchMyAllBookings } = useContext(UserContext);
  const [selectedMap, setSelectedMap] = useState(null);

  useEffect(() => {
    const userId = localStorage.getItem("user_id");
    if (userId) fetchMyAllBookings(userId);
    const intervalId = setInterval(() => {
      fetchMyAllBookings(userId);
    }, 5000); // 5000 ms = 5 seconds

    // Clean up interval when component unmounts
    return () => clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [now] = useState(() => new Date());


  // Sorting and logic for upcoming/previous bookings
  const { upcoming, previous } = useMemo(() => {
    const previous = myBookings.filter(b => {
      const bookingEnd = new Date(`${b.booking_date}T${b.booking_end_time}`);
      return (
        bookingEnd < now ||
        b.status === "completed" ||
        b.status === "cancelled"
      );
    });

    const upcoming = myBookings.filter(b => {
      const bookingEnd = new Date(`${b.booking_date}T${b.booking_end_time}`);
      return (
        bookingEnd >= now &&
        b.status !== "completed" &&
        b.status !== "cancelled"
      );
    });

    return {
      previous: sortBookingsDesc(previous),   // Descending order (latest first)
      upcoming: sortBookingsAsc(upcoming),    // Ascending order (earliest first)
    };
  }, [myBookings, now]);

  function handleOrderClick(booking, action) {
    if (action === "preorder") {
      window.location.href = `/preorder/${booking.id}`;
    }
    if (action === "order") {
      window.location.href = `/order/${booking.id}`;
    }
  }

  return (
    <div className="container my-5">
      <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
        <h2>
          <i className="bi bi-journal-bookmark me-2"></i>
          My Bookings
        </h2>
      </div>
      
      {myBookings.length === 0 ? (
        <div className="card text-center p-5 border-0 shadow-sm">
          <div className="card-body">
            <i className="bi bi-calendar-x display-1 text-muted mb-3"></i>
            <h3 className="mb-3">No bookings yet</h3>
            <p className="text-muted mb-4">
              Book a table at your favorite restaurant to get started!
            </p>
            <button
              className="btn btn-primary"
              onClick={() => window.location.href = "/restaurants"}>
              <i className="bi bi-plus-circle me-2"></i>
              Make a Booking
            </button>
          </div>
        </div>
      ) : (
        <>
          {upcoming.length > 0 && (
            <div className="mb-5">
              <div className="d-flex align-items-center mb-3">
                <h3 className="text-primary mb-0">
                  <i className="bi bi-calendar-check me-2"></i>
                  Upcoming Bookings
                </h3>
                <span className="badge bg-primary ms-2">{upcoming.length}</span>
              </div>
              <div className="row">
                {upcoming.map(b => (
                  <BookingCard
                    key={b.id}
                    booking={b}
                    isPast={false}
                    onMapClick={setSelectedMap}
                    onOrderClick={handleOrderClick}
                  />
                ))}
              </div>
            </div>
          )}
          {previous.length > 0 && (
            <div>
              <div className="d-flex align-items-center mb-3">
                <h3 className="text-muted mb-0">
                  <i className="bi bi-clock-history me-2"></i>
                  Previous Bookings
                </h3>
                <span className="badge bg-secondary ms-2">{previous.length}</span>
              </div>
              <div className="alert alert-info mb-4 d-flex align-items-center">
                <i className="bi bi-info-circle me-2"></i>
                Past bookings are shown here for reference
              </div>
              <div className="row">
                {previous.map(b => (
                  <BookingCard
                    key={b.id}
                    booking={b}
                    isPast={true}
                    onMapClick={setSelectedMap}
                    onOrderClick={handleOrderClick}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Location Modal */}
      {selectedMap && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={e => {
            if (e.target.classList.contains("modal")) setSelectedMap(null);
          }}
        >
          <div className="modal-dialog modal-md modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="bi bi-geo-alt-fill text-danger me-2"></i>
                  Restaurant Location
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setSelectedMap(null)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <strong className="d-block mb-1">Restaurant:</strong>
                  <span>{selectedMap.restaurant_detail.res_name}</span>
                </div>
                <div className="mb-3">
                  <strong className="d-block mb-1">Contact:</strong>
                  <a
                    href={`tel:${selectedMap.restaurant_detail.res_contact_no}`}
                    className="text-decoration-none"
                  >
                    <i className="bi bi-telephone me-1"></i>
                    {selectedMap.restaurant_detail.res_contact_no}
                  </a>
                </div>
                <div className="mb-3">
                  <strong className="d-block mb-1">Google Maps:</strong>
                  <a
                    href={selectedMap.restaurant_detail.google_location_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-decoration-none"
                  >
                    <i className="bi bi-box-arrow-up-right me-1"></i>
                    Open in Google Maps
                  </a>
                </div>
                <div className="ratio ratio-16x9">
                  <iframe
                    src={`https://maps.google.com/maps?q=${encodeURIComponent(selectedMap.restaurant_detail.google_location_url)}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
                    title="Restaurant Location Map"
                    frameBorder="0"
                    allowFullScreen
                  ></iframe>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setSelectedMap(null)}
                >
                  Close
                </button>
                <a
                  href={selectedMap.restaurant_detail.google_location_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary">
                  <i className="bi bi-box-arrow-up-right me-1"></i>
                  Open in Google Maps
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBookings;
