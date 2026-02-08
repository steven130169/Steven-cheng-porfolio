import {render, screen} from '@testing-library/react';
import {describe, it, expect} from 'vitest';
import {HeroClient} from './HeroClient';
import React from 'react';
import type {HeroData} from '@/lib/getHomepageData';

// Mock data
const mockHeroData: HeroData = {
    eventBadge: {
        text: 'Next Event: K8s Workshop (Oct 20)',
        link: '#event',
        enabled: true,
    },
    mainHeading: 'Architecting',
    highlightedText: 'High Availability',
    trailingText: 'Cloud Systems.',
    description:
        "I'm Steven (鄭棋文), a Senior Cloud Architect. I specialize in designing resilient cloud infrastructures.",
    ctaButtons: [
        {text: 'View My Blog', link: '#blog', variant: 'primary'},
        {text: 'Contact Me', link: '#contact', variant: 'secondary'},
    ],
    socialLinks: [
        {platform: 'github', url: 'https://github.chiwencheng.com'},
        {platform: 'threads', url: 'https://thread.chiwencheng.com'},
    ],
    carouselImages: [
        {src: '/images/ddd.webp', alt: 'Conference 1'},
        {src: '/images/2023DevOpsDays-1.webp', alt: 'Conference 2'},
    ],
    uptimeBadge: {
        enabled: true,
        percentage: '99.99%',
    },
};

describe('HeroClient', () => {
    it('renders hero heading correctly', () => {
        render(<HeroClient data={mockHeroData}/>);

        expect(screen.getByRole('heading', {level: 1})).toHaveTextContent('Architecting');
        expect(screen.getByRole('heading', {level: 1})).toHaveTextContent('High Availability');
        expect(screen.getByRole('heading', {level: 1})).toHaveTextContent('Cloud Systems.');
    });

    it('renders event badge when enabled', () => {
        render(<HeroClient data={mockHeroData}/>);

        expect(screen.getByText('Next Event: K8s Workshop (Oct 20)')).toBeInTheDocument();
    });

    it('does not render event badge when disabled', () => {
        const dataWithoutBadge: HeroData = {
            ...mockHeroData,
            eventBadge: {
                ...mockHeroData.eventBadge!,
                enabled: false,
            },
        };

        render(<HeroClient data={dataWithoutBadge}/>);

        expect(screen.queryByText('Next Event: K8s Workshop (Oct 20)')).not.toBeInTheDocument();
    });

    it('renders CTA buttons', () => {
        render(<HeroClient data={mockHeroData}/>);

        expect(screen.getByText('View My Blog')).toBeInTheDocument();
        expect(screen.getByText('Contact Me')).toBeInTheDocument();
    });
});
