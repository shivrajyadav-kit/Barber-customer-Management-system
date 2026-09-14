import { useLocation, useNavigate } from "react-router-dom";
import "./Payment.css";
import { useState } from "react";
import api from "../components/utils/api";

function Payment() {
  const location = useLocation();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

  // Check booking data
  if (!bookingId || !amount) {
    return (
      <main className="payment-page">
        <div className="payment-card">
          <h2>Invalid Booking</h2>

          <p>
            Booking information is missing.
            Please create a booking first.
          </p>

          <button onClick={() => navigate("/booking")}>
            Go to Booking
          </button>
        </div>
      </main>
    );
  }

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      // Already loaded
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement("script");

      script.src =
        "https://checkout.razorpay.com/v1/checkout.js";

      script.onload = () => {
        resolve(true);
      };

      script.onerror = () => {
        resolve(false);
      };

      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    try {
      setError("");
      setLoading(true);

      // 1. Load Razorpay
      const scriptLoaded = await loadRazorpayScript();

      if (!scriptLoaded) {
        setError(
          "Razorpay failed to load. Please check your internet connection."
        );
        setLoading(false);
        return;
      }

      // 2. Create Razorpay order from backend
      const response = await api.post(
        "/payment/create-payment",
        {
          bookingId,
        }
      );

      // console.log(
      //   "RAZORPAY ORDER:",
      //   JSON.stringify(response.data, null, 2)
      // );

      const order = response.data.order;

      if (!order) {
        throw new Error("Razorpay order was not created");
      }

      // 3. Razorpay checkout options
  const options = {
    key: import.meta.env.VITE_RAZORPAY_KEY_ID,
    amount: order.amount,
    currency: order.currency,

    name: "Haircut Salon",
    description: service,

    order_id: order.id,

    prefill: {
        name: customername,
        contact: contact,
    },

    theme: {
        color: "#111111",
    },

    handler: async function (response) {
        //console.log("RAZORPAY RESPONSE:", response);

        try {
            const verifyResponse = await api.post(
                "/payment/verify-payment",
                {
                    bookingId,
                    razorpayOrderId:
                        response.razorpay_order_id,
                    razorpayPaymentId:
                        response.razorpay_payment_id,
                    razorpaySignature:
                        response.razorpay_signature,
                }
            );

            if (verifyResponse.data.success) {
                navigate("/receipt", {
                    state: {
                        bookingId,
                        amount,
                        customername,
                        contact,
                        date,
                        time,
                        service,
                        barber,
                        paymentId:
                            response.razorpay_payment_id,
                    },
                });
            }
        } catch (error) {
            console.error(error);
            setError("Payment verification failed.");
            setLoading(false);
        }
    },

    modal: {
        ondismiss: () => {
            setLoading(false);
        },
    },
};

const razorpay = new window.Razorpay(options);
razorpay.open();



    } catch (error) {
      console.error(
        "Payment error:",
        error
      );

      setError(
        error.response?.data?.message ||
          error.message ||
          "Unable to start payment."
      );

      setLoading(false);
    }
  };

  return (
    <main className="payment-page">
      <div className="payment-card">

        <div className="payment-header">
          <p>PAYMENT</p>

          <h1>
            Complete Payment
          </h1>

          <span>
            Your appointment is waiting for payment.
          </span>
        </div>

        <div className="payment-details">

          <div>
            <span>Customer</span>
            <strong>
              {customername}
            </strong>
          </div>

          <div>
            <span>Phone</span>
            <strong>
              {contact}
            </strong>
          </div>

          <div>
            <span>Service</span>
            <strong>
              {service}
            </strong>
          </div>

          <div>
            <span>Barber</span>
            <strong>
              {barber}
            </strong>
          </div>

          <div>
            <span>Date</span>
            <strong>
              {date}
            </strong>
          </div>

          <div>
            <span>Time</span>
            <strong>
              {time}
            </strong>
          </div>

        </div>

        <div className="payment-total">
          <span>
            Total Amount
          </span>

          <strong>
            ₹{amount}
          </strong>
        </div>

        {error && (
          <div className="payment-error">
            {error}
          </div>
        )}

        <button
          className="pay-button"
          onClick={handlePayment}
          disabled={loading}
        >
          {loading
            ? "Opening Payment..."
            : `Pay ₹${amount}`}
        </button>

        <button
          className="back-payment"
          onClick={() => navigate("/booking")}
          disabled={loading}
        >
          Back to Booking
        </button>

      </div>
    </main>
  );
}

export default Payment;
