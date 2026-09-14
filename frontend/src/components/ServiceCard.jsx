import React from "react";
import "./ServiceCard.css";
import { Link } from "react-router-dom";

function ServiceCard({ service }) {
  return (
    <div
      className="service-card"
      style={{
        backgroundImage: `url("${service.image}")`,
      }}
    >
      <div className="service-card-content">

        <h3>{service.name}</h3>

        <p className="duration">
          {service.duration}
        </p>

        <h2 className="price">
          {service.price}
        </h2>

        <Link to="/booking">
          <button>
            Book Now
          </button>
        </Link>

      </div>
    </div>
  );
}

export default ServiceCard;
