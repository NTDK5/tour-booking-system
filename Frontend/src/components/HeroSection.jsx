/* eslint-disable react/no-unescaped-entities */
import React from "react";
import { Link } from "react-router-dom";
// Swiper
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, EffectFade } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-fade";
// Hero images
import Hero2 from "../assets/images/Hero2.jpg";
import Hero3 from "../assets/images/hero3.jpg";
import Hero4 from "../assets/images/hero4.jpg";
import { useNavigate } from "react-router-dom";

export default function HeroSection() {
    const navigate = useNavigate();

    return (
        <>
            <section className="relative w-full h-[75vh] sm:h-[80vh] md:h-[90vh] lg:h-[100vh] overflow-hidden">
                <Swiper
                    modules={[Autoplay, Pagination, EffectFade]}
                    effect="fade"
                    autoplay={{ delay: 4000, disableOnInteraction: false }}
                    loop
                    pagination={{ clickable: true }}
                    className="absolute inset-0 h-full w-full z-0"
                >
                    {[Hero2, Hero3, Hero4].map((src, index) => (
                        <SwiperSlide key={index}>
                            <img src={src} alt="Ethiopia scenery" className="w-full h-full object-cover" />
                        </SwiperSlide>
                    ))}
                </Swiper>

                {/* Gradient overlay above images, below content */}
                <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-b from-black/70 via-black/50 to-black/30"></div>

                {/* Foreground content */}
                <div className="absolute inset-0 z-30 flex items-center justify-center md:justify-start  sm:px-8 md:px-12 lg:px-28 xl:px-44">
                    <div className="max-w-3xl text-white text-center md:text-left">
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 md:mb-6 animate-fade-in-up">
                            Authentic Ethiopia Cultural Tours & Dorze Lodge Experiences
                        </h1>
                        <p className="text-base sm:text-lg lg:text-xl mb-6 md:mb-8 opacity-90 leading-relaxed">
                            Journey through ancient history, breathtaking landscapes, and vibrant cultures with our expertly crafted tours.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center justify-center md:justify-start">
                            <Link
                                to="/our_packages"
                                className="bg-[#F29404] hover:bg-[#DB8303] px-6 py-3 lg:px-8 lg:py-3 rounded-lg font-semibold transition-all transform hover:scale-105 w-full sm:w-auto"
                            >
                                Explore Tours
                            </Link>
                            <button
                                onClick={() => navigate('/custom-trip/create')}
                                className="border-2 border-white hover:bg-white hover:text-purple-900 px-6 py-3 lg:px-8 lg:py-3 rounded-lg font-semibold transition-colors w-full sm:w-auto"
                            >
                                Custom Trip
                            </button>
                        </div>
                    </div>
                </div>
            </section>


        </>
    );
} 