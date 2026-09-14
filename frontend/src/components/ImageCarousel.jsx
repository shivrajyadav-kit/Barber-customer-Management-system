ImageCarousel.jsx

import React, { useEffect, useState } from "react";
import "./ImageCarousel.css";

import salon1 from "../images/salon-1.jpg";
import salon2 from "../images/salon-2.jpg";
import salon3 from "../images/salon-3.jpg";
import salon4 from "../images/salon-4.jpg";
import salon5 from "../images/salon-5.jpg";
import Hero from "./Hero.jsx";

const images = [
    salon1,
    salon2,
    salon3,
    salon4,
    salon5,
];

function ImageCarousel() {
    const [currentImage, setCurrentImage] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImage((prev) => (prev + 1) % images.length);
        }, 2500);

        return () => clearInterval(interval);
    }, []);

    return (
        
        <section className="image-carousel">
            <Hero />
            <img
            
                src={images[currentImage]}
                alt="Hair salon"
                className="carousel-image"
            />

            <div className="carousel-overlay"></div>
        </section>
    );
}

export default ImageCarousel;