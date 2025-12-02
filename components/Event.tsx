import React, { useState } from 'react';
import { Users, Calendar, ArrowRight, Plus, X } from 'lucide-react';
import { EventItem } from '../types';

const initialEvents: EventItem[] = [
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
  },
  {
    id: '4',
    title: 'Kubernetes Advanced Networking',
    role: 'Speaker',
    description: 'Exploring Calico and Cilium advanced features.',
    date: 'Nov 2023',
    tags: ['K8s', 'Networking'],
    status: 'Past'
  },
  {
    id: '5',
    title: 'Serverless Security Workshop',
    role: 'Host',
    description: 'Securing AWS Lambda and API Gateway.',
    date: 'Dec 2023',
    tags: ['AWS', 'Serverless', 'Security'],
    status: 'Past'
  }
];

const Event: React.FC = () => {
  const [events, setEvents] = useState<EventItem[]>(initialEvents);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    role: '',
    date: '',
    description: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const eventToAdd: EventItem = {
      id: Date.now().toString(),
      title: newEvent.title,
      role: newEvent.role,
      description: newEvent.description,
      date: newEvent.date,
      tags: ['New'], // Default tag
      status: 'Upcoming' // Default status
    };
    setEvents([eventToAdd, ...events]);
    setIsFormOpen(false);
    setNewEvent({ title: '', role: '', date: '', description: '' });
  };

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
          
          <div className="flex gap-4">
             <button 
                onClick={() => setIsFormOpen(true)}
                className="flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-orange-700 transition-colors shadow-md"
             >
                <Plus className="h-4 w-4 mr-2" /> Add Event
             </button>
             <a href="#" className="flex items-center text-secondary hover:text-orange-500 transition-colors font-medium group">
                Join our next meetup <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
             </a>
          </div>
        </div>

        {isFormOpen && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-2xl font-bold text-dark-text">Add New Event</h3>
                        <button onClick={() => setIsFormOpen(false)} className="text-dark-text/50 hover:text-dark-text">
                            <X className="h-6 w-6" />
                        </button>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-dark-text mb-1">Title</label>
                            <input 
                                id="title"
                                type="text" 
                                required
                                className="w-full px-4 py-2 border border-border-light rounded-lg focus:ring-2 focus:ring-primary/50 outline-none"
                                value={newEvent.title}
                                onChange={e => setNewEvent({...newEvent, title: e.target.value})}
                            />
                        </div>
                        <div>
                            <label htmlFor="role" className="block text-sm font-medium text-dark-text mb-1">Role</label>
                            <input 
                                id="role"
                                type="text" 
                                required
                                className="w-full px-4 py-2 border border-border-light rounded-lg focus:ring-2 focus:ring-primary/50 outline-none"
                                value={newEvent.role}
                                onChange={e => setNewEvent({...newEvent, role: e.target.value})}
                            />
                        </div>
                        <div>
                            <label htmlFor="date" className="block text-sm font-medium text-dark-text mb-1">Date</label>
                            <input 
                                id="date"
                                type="text" 
                                required
                                placeholder="e.g., Oct 2025"
                                className="w-full px-4 py-2 border border-border-light rounded-lg focus:ring-2 focus:ring-primary/50 outline-none"
                                value={newEvent.date}
                                onChange={e => setNewEvent({...newEvent, date: e.target.value})}
                            />
                        </div>
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-dark-text mb-1">Description</label>
                            <textarea 
                                id="description"
                                required
                                rows={3}
                                className="w-full px-4 py-2 border border-border-light rounded-lg focus:ring-2 focus:ring-primary/50 outline-none"
                                value={newEvent.description}
                                onChange={e => setNewEvent({...newEvent, description: e.target.value})}
                            />
                        </div>
                        <button type="submit" className="w-full py-3 bg-primary text-white font-bold rounded-lg hover:bg-orange-700 transition-colors">
                            Save Event
                        </button>
                    </form>
                </div>
            </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.slice(0, 3).map((event) => (
            <div key={event.id} data-testid="event-item" className="group bg-card p-8 rounded-2xl border border-border-light shadow-sm hover:shadow-lg hover:border-secondary/50 transition-all duration-300 hover:-translate-y-1">
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
        {events.length > 3 && (
            <div className="text-center mt-12">
                <button className="px-6 py-3 bg-gray-100 text-dark-text font-medium rounded-lg hover:bg-gray-200 transition-colors">
                    View All Events
                </button>
            </div>
        )}
      </div>
    </section>
  );
};

export default Event;
