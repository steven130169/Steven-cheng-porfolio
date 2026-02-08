/* eslint-disable @next/next/no-img-element */
'use client'

import React, {useState, useEffect} from 'react'
import {SiGithub, SiThreads} from '@icons-pack/react-simple-icons'
import {ArrowRight, Cloud} from 'lucide-react'
import type {HeroData} from '@/lib/getHomepageData'

interface HeroClientProps {
    data: HeroData
}

export const HeroClient: React.FC<HeroClientProps> = ({data}) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0)
    const [isAnimating, setIsAnimating] = useState(false)

    const images = data.carouselImages || []

    useEffect(() => {
        if (images.length === 0) return

        const goToNextImage = () => {
            setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length)
        }

        const timer = setInterval(() => {
            setIsAnimating(true)
            setTimeout(() => {
                goToNextImage()
                setIsAnimating(false)
            }, 1500)
        }, 5000)

        return () => clearInterval(timer)
    }, [images.length])

    const socialIcons: Record<string, React.ComponentType<{ className?: string }>> = {
        github: SiGithub,
        threads: SiThreads,
        linkedin: SiGithub, // NOTE: LinkedIn icon 待實作
        twitter: SiGithub, // NOTE: Twitter icon 待實作
    }

    return (
        <section className="min-h-screen flex items-center pt-32 pb-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div className="space-y-8 text-center lg:text-left">
                        {data.eventBadge?.enabled && (
                            <a
                                href={data.eventBadge.link}
                                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-all cursor-pointer group"
                            >
                <span className="relative flex h-2 w-2">
                  <span
                      className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary"></span>
                </span>
                                <span className="text-sm text-primary font-medium">
                  {data.eventBadge.text}
                </span>
                                <ArrowRight
                                    className="h-3.5 w-3.5 text-primary/80 group-hover:translate-x-1 transition-transform"/>
                            </a>
                        )}

                        <h1 className="text-5xl md:text-7xl font-bold text-dark-text tracking-tight leading-tight">
                            {data.mainHeading} <br/>
                            <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-secondary">
                {data.highlightedText}
              </span>{' '}
                            {data.trailingText}
                        </h1>

                        <p className="text-lg text-dark-text/70 max-w-xl leading-relaxed mx-auto lg:mx-0">
                            {data.description}
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                            {data.ctaButtons?.map((button, index) => (
                                <a
                                    key={index}
                                    href={button.link}
                                    className={
                                        button.variant === 'primary'
                                            ? 'inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-primary hover:bg-orange-700 transition-all shadow-lg hover:shadow-primary/40'
                                            : 'inline-flex items-center justify-center px-8 py-3 border border-border-light text-base font-medium rounded-lg text-dark-text hover:bg-black/5 transition-all'
                                    }
                                >
                                    {button.text}
                                    {button.variant === 'primary' && <ArrowRight className="ml-2 h-4 w-4"/>}
                                </a>
                            ))}
                        </div>

                        <div className="flex items-center gap-6 pt-4 justify-center lg:justify-start">
                            {data.socialLinks?.map((social, index) => {
                                const Icon = socialIcons[social.platform] || SiGithub
                                return (
                                    <a
                                        key={index}
                                        href={social.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-dark-text/50 hover:text-primary transition-colors"
                                    >
                                        <Icon className="h-6 w-6"/>
                                    </a>
                                )
                            })}
                        </div>
                    </div>

                    {images.length > 0 && (
                        <div className="relative hidden lg:block">
                            <div
                                className="relative z-10 w-full max-w-md mx-auto aspect-square rounded-2xl overflow-hidden shadow-2xl border-4 border-white bg-white">
                                {images.map((image, index) => (
                                    <img
                                        key={image.src}
                                        src={image.src}
                                        alt={image.alt}
                                        className={`absolute inset-0 w-full h-full object-cover ${
                                            index === currentImageIndex && isAnimating ? 'animate-ink-splash' : ''
                                        } ${index === currentImageIndex ? 'opacity-100' : 'opacity-0'}`}
                                    />
                                ))}
                            </div>
                            {data.uptimeBadge?.enabled && (
                                <div
                                    className="absolute -bottom-6 -right-6 z-20 bg-card border border-border-light p-4 rounded-xl shadow-lg flex items-center gap-4">
                                    <div className="bg-primary/10 p-2 rounded-full text-primary">
                                        <Cloud className="h-6 w-6"/>
                                    </div>
                                    <div>
                                        <p className="text-xs text-dark-text/60">Uptime</p>
                                        <p className="text-lg font-bold text-dark-text">{data.uptimeBadge.percentage}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </section>
    )
}
