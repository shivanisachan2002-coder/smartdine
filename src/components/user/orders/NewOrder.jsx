import React, { useEffect, useState, useContext } from "react";
import { UserContext } from "../../../context/Context";
import { useParams, useNavigate } from "react-router-dom";
import toast from 'react-hot-toast';
import { BsPlus, BsDash, BsTrash, BsCartCheck, BsSearch, BsTagFill, BsEggFried, BsBagCheck, BsXCircle, BsBagX } from "react-icons/bs";

const NewOrders = () => {
  const { restaurantMenuItems, fetchRestaurantItems, placeNewOrder, addItemsToOrder } = useContext(UserContext);
  const { type, bookingId, restaurantId, userId } = useParams();
  const navigate = useNavigate();

  const [cartItems, setCartItems] = useState([]);
  const [showCartModal, setShowCartModal] = useState(false);
  const [search, setSearch] = useState("");

  // Search bar filter logic
  const filteredMenuItems = restaurantMenuItems.filter(
    dish => dish.name.toLowerCase().includes(search.trim().toLowerCase())
  );

  // Add item to cart
  const addToCart = (dish) => {
    setCartItems((items) =>
      items.some((item) => item.id === dish.id)
        ? items
        : [...items, { ...dish, quantity: 1 }]
    );
  };

  // Remove item from cart
  const removeFromCart = (id) => {
    setCartItems(items => items.filter(item => item.id !== id));
  };

  // Update item quantity
  const updateQuantity = (id, change) => {
    setCartItems(items =>
      items.map(item =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + change) }
          : item
      )
    );
  };

  const isInCart = (id) => cartItems.some(item => item.id === id);

  const subtotal = cartItems.reduce((acc, item) => acc + parseFloat(item.price) * item.quantity, 0);
  const total = subtotal;

  const handleCheckout = async () => {
    const orderDetail = {
      restaurant: restaurantId,
      customer: userId,
      table: bookingId,
      order_type: type,
    };

    toast.loading('Placing your order...');
    try {
      const response = await placeNewOrder(orderDetail);
      if (response && response.data && response.data.id) {
        const orderId = response.data.id;
        await addItemsToOrder(orderId, cartItems);

        toast.dismiss();
        toast.success('Order placed successfully!');
        setShowCartModal(false);

        setTimeout(() => {
          navigate('/user/orders');
        }, 1000);
      } else {
        throw new Error('Error placing order!');
      }
    } catch (err) {
      toast.dismiss();
      toast.error(err.message || 'Unknown error occurred');
    }
  };

  useEffect(() => {
    if (restaurantId) fetchRestaurantItems(restaurantId);
    // eslint-disable-next-line
  }, [restaurantId]);

  return (
    <div className="">
      <div className="container py-4">
        <div className="mb-4">
          <h2><BsBagCheck className="me-2 text-primary"/>Food Menu</h2>
        </div>
        <hr />
        {/* Search Bar */}
        <div className="row mb-3">
          <div className="col-12 col-md-6 mx-auto">
            <div className="input-group shadow-sm mb-2">
              <span className="input-group-text bg-light">
                <BsSearch />
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Search by item name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Menu Listing */}
        <div className="row g-3">
          {filteredMenuItems.length === 0 ? (
            <p className="text-center text-secondary mt-4">No menu items available.</p>
          ) : (
            filteredMenuItems.map(dish => (
              <div key={dish.id} className="col-12 col-lg-3 col-md-4 col-sm-6">
                <div
                  className="card shadow-sm border rounded-3 mb-3"
                  style={{ height: "340px", display: "flex", flexDirection: "column" }}
                >
                  <img
                    src={dish.image}
                    alt={dish.name}
                    className="img-fluid rounded-top w-100 border-bottom"
                    style={{ maxHeight: "160px", objectFit: "cover" }}
                  />
                  <div className="card-body d-flex flex-column flex-grow-1">
                    <h5 className="mb-1 fw-bold">
                      {dish.food_type === "veg"
                        ? <BsEggFried className="me-1 text-success"/>
                        : <BsBagX className="me-1 text-danger"/>
                      }
                      {dish.name}
                    </h5>
                    <div>
                      <span className="badge bg-primary me-2">
                        <BsTagFill className="me-1"/>
                        {dish.category_detail?.name}
                      </span>
                      <span className={`badge rounded-pill ${dish.food_type === "veg" ? "bg-success" : "bg-danger"} mb-2`}>
                        {dish.food_type === "veg" ? "Veg" : "Non-Veg"}
                      </span>
                    </div>
                    <div className="mb-2 text-muted small" style={{
                      minHeight: "2em", maxHeight: "3em",
                      display: "-webkit-box", WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical", overflow: "hidden", textOverflow: "ellipsis"
                    }}>
                      {dish.description}
                    </div>
                    <div className="d-flex justify-content-between align-items-center mt-auto">
                      <span className="fw-bold text-primary">₹{parseFloat(dish.price).toFixed(2)}</span>
                      {dish.is_available ? (
                        !isInCart(dish.id) ? (
                          <button className="btn btn-success btn-sm" onClick={() => addToCart(dish)}>
                            <BsPlus className="me-1" /> Add
                          </button>
                        ) : (
                          <button className="btn btn-outline-danger btn-sm" onClick={() => removeFromCart(dish.id)}>
                            <BsTrash className="me-1" /> Remove
                          </button>
                        )
                      ) : (
                        <button className="btn btn-outline-secondary btn-sm" disabled>
                          <BsXCircle className="me-1"/>Not Available
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
          <div className="my-5"></div>
        </div>

        {/* Cart Bar */}
        {cartItems.length > 0 && (
          <div className="fixed-bottom mb-5 pb-3">
            <div className="container">
              <div className="card shadow-lg border border-success-subtle">
                <div className="card-body d-flex justify-content-between align-items-center">
                  <span>
                    <b><BsCartCheck className="me-1"/> {cartItems.reduce((sum, item) => sum + item.quantity, 0)} Item(s)</b>
                    <span className="ms-2 text-success">₹{subtotal.toFixed(2)}</span>
                  </span>
                  <button className="btn btn-danger" onClick={() => setShowCartModal(true)}>
                    <BsBagCheck className="me-2" />
                    View Cart
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Cart Modal */}
        {showCartModal && (
          <div
            className="modal fade show"
            style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
            tabIndex="-1"
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border border-primary rounded-4">
                <div className="modal-header bg-light">
                  <h5 className="modal-title fw-bold"><BsCartCheck className="me-2"/>Your Cart</h5>
                  <button type="button" className="btn-close" onClick={() => setShowCartModal(false)} />
                </div>
                <div className="modal-body">
                  {cartItems.length === 0 ? (
                    <div className="text-center text-muted">Your cart is empty.</div>
                  ) : (
                    <>
                      {cartItems.map(item => (
                        <div className="d-flex align-items-center py-2 border-bottom border-primary" key={item.id}>
                          <img src={item.image} alt={item.name} style={{ width: 48, height: 48, objectFit: "cover" }} className="rounded me-3 border border-2 border-primary"/>
                          <div className="flex-grow-1">
                            <div className="fw-bold">{item.name}
                              {item.food_type === "veg"
                                ? <BsEggFried className="ms-1 text-success"/>
                                : <BsBagX className="ms-1 text-danger"/>
                              }
                            </div>
                            <span className="badge bg-primary me-2">
                              <BsTagFill className="me-1"/>
                              {item.category_detail?.name}
                            </span>
                            <span className={`badge rounded-pill ${item.food_type === "veg" ? "bg-success" : "bg-danger"}`}>
                              {item.food_type === "veg" ? "Veg" : "Non-Veg"}
                            </span>
                            <div className="small text-secondary">₹{parseFloat(item.price).toFixed(2)}</div>
                          </div>
                          <div className="d-flex align-items-center mx-2">
                            <button
                              className="btn btn-outline-secondary btn-sm"
                              onClick={() => updateQuantity(item.id, -1)}
                              disabled={item.quantity <= 1}
                            >
                              <BsDash />
                            </button>
                            <span className="px-2 fw-bold">{item.quantity}</span>
                            <button
                              className="btn btn-outline-secondary btn-sm"
                              onClick={() => updateQuantity(item.id, +1)}
                            >
                              <BsPlus />
                            </button>
                          </div>
                          <div className="fw-bold ms-2 text-primary">₹{(parseFloat(item.price) * item.quantity).toFixed(2)}</div>
                        </div>
                      ))}
                      <div className="mt-3">
                        <div className="d-flex justify-content-between">
                          <span>Subtotal</span>
                          <span>₹{subtotal.toFixed(2)}</span>
                        </div>
                        <div className="d-flex justify-content-between fw-bold">
                          <span>Total</span>
                          <span>₹{total.toFixed(2)}</span>
                        </div>
                        <button
                          className="btn btn-danger w-100 mt-3"
                          onClick={handleCheckout}
                        >
                          <BsCartCheck className="me-2" /> CHECKOUT
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewOrders;
