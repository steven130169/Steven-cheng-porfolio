import React from 'react';
import { ExternalLink, Github, Server } from 'lucide-react';
import { Project } from '../types';

const projects: Project[] = [
  {
    id: '1',
    title: 'Global Multi-Region Mesh',
    description: 'Architected a highly available Kubernetes federation spanning 3 AWS regions for a fintech platform. Achieved 99.999% uptime and sub-50ms latency for global users using Istio service mesh.',
    tags: ['AWS EKS', 'Istio', 'Terraform', 'High Availability'],
    imageUrl: 'https://picsum.photos/600/400?grayscale',
    link: '#',
    github: '#'
  },
  {
    id: '2',
    title: 'Enterprise CI/CD Transformation',
    description: 'Optimized deployment workflows for a team of 50+ engineers. Migrated from legacy Jenkins to a scalable GitLab CI architecture with dynamic runners on spot instances, reducing costs by 40%.',
    tags: ['GitLab CI', 'Docker', 'AWS Spot', 'Python'],
    imageUrl: 'https://picsum.photos/600/401?grayscale',
    link: '#',
    github: '#'
  },
  {
    id: '3',
    title: 'Serverless Data Ingestion',
    description: 'Built a serverless event-driven data pipeline processing 10TB+ daily logs. Utilized AWS Lambda, Kinesis, and S3 to provide real-time analytics dashboards for operations teams.',
    tags: ['AWS Lambda', 'Serverless', 'Golang', 'Kinesis'],
    imageUrl: 'https://picsum.photos/600/402?grayscale',
    link: '#',
    github: '#'
  }
];

const Projects: React.FC = () => {
  return (
    <section id="projects" className="py-24 bg-darker">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-4">
            <div>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Key Projects</h2>
                <div className="h-1 w-20 bg-primary rounded-full mb-4"></div>
                <p className="text-slate-400">Architecture and infrastructure solutions delivered.</p>
            </div>
            <a href="#" className="flex items-center text-primary hover:text-blue-400 transition-colors font-medium">
                View GitHub <Github className="ml-2 h-4 w-4" />
            </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project) => (
            <div key={project.id} className="group bg-card rounded-2xl overflow-hidden border border-white/5 hover:border-primary/50 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/10">
              <div className="relative h-48 overflow-hidden">
                <img 
                    src={project.imageUrl} 
                    alt={project.title} 
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-darker to-transparent opacity-60"></div>
                <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-md p-2 rounded-full border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Server className="h-4 w-4 text-green-400" />
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-primary transition-colors">{project.title}</h3>
                <p className="text-slate-400 text-sm mb-4 line-clamp-4">
                  {project.description}
                </p>
                
                <div className="flex flex-wrap gap-2 mb-6">
                  {project.tags.map(tag => (
                    <span key={tag} className="px-3 py-1 text-xs font-medium text-blue-300 bg-blue-500/10 rounded-full border border-blue-500/20">
                      {tag}
                    </span>
                  ))}
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <a href={project.github} className="flex items-center text-slate-400 hover:text-white text-sm font-medium transition-colors">
                    <Github className="h-4 w-4 mr-2" /> Repo
                  </a>
                  <a href={project.link} className="flex items-center text-primary hover:text-blue-400 text-sm font-medium transition-colors">
                    Case Study <ExternalLink className="h-4 w-4 ml-2" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Projects;