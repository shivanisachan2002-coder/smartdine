import React from "react";

const statusColors = {
  booked: "secondary",
  cancelled: "danger",
  dinning: "warning",
  completed: "success"
};

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

function formatTime(timeStr) {
  const [hours, minutes] = timeStr.split(':');
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
}

function getOrderButtonState(b) {
  const now = new Date();
  const bookingStart = new Date(`${b.booking_date}T${b.booking_time}`);
  const bookingEnd = new Date(`${b.booking_date}T${b.booking_end_time}`);
  const fiftyMinBeforeEnd = new Date(bookingEnd.getTime() - (50 * 60 * 1000));

  // Hide button if status is cancelled OR completed
  if (b.status === 'cancelled' || b.status === 'completed') {
    return { show: false };
  }

  // Hide button if current time >= end time - 50 min
  if (now >= fiftyMinBeforeEnd) {
    return { show: false };
  }

  if (b.checked_in) {
    return { show: true, text: 'Order', action: 'order', variant: 'success', disabled: false };
  }
  if (now < bookingStart) {
    return { show: true, text: 'Pre Order', action: 'preorder', variant: 'primary', disabled: false };
  }
  if (now >= bookingStart && now < bookingEnd && !b.checked_in) {
    return { show: true, text: 'Pre Order', action: 'preorder', variant: 'primary', disabled: false };
  }
  if (now > bookingEnd) {
    return { show: true, text: 'Order', action: 'order', variant: 'outline-secondary', disabled: false };
  }
  return { show: true, text: 'Pre Order', action: 'preorder', variant: 'primary', disabled: false };
}

const BookingCard = ({
  booking,
  isPast,
  onMapClick,
  onOrderClick
}) => {
  const buttonState = getOrderButtonState(booking);
  const rd = booking.restaurant_detail;

  return (
    <div className="col-12 mb-3">
      <div className={`card ${isPast ? 'opacity-75' : ''} border-0 shadow-sm`}>
        <div className="row g-0">
          <div className="col-md-4">
            <img
              src={rd.restaurant_image || "https://via.placeholder.com/600x400"}
              className="img-fluid rounded-start w-100"
              alt={rd.res_name}
              style={{ height: "220px", objectFit: "cover" }}
            />
          </div>
          <div className="col-md-8">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <h5 className="card-title mb-0">{rd.res_name}</h5>
                <span className={`badge bg-${statusColors[booking.status]} text-capitalize`}>
                  {booking.status}
                </span>
              </div>
              <div className="row g-2 mb-3">
                <div className="col-6">
                  <small className="text-muted">
                    <i className="bi bi-calendar3 me-1"></i>Date
                  </small>
                  <br />
                  <strong>{formatDate(booking.booking_date)}</strong>
                </div>
                <div className="col-6">
                  <small className="text-muted">
                    <i className="bi bi-clock me-1"></i>Time
                  </small>
                  <br />
                  <strong>
                    {formatTime(booking.booking_time)} - {formatTime(booking.booking_end_time)}
                  </strong>
                </div>
                <div className="col-6">
                  <small className="text-muted">
                    <i className="bi bi-table me-1"></i>Table
                  </small>
                  <br />
                  <strong>{booking.table_detail.table_number}</strong>
                </div>
                <div className="col-6">
                  <small className="text-muted">
                    <i className="bi bi-people me-1"></i>Guests
                  </small>
                  <br />
                  <strong>{booking.number_of_guests}</strong>
                </div>
                <div className="col-12">
                  <small className="text-muted">
                    <i className="bi bi-geo-alt me-1"></i>City
                  </small>
                  <br />
                  <strong>{rd.city.name || ""}</strong>
                </div>
                {booking.checked_in && (
                  <div className="col-12">
                    <span className="badge bg-info">
                      <i className="bi bi-check-circle me-1"></i>Checked In
                    </span>
                  </div>
                )}
              </div>
              <div className="d-flex justify-content-between align-items-center">
                <button
                  className="btn btn-outline-secondary btn-sm"
                  onClick={() => onMapClick(booking)}
                  title="View on map"
                >
                  <i className="bi bi-geo-alt-fill me-1"></i>Location
                </button>
                {buttonState.show && (
                  <button
                    className={`btn btn-${buttonState.variant} btn-sm`}
                    onClick={() => onOrderClick(booking, buttonState.action)}
                    disabled={buttonState.disabled}
                  >
                    <i className={`bi ${buttonState.action === 'preorder' ? 'bi-cart-plus' : 'bi-bag-check'} me-1`}></i>
                    {buttonState.text}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingCard;
