import React from 'react';
import { Mail, Github, Linkedin, Heart } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer id="contact" className="bg-darker border-t border-white/10 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
          <div>
            <h2 className="text-3xl font-bold text-white mb-6">Let's build something <br/> <span className="text-primary">amazing together.</span></h2>
            <p className="text-slate-400 max-w-md mb-8">
              I'm always open to discussing product design work or partnership opportunities.
            </p>
            <a 
                href="mailto:contact@steven.dev" 
                className="inline-flex items-center gap-2 text-xl font-semibold text-white hover:text-primary transition-colors"
            >
                <Mail className="h-6 w-6" />
                contact@steven.dev
            </a>
          </div>
          
          <div className="flex flex-col justify-end items-start md:items-end">
             <div className="flex gap-6 mb-8">
                 <a href="#" className="p-3 bg-white/5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-all"><Github className="h-6 w-6" /></a>
                 <a href="#" className="p-3 bg-white/5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-all"><Linkedin className="h-6 w-6" /></a>
             </div>
             <p className="text-slate-500 text-sm">
                 San Francisco, CA • Remote Friendly
             </p>
          </div>
        </div>
        
        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-600 text-sm">
                © {new Date().getFullYear()} Steven Cheng (鄭棋文). All rights reserved.
            </p>
            <p className="text-slate-600 text-sm flex items-center gap-1">
                Made with <Heart className="h-3 w-3 text-red-500 fill-current" /> using React, Tailwind & Gemini
            </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;