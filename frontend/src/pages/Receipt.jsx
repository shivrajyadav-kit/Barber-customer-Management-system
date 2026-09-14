import { useLocation, useNavigate } from "react-router-dom";
import "./Receipt.css";

function Receipt() {
  const location = useLocation();
  const navigate = useNavigate();

  const {
    bookingId,
    amount,
    customername,
    contact,
    date,
    time,
    service,
    barber,
  } = location.state || {};

  if (!bookingId) {
    return (
      <main className="receipt-page">
        <div className="receipt-card">
          <h2>Receipt Not Found</h2>
          <button onClick={() => navigate("/")}>
            Go Home
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="receipt-page">
      <div className="receipt-card">
        <div className="receipt-header">
          <h1>CUT & STYLE</h1>
          <p>Appointment Receipt</p>
        </div>

        <div className="receipt-success">
          ✓ Payment Successful
        </div>

        <div className="receipt-info">
          <div>
            <span>Booking ID</span>
            <strong>{bookingId}</strong>
          </div>

          <div>
            <span>Customer</span>
            <strong>{customername}</strong>
          </div>

          <div>
            <span>Phone</span>
            <strong>{contact}</strong>
          </div>

          <div>
            <span>Service</span>
            <strong>{service}</strong>
          </div>

          <div>
            <span>Barber</span>
            <strong>{barber}</strong>
          </div>

          <div>
            <span>Date</span>
            <strong>{date}</strong>
          </div>

          <div>
            <span>Time</span>
            <strong>{time}</strong>
          </div>
        </div>

        <div className="receipt-total">
          <span>Amount Paid</span>
          <strong>₹{amount}</strong>
        </div>

        <div className="receipt-actions">
          <button onClick={() => window.print()}>
            Print Receipt
          </button>

          <button onClick={() => navigate("/")}>
            Go Home
          </button>
        </div>
      </div>
    </main>
  );
}

export default Receipt;
