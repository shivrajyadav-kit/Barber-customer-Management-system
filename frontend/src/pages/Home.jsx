import React from "react";
import Navbar from "../components/Navbar.jsx";
import ServiceCard from "../components/ServiceCard.jsx";
import "./Home.css";
import { services } from "../data/service.js";
import ImageCarousel from "../components/ImageCarousel.jsx";
import Footer from "../components/Footer.jsx";
import { Link } from "react-router-dom";
import Experiance from "../components/Experiance.jsx";

function Home() {
  return (
    <>
      <Navbar />

      <main>

        
        <ImageCarousel />


        
        <section
          id="services"
          className="services-section"
        >

          <div className="section-heading" style={{alignItems:"center"}}>
            <p>WHAT WE OFFER</p>

            <h2 style={{color:"white"}}>
              Our Services
            </h2>
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
        <Experiance />
      </main>


      <Footer />
    </>
  );
}

export default Home;
