import React from 'react';

export interface Project {
  id: string;
  title: string;
  description: string;
  tags: string[];
  imageUrl: string;
  link?: string;
  github?: string;
}

export interface Experience {
  id: string;
  company: string;
  role: string;
  period: string;
  description: string[];
  technologies: string[];
}

export interface SpeakingEngagement {
  id: string;
  event: string;
  title: string;
  date: string;
  location: string;
  type: 'Conference' | 'Meetup' | 'Podcast';
}

export interface EventItem {
  id: string;
  title: string;
  role: 'Organizer' | 'Host' | 'Instructor';
  description: string;
  date: string;
  tags: string[];
  status: 'Upcoming' | 'Past';
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  tags: string[];
  imageUrl?: string;
  category?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  isError?: boolean;
}

export interface SocialLink {
  platform: string;
  url: string;
  icon: React.ReactNode;
}