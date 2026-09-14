import React from "react";
import "./Services.css";
import { services } from "../data/service";
import ServiceCard from "../components/ServiceCard.jsx";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";

function Services() {
    return (
        <div className="services-page">
            <Navbar />

            <section className="services-hero">
                <div className="services-hero-content">

                    <p>OUR SERVICES</p>

                    <h1>
                        LOOK GOOD.
                        <br />
                        FEEL CONFIDENT.
                    </h1>

                    <span>
                        Professional grooming services
                        designed around your style.
                    </span>

                </div>
            </section>


            <section className="services-list">

                <div className="services-heading">

                    <p>WHAT WE OFFER</p>

                    <h2>OUR SERVICES</h2>

                </div>


                <div className="services-grid">

                    {services.map((service) => (
                        <ServiceCard
                            key={service.id}
                            service={service}
                        />
                    ))}

                </div>

            </section>
            <Footer />

        </div>
    );
}

export default Services;

