import React from 'react';
import { Calendar } from 'lucide-react';
import { Experience as ExperienceType } from '../types';

const experiences: ExperienceType[] = [
  {
    id: '1',
    role: 'Senior Cloud Architect',
    company: 'Tech Giant Corp',
    period: '2021 - Present',
    description: [
      'Leading the cloud migration strategy for enterprise legacy systems to AWS.',
      'Designing multi-region active-active architectures achieving 99.99% availability.',
      'Established FinOps practices reducing monthly cloud spend by 25%.'
    ],
    technologies: ['AWS', 'Terraform', 'Kubernetes', 'Go']
  },
  {
    id: '2',
    role: 'DevOps Lead',
    company: 'FinTech Startup',
    period: '2018 - 2021',
    description: [
      'Built the entire CI/CD ecosystem from scratch using GitLab CI and ArgoCD.',
      'Managed a team of 5 DevOps engineers fostering a culture of automation.',
      'Implemented comprehensive observability using Prometheus, Grafana, and ELK.'
    ],
    technologies: ['GCP', 'Python', 'Docker', 'Ansible']
  },
  {
    id: '3',
    role: 'Infrastructure Engineer',
    company: 'Software Solutions Ltd',
    period: '2015 - 2018',
    description: [
      'Managed on-premise to cloud hybrid networking setup.',
      'Automated server provisioning reducing setup time from days to minutes.',
      'Responsible for database administration and disaster recovery planning.'
    ],
    technologies: ['Linux', 'Bash', 'MySQL', 'Jenkins']
  }
];

const Experience: React.FC = () => {
  return (
    <section id="experience" className="py-24 bg-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Professional Experience</h2>
          <div className="h-1 w-20 bg-primary rounded-full"></div>
        </div>

        <div className="relative border-l border-white/10 ml-3 md:ml-6 space-y-12">
          {experiences.map((exp) => (
            <div key={exp.id} className="relative pl-8 md:pl-12">
              <span className="absolute -left-[5px] top-2 h-3 w-3 rounded-full bg-primary ring-4 ring-dark"></span>
              
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white">{exp.role}</h3>
                  <p className="text-lg text-primary font-medium">{exp.company}</p>
                </div>
                <div className="flex items-center text-slate-400 text-sm mt-2 sm:mt-0 bg-white/5 px-3 py-1 rounded-full w-fit">
                  <Calendar className="h-4 w-4 mr-2" />
                  {exp.period}
                </div>
              </div>

              <div className="bg-card/50 p-6 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
                <ul className="space-y-3 mb-6">
                  {exp.description.map((item, idx) => (
                    <li key={idx} className="flex items-start text-slate-300 leading-relaxed">
                      <span className="mr-3 mt-2 h-1.5 w-1.5 bg-secondary rounded-full flex-shrink-0"></span>
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="flex flex-wrap gap-2">
                  {exp.technologies.map((tech) => (
                    <span key={tech} className="px-2.5 py-1 text-xs font-medium text-slate-400 bg-white/5 rounded-md border border-white/5">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Experience;