/* eslint-disable @next/next/no-img-element */
'use client';

import React, {useState, useEffect} from 'react';
import {ArrowRight, AtSign, Cloud, Github, Linkedin} from 'lucide-react';

const images = [
    '/images/ddd.webp',
    '/images/2023DevOpsDays-1.webp',
    '/images/2023DevOpsDays-2.webp'
];

const Hero: React.FC = () => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        const timer = setInterval(() => {
            setIsAnimating(true);
            setTimeout(() => {
                setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
                setIsAnimating(false);
            }, 1500); // Animation duration
        }, 5000); // Change image every 5 seconds

        return () => clearInterval(timer);
    }, []);

    return (
        <section className="min-h-screen flex items-center pt-32 pb-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div className="space-y-8 text-center lg:text-left">
                        <a href="#event"
                           className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-all cursor-pointer group">
              <span className="relative flex h-2 w-2">
                <span
                    className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary"></span>
              </span>
                            <span className="text-sm text-primary font-medium">
                Next Event: K8s Workshop (Oct 20)
              </span>
                            <ArrowRight
                                className="h-3.5 w-3.5 text-primary/80 group-hover:translate-x-1 transition-transform"/>
                        </a>

                        <h1 className="text-5xl md:text-7xl font-bold text-dark-text tracking-tight leading-tight">
                            Architecting <br/>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                High Availability
              </span> Cloud Systems.
                        </h1>

                        <p className="text-lg text-dark-text/70 max-w-xl leading-relaxed mx-auto lg:mx-0">
                            I&apos;m Steven (鄭棋文), a Senior Cloud Architect. I specialize in designing resilient cloud
                            infrastructures, optimizing DevOps workflows, and mastering CI/CD pipelines to deliver speed
                            and stability.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                            <a href="#blog"
                               className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-primary hover:bg-orange-700 transition-all shadow-lg hover:shadow-primary/40">
                                View My Blog
                                <ArrowRight className="ml-2 h-4 w-4"/>
                            </a>
                            <a href="#contact"
                               className="inline-flex items-center justify-center px-8 py-3 border border-border-light text-base font-medium rounded-lg text-dark-text hover:bg-black/5 transition-all">
                                Contact Me
                            </a>
                        </div>

                        <div className="flex items-center gap-6 pt-4 justify-center lg:justify-start">
                            <a href="https://github.chiwencheng.com" target="_blank" rel="noopener noreferrer"
                               className="text-dark-text/50 hover:text-primary transition-colors"><Github
                                className="h-6 w-6"/></a>
                            <a href="https://cv.chiwencheng.com" target="_blank" rel="noopener noreferrer"
                               className="text-dark-text/50 hover:text-primary transition-colors"><Linkedin
                                className="h-6 w-6"/></a>
                            <a href="https://thread.chiwencheng.com" target="_blank" rel="noopener noreferrer"
                               className="text-dark-text/50 hover:text-primary transition-colors"><AtSign
                                className="h-6 w-6"/></a>
                        </div>
                    </div>

                    <div className="relative hidden lg:block">
                        <div
                            className="relative z-10 w-full max-w-md mx-auto aspect-square rounded-2xl overflow-hidden shadow-2xl border-4 border-white bg-white">
                            {images.map((image, index) => (
                                <img
                                    key={image}
                                    src={image}
                                    alt={`Steven Cheng portfolio image ${index + 1}`}
                                    className={`absolute inset-0 w-full h-full object-cover ${
                                        index === currentImageIndex && isAnimating ? 'animate-ink-splash' : ''
                                    } ${
                                        index !== currentImageIndex ? 'opacity-0' : 'opacity-100'
                                    }`}
                                />
                            ))}
                        </div>
                        <div
                            className="absolute -bottom-6 -right-6 z-20 bg-card border border-border-light p-4 rounded-xl shadow-lg flex items-center gap-4">
                            <div className="bg-primary/10 p-2 rounded-full text-primary">
                                <Cloud className="h-6 w-6"/>
                            </div>
                            <div>
                                <p className="text-xs text-dark-text/60">Uptime</p>
                                <p className="text-lg font-bold text-dark-text">99.99%</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
