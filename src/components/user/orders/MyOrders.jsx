import React, { useState, useEffect, useContext } from "react";
import { UserContext } from '../../../context/Context';

const TABLE_NAMES = {
  1: "Standard", 2: "Standard", 3: "Standard", 4: "Standard",
  5: "Booth", 6: "Booth", 7: "Private", 8: "Private"
};

const STATUS_CONFIG = {
  pending: { color: "warning", icon: "bi bi-clock-history" },
  preparing: { color: "secondary", icon: "bi bi-check-circle" },
  completed: { color: "success", icon: "bi bi-check-circle" },
  served: { color: "info", icon: "bi bi-check2-all" },
  cancelled: { color: "danger", icon: "bi bi-x-circle" }
};

const MyOrders = () => {
  const { userAllOrders, fetchUserAllOrders } = useContext(UserContext);
  const [activeTab, setActiveTab] = useState("current");
  const [modalOrder, setModalOrder] = useState(null);

  useEffect(() => {
    // Initial fetch
    fetchUserAllOrders();

    // Set up interval for polling
    const interval = setInterval(() => {
      fetchUserAllOrders();
    }, 5000);

    // Cleanup interval on unmount
    return () => clearInterval(interval);
    // eslint-disable-next-line
  }, []);


  const today = new Date().setHours(0, 0, 0, 0);

  const currentOrders = userAllOrders.filter(order =>
    new Date(order.table.booking_date).setHours(0, 0, 0, 0) >= today &&
    order.status !== "completed"
  );
  const pastOrders = userAllOrders.filter(order =>
    new Date(order.table.booking_date).setHours(0, 0, 0, 0) < today ||
    order.status === "completed"
  );
  const displayOrders = activeTab === "current" ? currentOrders : pastOrders;

  const formatDate = date =>
    new Date(date).toLocaleDateString("en-US", {
      month: "short", day: "numeric", year: "numeric"
    });

  // Modal: show image, name, category, status only
  const OrderItemModal = ({ order, onClose }) => (
    <div
      className="modal fade show"
      style={{
        display: "block",
        backgroundColor: "rgba(0,0,0,.5)",
        zIndex: 1050
      }}
      tabIndex="-1"
      role="dialog"
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header bg-light">
            <h5 className="modal-title fw-bold">
              Order #{order.id} Items
            </h5>
            <button type="button" className="btn-close" onClick={onClose} />
          </div>
          <div className="modal-body">
            {order.order_items?.length > 0 ? (
              <ul className="list-group">
                {order.order_items.map((item, idx) => (
                  <li
                    key={idx}
                    className="list-group-item d-flex align-items-center"
                  >
                    <img
                      src={item.menu_item.image}
                      alt={item.menu_item.name}
                      style={{
                        width: 48,
                        height: 48,
                        objectFit: "cover",
                        borderRadius: "0.5rem"
                      }}
                      className="me-3 bg-light border"
                    />
                    <div className="flex-grow-1">
                      <div className="fw-bold">{item.menu_item.name}</div>
                      <div className="badge bg-primary me-2">
                        {item.menu_item.category_detail?.name}
                      </div>
                    </div>
                    <span
                      className={`badge rounded-pill ${item.prepared
                          ? "bg-success"
                          : "bg-warning text-dark"
                        }`}
                    >
                      {item.prepared ? "Prepared" : "Pending"}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-muted text-center">No items for this order.</div>
            )}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container my-5">
      <div className="mb-4">
        <h2 className="fw-bold">My Orders</h2>
      </div>
      {/* Summary Cards */}
      <div className="row g-3 mb-4">
        {[
          { label: "Current", value: currentOrders.length, color: "primary" },
          { label: "Past", value: pastOrders.length, color: "info" }
        ].map(({ label, value, color }) => (
          <div key={label} className="col-12 col-md-6 col-lg-3">
            <div className={`card border-0 shadow-sm bg-${color} bg-opacity-10`}>
              <div className="card-body text-center">
                <h3 className={`text-${color}`}>{value}</h3>
                <p className="mb-0 fw-semibold small">{label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Orders Table */}
      <div className="card border-0 shadow-sm mt-2">
        <div className="card-body">
          <ul className="nav nav-pills mb-3">
            {[
              { key: "current", label: "Current Orders", count: currentOrders.length },
              { key: "past", label: "Past Orders", count: pastOrders.length }
            ].map(({ key, label, count }) => (
              <li key={key} className="nav-item">
                <button
                  className={`nav-link rounded-pill px-4 fw-bold ${activeTab === key ? "active bg-primary text-white" : ""}`}
                  onClick={() => setActiveTab(key)}
                >
                  {label} <span className="badge bg-light text-dark ms-2">{count}</span>
                </button>
              </li>
            ))}
          </ul>
          {displayOrders.length === 0 ? (
            <div className="text-center py-5">
              <h5>No {activeTab === "current" ? "upcoming" : "past"} orders</h5>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-bordered table-hover align-middle bg-white rounded">
                <thead className="table-light">
                  <tr>
                    <th className="text-center">Order ID</th>
                    <th>Booking ID</th>
                    <th>Status</th>
                    <th>Restaurant</th>
                    <th>Table</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Guests</th>
                    <th>Items</th>
                    <th>Total Price</th>
                  </tr>
                </thead>
                <tbody>
                  {displayOrders.map(order => {
                    const statusConfig = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
                    return (
                      <tr key={order.id}>
                        <td className="text-center fw-bold text-primary">#{order.id}</td>
                        <td>{order.table.id}</td>
                        <td>
                          <span className={`badge bg-${statusConfig.color} d-flex align-items-center gap-2 px-3`}>
                            <i className={`${statusConfig.icon} me-1`}></i>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </td>
                        <td>{order.table.restaurant_detail?.res_name}</td>
                        <td>
                          Table {order.table.table_detail?.table_number}
                          <div className="text-muted small">
                            {TABLE_NAMES[order.table.table_detail?.table_number]}
                          </div>
                        </td>
                        <td>{formatDate(order.table.booking_date)}</td>
                        <td>
                          {order.table.booking_time
                            ? <span className="text-primary fw-semibold">{order.table.booking_time} - {order.table.booking_end_time}</span>
                            : 'N/A'
                          }
                        </td>
                        <td>
                          <span className="badge bg-secondary rounded-pill px-3">
                            {order.table.number_of_guests}
                          </span>
                        </td>
                        <td>
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => setModalOrder(order)}
                          >
                            View
                          </button>
                        </td>
                        <td className="fw-bold text-success">₹{order.total_amount}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      {modalOrder && (
        <OrderItemModal
          order={modalOrder}
          onClose={() => setModalOrder(null)}
        />
      )}
    </div>
  );
};

export default MyOrders;
