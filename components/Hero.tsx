import React from 'react';
import { ArrowRight, Github, Linkedin, AtSign, Cloud, Calendar } from 'lucide-react';

const Hero: React.FC = () => {
  return (
    <section id="home" className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 -z-10 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] opacity-50 translate-x-1/2 -translate-y-1/4"></div>
      <div className="absolute bottom-0 left-0 -z-10 w-[600px] h-[600px] bg-secondary/20 rounded-full blur-[120px] opacity-30 -translate-x-1/2 translate-y-1/4"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <a href="#event" className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 hover:border-secondary/50 hover:bg-white/10 transition-all cursor-pointer group">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary"></span>
              </span>
              <span className="text-sm text-slate-300 font-medium group-hover:text-white transition-colors">
                <span className="text-secondary font-bold">Next Event:</span> K8s Workshop (Oct 20)
              </span>
              <ArrowRight className="h-3.5 w-3.5 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </a>
            
            <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight leading-tight">
              Architecting <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                High Availability
              </span> Cloud Systems.
            </h1>
            
            <p className="text-lg text-slate-400 max-w-xl leading-relaxed">
              I'm Steven (鄭棋文), a Senior Cloud Architect. I specialize in designing resilient cloud infrastructures, optimizing DevOps workflows, and mastering CI/CD pipelines to deliver speed and stability.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <a href="#blog" className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-primary hover:bg-blue-600 transition-all shadow-lg hover:shadow-primary/25">
                View My Blog
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
              <a href="#contact" className="inline-flex items-center justify-center px-6 py-3 border border-slate-700 text-base font-medium rounded-lg text-slate-300 hover:text-white hover:bg-white/5 transition-all">
                Contact Me
              </a>
            </div>

            <div className="flex items-center gap-6 pt-4">
              <a href="https://github.chiwencheng.com" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-white transition-colors"><Github className="h-6 w-6" /></a>
              <a href="https://cv.chiwencheng.com" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-white transition-colors"><Linkedin className="h-6 w-6" /></a>
              <a href="https://thread.chiwencheng.com" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-white transition-colors"><AtSign className="h-6 w-6" /></a>
            </div>
          </div>
          
          <div className="relative hidden lg:block">
            <div className="relative z-10 w-full max-w-md mx-auto aspect-square rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-card">
               {/* Placeholder for Profile Image */}
               <img 
                src="https://picsum.photos/800/800?grayscale" 
                alt="Steven Cheng Cloud Architect" 
                className="object-cover w-full h-full hover:scale-105 transition-transform duration-700"
               />
            </div>
            {/* Decorative Elements around image */}
            <div className="absolute -bottom-6 -right-6 z-20 bg-darker border border-white/10 p-4 rounded-xl shadow-xl flex items-center gap-4 animate-bounce-slow">
                <div className="bg-blue-500/20 p-2 rounded-full text-blue-500">
                    <Cloud className="h-6 w-6" />
                </div>
                <div>
                    <p className="text-xs text-slate-400">Uptime</p>
                    <p className="text-lg font-bold text-white">99.99%</p>
                </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;