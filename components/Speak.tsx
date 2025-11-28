import React from 'react';
import { Mic, MapPin, ExternalLink } from 'lucide-react';
import { SpeakingEngagement } from '../types';

const talks: SpeakingEngagement[] = [
  {
    id: '1',
    event: 'DevOpsDays Taipei 2023',
    title: 'Scaling Kubernetes Federation to 10M Users',
    date: 'Sep 2023',
    location: 'Taipei, Taiwan',
    type: 'Conference'
  },
  {
    id: '2',
    event: 'AWS Community Day',
    title: 'Serverless Patterns for High Availability',
    date: 'Jun 2023',
    location: 'Taichung, Taiwan',
    type: 'Conference'
  },
  {
    id: '3',
    event: 'Cloud Native Podcast',
    title: 'Ep. 42: The Future of Platform Engineering',
    date: 'Apr 2023',
    location: 'Online',
    type: 'Podcast'
  },
  {
    id: '4',
    event: 'Modern Web Conference',
    title: 'From Monolith to Microservices: A Survival Guide',
    date: 'Dec 2022',
    location: 'Taipei, Taiwan',
    type: 'Conference'
  }
];

const Speak: React.FC = () => {
  return (
    <section id="speak" className="py-24 bg-darker relative overflow-hidden">
        {/* Background Accent */}
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
        
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-6">
            <Mic className="h-6 w-6 text-primary" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Public Speaking</h2>
          <p className="text-slate-400">Sharing knowledge and experiences at conferences and meetups.</p>
        </div>

        <div className="space-y-6">
          {talks.map((talk) => (
            <div key={talk.id} className="group bg-card hover:bg-white/5 rounded-xl p-6 border border-white/5 hover:border-primary/30 transition-all duration-300 flex flex-col sm:flex-row gap-6 items-start sm:items-center">
              <div className="flex-shrink-0 w-16 h-16 bg-darker rounded-lg flex flex-col items-center justify-center border border-white/10 text-center">
                <span className="text-xs text-slate-500 uppercase font-bold">{talk.date.split(' ')[0]}</span>
                <span className="text-lg font-bold text-white">{talk.date.split(' ')[1]}</span>
              </div>
              
              <div className="flex-grow">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-1">
                    <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors">{talk.title}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded border ${
                        talk.type === 'Conference' ? 'border-purple-500/30 text-purple-400 bg-purple-500/10' :
                        talk.type === 'Podcast' ? 'border-orange-500/30 text-orange-400 bg-orange-500/10' :
                        'border-blue-500/30 text-blue-400 bg-blue-500/10'
                    }`}>
                        {talk.type}
                    </span>
                </div>
                <p className="text-slate-300 font-medium mb-2">{talk.event}</p>
                <div className="flex items-center text-slate-500 text-sm">
                  <MapPin className="h-3.5 w-3.5 mr-1.5" />
                  {talk.location}
                </div>
              </div>

              <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-4 group-hover:translate-x-0 duration-300">
                  <a href="#" className="p-2 text-slate-400 hover:text-white transition-colors">
                      <ExternalLink className="h-5 w-5" />
                  </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Speak;