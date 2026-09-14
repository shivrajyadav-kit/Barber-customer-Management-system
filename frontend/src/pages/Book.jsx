import { useState } from "react";
import "./Book.css";
import { Link, useNavigate } from "react-router-dom";
import api from "../components/utils/api";

const getToday = () => {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

function Booking() {
  const [customername, setCustomername] = useState("");
  const [date, setDate] = useState(getToday());
  const [time, setTime] = useState("");
  const [address, setAddress] = useState("");
  const [contact, setContact] = useState("");
  const [age, setAge] = useState("");
  const [service, setService] = useState("");
  const [barber, setBarber] = useState("Any Barber");
  const [gender, setGender] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleBooking = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    // Validation
    if (!customername.trim()) {
      setError("Please enter your name.");
      return;
    }

    if (!contact.trim()) {
      setError("Please enter your phone number.");
      return;
    }

    if (!service) {
      setError("Please select a service.");
      return;
    }

    if (!date) {
      setError("Please select a date.");
      return;
    }

    if (!time) {
      setError("Please select a time.");
      return;
    }

    if (!gender) {
      setError("Please select your gender.");
      return;
    }

    setLoading(true);

    try {
      /*
       * IMPORTANT:
       * We don't send price from frontend.
       *
       * Backend will determine the price based
       * on the selected service.
       */
      const response = await api.post(
        "/customer/book-appointment",
        {
          customername,
          contact,
          age,
          date,
          time,
          address,
          service,
          barber,
          gender,
        }
      );

console.log(
  "BOOKING RESPONSE:",
  JSON.stringify(response.data, null, 2)
);

      /*
       * Backend should return:
       *
       * {
       *   success: true,
       *   bookingId: "...",
       *   amount: 300
       * }
       */

      const bookingId = response.data.bookingId;
      const amount = response.data.amount;

      if (!bookingId) {
        setError("Booking was created but booking ID was not returned.");
        return;
      }

      /*
       * Go to payment page
       */
      navigate("/payment", {
        state: {
          bookingId,
          amount,

          customername,
          contact,
          date,
          time,
          service,
          barber,
        },
      });

    } catch (error) {
      console.error("Booking failed:", error);

      if (error.response?.status === 401) {
        navigate("/login", {
          state: {
            from: "/booking",
            message:
              "Your login session has expired. Please log in again to book your appointment.",
          },
        });

        return;
      }

      setError(
        error.response?.data?.message ||
          "Booking failed. Please try again."
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="booking-page">
      <div className="booking-container">

        <Link to="/" className="back-button">
          ← Back
        </Link>

        <div className="booking-header">
          <p>APPOINTMENT</p>

          <h1>Book Appointment</h1>

          <span>
            Choose your service, barber, date and preferred time.
          </span>
        </div>

        {error && (
          <div className="booking-error">
            {error}
          </div>
        )}

        {success && (
          <div className="booking-success">
            {success}
          </div>
        )}

        <form
          className="booking-form"
          onSubmit={handleBooking}
        >

          {/* Name */}
          <div className="form-group">
            <label htmlFor="name">
              Name*
            </label>

            <input
              id="name"
              type="text"
              placeholder="eg. Shivraj Yadav"
              value={customername}
              onChange={(e) =>
                setCustomername(e.target.value)
              }
              required
            />
          </div>

          {/* Phone */}
          <div className="form-group">
            <label htmlFor="contact">
              Phone*
            </label>

            <input
              id="contact"
              type="tel"
              placeholder="Enter your phone number"
              value={contact}
              onChange={(e) =>
                setContact(e.target.value)
              }
              required
            />
          </div>

          {/* Age */}
          <div className="form-group">
            <label htmlFor="age">
              Age
            </label>

            <input
              id="age"
              type="number"
              placeholder="Enter your age"
              value={age}
              onChange={(e) =>
                setAge(e.target.value)
              }
              min="1"
              max="120"
            />
          </div>

          {/* Service */}
          <div className="form-group">
            <label htmlFor="service">
              Choose Service*
            </label>

            <select
              id="service"
              value={service}
              onChange={(e) =>
                setService(e.target.value)
              }
              required
            >
              <option value="">
                Select Service
              </option>

              <option value="Classic Haircut">
                Classic Haircut
              </option>

              <option value="Haircut + Beard">
                Haircut + Beard
              </option>

              <option value="Beard Trim">
                Beard Trim
              </option>

              <option value="Hair Styling">
                Hair Styling
              </option>

              <option value="Hair Spa">
                Hair Spa
              </option>

              <option value="Head Massage">
                Head Massage
              </option>

              <option value="Premium Haircut">
                Premium Haircut
              </option>

              <option value="Beard Styling">
                Beard Styling
              </option>
            </select>
          </div>

          {/* Barber */}
          <div className="form-group">
            <label htmlFor="barber">
              Choose Barber
            </label>

            <select
              id="barber"
              value={barber}
              onChange={(e) =>
                setBarber(e.target.value)
              }
            >
              <option value="Any Barber">
                Any Barber
              </option>

              <option value="John">
                John
              </option>

              <option value="Mike">
                Mike
              </option>

              <option value="Alex">
                Alex
              </option>
            </select>
          </div>

          {/* Date */}
          <div className="form-group">
            <label htmlFor="date">
              Choose Date*
            </label>

            <input
              id="date"
              type="date"
              value={date}
              min={getToday()}
              onChange={(e) =>
                setDate(e.target.value)
              }
              required
            />
          </div>

          {/* Time */}
          <div className="form-group">
            <label htmlFor="time">
              Choose Time*
            </label>

            <select
              id="time"
              value={time}
              onChange={(e) =>
                setTime(e.target.value)
              }
              required
            >
              <option value="">
                Select Time
              </option>

              <option value="09:00 AM">
                09:00 AM
              </option>

              <option value="10:00 AM">
                10:00 AM
              </option>

              <option value="11:00 AM">
                11:00 AM
              </option>

              <option value="12:00 PM">
                12:00 PM
              </option>

              <option value="01:00 PM">
                01:00 PM
              </option>

              <option value="02:00 PM">
                02:00 PM
              </option>

              <option value="03:00 PM">
                03:00 PM
              </option>

              <option value="04:00 PM">
                04:00 PM
              </option>

              <option value="05:00 PM">
                05:00 PM
              </option>
            </select>
          </div>

          {/* Gender */}
          <div className="form-group">
            <label htmlFor="gender">
              Choose Gender*
            </label>

            <select
              id="gender"
              value={gender}
              onChange={(e) =>
                setGender(e.target.value)
              }
              required
            >
              <option value="">
                Select Gender
              </option>

              <option value="Male">
                Male
              </option>

              <option value="Female">
                Female
              </option>

              <option value="Other">
                Other
              </option>
            </select>
          </div>

          {/* Address */}
          <div className="form-group">
            <label htmlFor="address">
              Address
            </label>

            <input
              id="address"
              type="text"
              placeholder="eg. Rajapur, Jaunpur"
              value={address}
              onChange={(e) =>
                setAddress(e.target.value)
              }
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="confirm-button"
            disabled={loading}
          >
            {loading
              ? "Creating Booking..."
              : "Confirm Appointment"}
          </button>

        </form>
      </div>
    </main>
  );
}

export default Booking;
