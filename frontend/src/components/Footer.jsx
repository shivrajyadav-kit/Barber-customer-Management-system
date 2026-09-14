import React from "react";
import { FaInstagram, FaFacebookF, FaWhatsapp } from "react-icons/fa";
import "./Footer.css";

function Footer() {
  return (
    <footer className="footer">

      <div className="footer-container">

        <div className="footer-brand">
          <h2>YOUR SALON</h2>

          <p>
            Premium grooming and styling for men who
            value confidence, comfort, and great style.
          </p>
        </div>

        <div className="footer-column">
          <h3>Quick Links</h3>

          <ul>
            <li>
              <a href="/">Home</a>
            </li>

            <li>
              <a href="/services">Services</a>
            </li>

            <li>
              <a href="/about">About Us</a>
            </li>
            <li>
              <a href="/contact">Contacts</a>
            </li>

            <li>
              <a href="/booking">Book Appointment</a>
            </li>
          </ul>
        </div>

        <div className="footer-column">
          <h3>Services</h3>

          <ul>
            <li>Classic Haircut</li>
            <li>Haircut + Beard</li>
            <li>Beard Trim</li>
            <li>Hair Styling</li>
          </ul>
        </div>

        <div className="footer-column">
          <h3>Visit Us</h3>

          <p>Gopalapur, Jaunpur,</p>
          <p>UttarPradesh, India</p>
          <p>+91 98765 43210</p>
          <p>info@salon.com</p>
          <p className="footer-hours">
            Mon - Sun: 9:00 AM - 8:00 PM
          </p>
        </div>

      </div>

      <div className="footer-bottom">

        <p>
          © 2026 Your Salon. All rights reserved.
        </p>

        <div className="footer-social">
          <a href="#" aria-label="Instagram">
            <FaInstagram />
          </a>

          <a href="#" aria-label="Facebook">
            <FaFacebookF />
          </a>

          <a href="#" aria-label="WhatsApp">
            <FaWhatsapp />
          </a>
        </div>

      </div>

    </footer>
  );
}

export default Footer;