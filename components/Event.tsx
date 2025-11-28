import React from 'react';
import { Users, Calendar, ArrowRight } from 'lucide-react';
import { EventItem } from '../types';

const events: EventItem[] = [
  {
    id: '1',
    title: 'Cloud Native Taiwan Study Group',
    role: 'Organizer',
    description: 'Monthly meetups discussing the latest in CNCF landscape, Kubernetes patterns, and service mesh technologies.',
    date: 'Monthly',
    tags: ['Community', 'K8s', 'CNCF'],
    status: 'Upcoming'
  },
  {
    id: '2',
    title: 'DevOps Hands-on Workshop',
    role: 'Instructor',
    description: 'A full-day immersive workshop teaching practical CI/CD pipeline construction with GitLab and ArgoCD.',
    date: 'Oct 2023',
    tags: ['Workshop', 'CI/CD', 'GitOps'],
    status: 'Past'
  },
  {
    id: '3',
    title: 'Terraform Infrastructure as Code Bootcamp',
    role: 'Host',
    description: 'Guided 50+ participants through the fundamentals of modular infrastructure design using Terraform.',
    date: 'Aug 2023',
    tags: ['Training', 'IaC', 'Terraform'],
    status: 'Past'
  }
];

const Event: React.FC = () => {
  return (
    <section id="event" className="py-24 bg-light-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-dark-text mb-4">Events & Community</h2>
            <div className="h-1 w-20 bg-secondary rounded-full mb-4"></div>
            <p className="text-dark-text/70 max-w-2xl">
              I believe in growing together. Here are the community events, study groups, and workshops I organize and host.
            </p>
          </div>
          <a href="#" className="flex items-center text-secondary hover:text-orange-500 transition-colors font-medium group">
            Join our next meetup <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map((event) => (
            <div key={event.id} className="group bg-card p-8 rounded-2xl border border-border-light shadow-sm hover:shadow-lg hover:border-secondary/50 transition-all duration-300 hover:-translate-y-1">
              <div className="flex justify-between items-start mb-6">
                <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  event.status === 'Upcoming' 
                    ? 'bg-secondary/10 text-secondary border border-secondary/20' 
                    : 'bg-stone-100 text-stone-500 border border-stone-200'
                }`}>
                  {event.status}
                </div>
                <div className="bg-black/5 p-2 rounded-lg">
                  <Users className="h-5 w-5 text-dark-text/60" />
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-dark-text mb-2 group-hover:text-secondary transition-colors">{event.title}</h3>
              <p className="text-sm text-primary font-medium mb-4">{event.role}</p>
              
              <p className="text-dark-text/70 mb-6 leading-relaxed text-sm h-20">
                {event.description}
              </p>
              
              <div className="flex items-center text-dark-text/50 text-sm mb-6 border-t border-border-light pt-4">
                <Calendar className="h-4 w-4 mr-2" />
                {event.date}
              </div>

              <div className="flex flex-wrap gap-2">
                {event.tags.map((tag) => (
                  <span key={tag} className="text-xs text-dark-text/60 bg-black/5 px-2 py-1 rounded">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Event;
