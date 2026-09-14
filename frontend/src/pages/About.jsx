import React from "react";
import "./About.css";
import salon2 from "../images/salon-2.jpg";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function About() {
    return (
        <div className="about-page">
            <Navbar />

            <section className="about-hero">
                <div className="about-hero-content">
                    <p className="about-hero-label">
                        ABOUT STTYLE
                    </p>

                    <h1>
                        STYLE THAT
                        <br />
                        FEELS LIKE YOU
                    </h1>

                    <p className="about-hero-description">
                        Professional grooming with a
                        personal touch.
                    </p>
                </div>
            </section>

            <section className="about-story">

                <div className="about-story-image">
                    <img
                        src={salon2}
                        alt="Sttyle hair salon"
                    />
                </div>

                <div className="about-story-content">

                    <p className="about-label">
                        OUR STORY
                    </p>

                    <h2>
                        MORE THAN JUST
                        <br />
                        A HAIRCUT
                    </h2>

                    <p>
                        At Sttyle, we believe a great haircut
                        is more than just a service. It's about
                        confidence, personality, and feeling
                        your best.
                    </p>

                    <p>
                        Our experienced stylists take the time
                        to understand your style and create a
                        look that feels uniquely yours.
                    </p>

                    <p>
                        From classic cuts to modern styling,
                        every appointment is focused on quality,
                        attention to detail, and an experience
                        you'll want to come back to.
                    </p>

                </div>
            </section>

            <section className="about-values">

                <div className="about-values-heading">
                    <p>WHY CHOOSE US</p>

                    <h2>
                        QUALITY. STYLE. CONFIDENCE.
                    </h2>
                </div>

                <div className="about-values-grid">

                    <div className="about-value-card">
                        <span>01</span>

                        <h3>
                            Experienced Stylists
                        </h3>

                        <p>
                            Our stylists bring professional
                            experience and attention to detail
                            to every appointment.
                        </p>
                    </div>

                    <div className="about-value-card">
                        <span>02</span>

                        <h3>
                            Personalized Service
                        </h3>

                        <p>
                            Every haircut and style is tailored
                            to your personality, preferences,
                            and lifestyle.
                        </p>
                    </div>

                    <div className="about-value-card">
                        <span>03</span>

                        <h3>
                            Premium Experience
                        </h3>

                        <p>
                            Enjoy a relaxed salon environment
                            where quality and comfort come first.
                        </p>
                    </div>

                </div>

            </section>
            <Footer />

        </div>
    );
}

export default About;
