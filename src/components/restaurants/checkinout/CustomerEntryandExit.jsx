import React, { useState, useEffect, useContext } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { RestaurantContext } from "../../../context/Context";
import BookingCard from './BookingCard';

const CustomerEntryandExit = () => {
    const [notArrived, setNotArrived] = useState([]);
    const [searchMobile, setSearchMobile] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const { checkedInUser, fetchCheckedInBookings, searchCustomerBooking, checkInOut, } = useContext(RestaurantContext);

    useEffect(() => {
        fetchCheckedInBookings();
        // eslint-disable-next-line
    }, []);

    const safeCheckedIn = Array.isArray(checkedInUser) ? checkedInUser : [];
    const safeNotArrived = Array.isArray(notArrived) ? notArrived : [];

    const handleSearch = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");
        setNotArrived([]);
        if (!searchMobile.trim()) {
            setLoading(false);
            return;
        }
        const results = await searchCustomerBooking(searchMobile);
        setNotArrived(results || []);
        setLoading(false);
        if (!results || results.length === 0) setMessage("No upcoming bookings found.");
    };

    const handleAction = async (booking, action) => {
        setLoading(true);
        const patchData = {};
        if (action === "checkin") patchData.checked_in = true;
        if (action === "checkout") patchData.checked_out = true;
        await checkInOut(booking.id, patchData);  

        if (action === "checkin") setNotArrived([]);
        setMessage(`Customer ${action === "checkin" ? "checked in" : "checked out"} successfully.`);
        setLoading(false);
        setTimeout(() => setMessage(""), 3000);
    };

    return (
        <div className="container-fluid mt-3">
            <div className="row justify-content-center">
                <div className="col-md-12">
                    <div className="card border">
                        <div className="card-header bg-light text-dark" style={{ borderRadius: "0.3rem 0.3rem 0 0" }}>
                            <h4 className="mb-0 text-center">
                                <i className="bi bi-arrow-left-right me-2"></i>
                                Customer Entry & Exit
                            </h4>
                        </div>
                        <div className="card-body bg-white">

                            {/* Search Bar */}
                            <form className="mb-4" onSubmit={handleSearch}>
                                <div className="input-group">
                                    <span className="input-group-text bg-white"><i className="bi bi-search"></i></span>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Enter mobile number"
                                        value={searchMobile}
                                        onChange={e => setSearchMobile(e.target.value)}
                                    />
                                    <button className="btn btn-primary z-0" type="submit">
                                        <i className="bi bi-arrow-right-circle"></i> Check
                                    </button>
                                </div>
                            </form>

                            {/* Success/Error Message */}
                            {message && (
                                <div className="alert alert-success alert-dismissible fade show" role="alert">
                                    <i className="bi bi-info-circle me-2"></i>{message}
                                    <button type="button" className="btn-close" onClick={() => setMessage("")}></button>
                                </div>
                            )}

                            {/* Show upcoming bookings for search */}
                            {safeNotArrived.length > 0 && (
                                <>
                                    <hr />
                                    <h5 className="mb-3 text-secondary">
                                        <i className="bi bi-person-exclamation me-2"></i>
                                        Upcoming Booking(s) for <span className="fw-bold">{searchMobile}</span>
                                    </h5>
                                    <div className="row g-4">
                                        {safeNotArrived.map(booking => (
                                            <BookingCard
                                                key={booking.id}
                                                booking={booking}
                                                status="booked"
                                                actionLabel="Check In"
                                                onAction={() => handleAction(booking, "checkin")}
                                            />
                                        ))}
                                    </div>
                                </>
                            )}

                            {/* Checked-In Bookings */}
                            <hr />
                            <h5 className="mb-3 text-success">
                                <i className="bi bi-person-check me-2"></i>
                                Checked-In Customers
                            </h5>
                            {loading ? (
                                <div className="text-center py-5">
                                    <div className="spinner-border text-primary" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </div>
                                </div>
                            ) : safeCheckedIn.length === 0 ? (
                                <div className="text-center py-5">
                                    <h5>No checked-in customers for today.</h5>
                                </div>
                            ) : (
                                <div className="row g-4">
                                    {safeCheckedIn.map(booking => (
                                        <BookingCard
                                            key={booking.id}
                                            booking={booking}
                                            status="checkedin"
                                            actionLabel="Check Out"
                                            onAction={() => handleAction(booking, "checkout")}
                                        />
                                    ))}
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomerEntryandExit;
