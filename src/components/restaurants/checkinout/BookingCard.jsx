import React from 'react'

const BookingCard = ({ booking, status, actionLabel, onAction }) => {
  const iconColor = "#0d6efd";

  const Badge = ({ type }) => (
        <span className={`badge px-3 py-2 fs-6 ${type === "booked" ? "bg-info" : "bg-success"}`}>
            <i
                className={`bi ${type === "booked" ? "bi-bookmark-star-fill" : "bi-person-check-fill"} me-1`}
                style={{ fontSize: "1rem" }}
            ></i>
            {type === "booked" ? "Booked" : "Checked In"}
        </span>
    );
    
  return (
       <div className="col-md-6 col-lg-4 mb-3">
            <div className="card h-100 shadow-sm border-0">
                <div className="card-header bg-white d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">
                        <i className="bi bi-calendar2-check" style={{ color: iconColor }}></i>
                        {` Booking #${booking.id}`}
                    </h5>
                    <Badge type={status} />
                </div>
                <div className="card-body">
                    <div className="mb-2"><i className="bi bi-person-circle me-2" /> <strong>Name:</strong> {booking.user_detail?.user_name || "-"}</div>
                    <div className="mb-2"><i className="bi bi-telephone-fill me-2" /> <strong>Mobile:</strong> {booking.user_detail?.user_mobile_no || "-"}</div>
                    <div className="mb-2"><i className="bi bi-calendar-event me-2" /> <strong>Date:</strong> {booking.booking_date}</div>
                    <div className="mb-2"><i className="bi bi-clock me-2" /> <strong>Time:</strong> {booking.booking_time} - {booking.booking_end_time}</div>
                    <div className="mb-2"><i className="bi bi-people-fill me-2" /> <strong>Persons:</strong> {booking.number_of_guests}</div>
                    <div className="mb-2"><i className="bi bi-hash me-2" /> <strong>Table:</strong> {booking.table_detail?.table_number || booking.table}</div>
                </div>
                <div className="card-footer bg-white">
                    <button
                        className={`btn w-100 ${status === "booked" ? "btn-success" : "btn-warning"} fw-bold`}
                        onClick={onAction}
                    >
                        <i className={`bi ${status === "booked" ? "bi-box-arrow-in-right" : "bi-box-arrow-right"}`}></i>
                        {" "}{actionLabel}
                    </button>
                </div>
            </div>
        </div>
  )
}

export default BookingCard
