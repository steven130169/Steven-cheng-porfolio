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
  role: 'Organizer' | 'Host' | 'Instructor' | 'Speaker';
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
