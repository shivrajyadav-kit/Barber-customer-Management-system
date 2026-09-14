import React from "react";
import { Link } from "react-router-dom";
import "./Experiance.css";

function Experiance() {
  return (
    <div className="experience-page">

      {/* ==================================================
          ABOUT / OUR STORY
      ================================================== */}

      <section className="home-about">

        <div className="about-image-box">

          <img
            src="https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=3840&q=90"
            alt="Professional barber providing grooming service"
          />

          <div className="experience-circle">
            <strong>10+</strong>
            <span>Years Experience</span>
          </div>

        </div>


        <div className="about-content">

          <p className="small-title">
            OUR STORY
          </p>

          <h2>
            More Than Just
            <br />
            A <span>Haircut.</span>
          </h2>

          <p className="about-description">
            We believe that looking good is about more than
            just a haircut. It's about confidence, personality
            and feeling your best.
          </p>

          <p className="about-description">
            Our experienced barbers combine traditional
            techniques with modern styles to create a look
            that is uniquely yours.
          </p>


          {/* STATS */}

          <div className="about-stats">

            <div className="stat-item">
              <strong>5K+</strong>
              <span>Happy Clients</span>
            </div>

            <div className="stat-item">
              <strong>10+</strong>
              <span>Years Experience</span>
            </div>

            <div className="stat-item">
              <strong>15+</strong>
              <span>Services</span>
            </div>

          </div>


          {/* BUTTON */}

          <Link
            to="/about"
            className="about-button"
          >
            Discover More
            <span>→</span>
          </Link>

        </div>

      </section>


      {/* ==================================================
          WHY CHOOSE US
      ================================================== */}

      <section className="why-us">

        <div className="why-heading">

          <p className="small-title">
            WHY CHOOSE US
          </p>

          <h2>
            The Difference Is
            <br />
            <span>In The Details.</span>
          </h2>

          <p className="why-description">
            We focus on every detail to make your grooming
            experience comfortable, professional and memorable.
          </p>

        </div>


        {/* WHY GRID */}

        <div className="why-grid">


          {/* ==================================================
              CARD 1
          ================================================== */}

          {/* EXPERT BARBERS */}

<div className="why-card">

  <div className="why-image">
    <img
      src="https://images.unsplash.com/photo-1567894340315-735d7c361db0?auto=format&fit=crop&w=3840&q=90"
      alt="Expert barber giving a professional haircut"
    />
  </div>

  <div className="why-icon">✂</div>

  <div className="why-card-content">
    <h3>Expert Barbers</h3>

    <p>
      Our skilled barbers understand both classic
      grooming and modern hairstyles.
    </p>
  </div>

</div>


{/* PREMIUM QUALITY */}

<div className="why-card">

  <div className="why-image">
    <img
      src="https://www.chauhanfadez.ca/static/images/services_premium.png"
      alt="Premium barber tools and grooming equipment"
    />
  </div>

  <div className="why-icon">★</div>

  <div className="why-card-content">
    <h3>Premium Quality</h3>

    <p>
      We use quality products and professional
      techniques for the best results.
    </p>
  </div>

</div>


          {/* ==================================================
              CARD 3
          ================================================== */}

          <div className="why-card">

            <div className="why-image">

              <img
                src="https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=3840&q=90"
                alt="Modern barbershop interior"
              />

            </div>


            <div className="why-icon">
              ◷
            </div>


            <div className="why-card-content">

              <h3>
                Easy Booking
              </h3>

              <p>
                Choose your service, barber, date and time
                with our simple booking system.
              </p>

            </div>

          </div>


          {/* ==================================================
              CARD 4
          ================================================== */}

          <div className="why-card">

            <div className="why-image">

              <img
                src="https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=3840&q=90"
                alt="Happy customer receiving barber service"
              />

            </div>


            <div className="why-icon">
              ♥
            </div>


            <div className="why-card-content">

              <h3>
                Customer First
              </h3>

              <p>
                Your satisfaction is our priority. We listen
                to what you want and deliver it.
              </p>

            </div>

          </div>

        </div>

      </section>


      {/* ==================================================
          CTA / BOOK APPOINTMENT
      ================================================== */}

      <section className="home-cta">

        <img
          src="https://images.unsplash.com/photo-1512690459411-b9245aed614b?auto=format&fit=crop&w=3840&q=90"
          alt="Professional barber shop interior"
        />

        <div className="cta-dark"></div>


        <div className="cta-content">

          <p>
            YOUR NEXT LOOK STARTS HERE
          </p>

          <h2>
            Ready For Your
            <br />
            <span>Best Look?</span>
          </h2>

          <p className="cta-description">
            Book your appointment today and let our
            professional barbers take care of the rest.
          </p>


          <Link
            to="/booking"
            className="cta-button"
          >
            Book Appointment
            <span>→</span>
          </Link>

        </div>

      </section>

    </div>
  );
}

export default Experiance;
