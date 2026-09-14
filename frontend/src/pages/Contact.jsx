import React, { useState } from "react";
import "./Contact.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import api from "../components/utils/api.js";

function Contact() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        message: "",
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");


    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setLoading(true);
        setSuccess("");
        setError("");
        try {
            const response = await api.post("/contact", formData);
            console.log("contact response: ", response.data);

            setSuccess("Your has message been sent successfully.");
            setFormData({
                name: "",
                email: "",
                phone: "",
                message: ""
            })
        } catch (error) {
            console.log(error);
            setError(error.response?.message || "Unable to send your message. Please try again.")
        }
    };

    
    return (
        <div className="contact-page">

            <Navbar />

            <section className="contact-hero">
                <div className="contact-hero-content">

                    <p>GET IN TOUCH</p>

                    <h1>
                        LET'S TALK
                        <br />
                        ABOUT YOUR STYLE.
                    </h1>

                    <span>
                        Have a question or want to book an appointment?
                        We'd love to hear from you.
                    </span>

                </div>
            </section>

            <section className="contact-section">

                <div className="contact-info">

                    <p className="contact-label">
                        CONTACT US
                    </p>

                    <h2>
                        WE'RE HERE
                        <br />
                        TO HELP.
                    </h2>

                    <div className="contact-details">

                        <div className="contact-detail">
                            <span>PHONE</span>
                            <p>
                                +91 7307675952
                            </p>
                        </div>

                        <div className="contact-detail">
                            <span>EMAIL</span>
                            <p>
                                sy@gmail.com
                            </p>
                        </div>

                        <div className="contact-detail">
                            <span>LOCATION</span>

                            <p>
                                Gopalapur, Main Road,
                                <br />
                                Jaunpur, UP 2221337
                            </p>
                        </div>

                        <div className="contact-detail">
                            <span>OPENING HOURS</span>

                            <p>
                                Mon - Sat: 9:00 AM - 8:00 PM
                                <br />
                                Sunday: 10:00 AM - 5:00 PM
                            </p>
                        </div>

                    </div>

                </div>

                <div className="contact-form-wrapper">

                    <form
                        className="contact-form"
                        onSubmit={handleSubmit}
                    >

                        {success && (
                            <div className="contact-success">
                                {success}
                            </div>
                        )}

                        {error && (
                            <div className="contact-error">
                                {error}
                            </div>
                        )}

                        <div className="form-group">

                            <label htmlFor="name">
                                NAME
                            </label>

                            <input
                                id="name"
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Your name"
                                required
                            />

                        </div>

                        <div className="form-group">

                            <label htmlFor="email">
                                EMAIL
                            </label>

                            <input
                                id="email"
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Your email"
                                required
                            />

                        </div>

                        <div className="form-group">

                            <label htmlFor="phone">
                                PHONE
                            </label>

                            <input
                                id="phone"
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="Your phone number"
                            />

                        </div>

                        <div className="form-group">

                            <label htmlFor="message">
                                MESSAGE
                            </label>

                            <textarea
                                id="message"
                                name="message"
                                value={formData.message}
                                onChange={handleChange}
                                placeholder="How can we help?"
                                rows="5"
                                required
                            />

                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                        >
                            {loading
                                ? "SENDING..."
                                : "SEND MESSAGE"}
                        </button>

                    </form>

                </div>

            </section>

            <Footer />

        </div>
    );
}


export default Contact;
