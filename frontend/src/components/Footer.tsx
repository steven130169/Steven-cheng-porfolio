import React from 'react';
import {SiGithub, SiThreads} from '@icons-pack/react-simple-icons';
import {Heart, Mail} from 'lucide-react';

const Footer: React.FC = () => {
    return (
        <footer id="contact" className="bg-light-background border-t border-border-light pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
                    <div>
                        <h2 className="text-3xl font-bold text-dark-text mb-6">Let&apos;s build something <br/> <span
                            className="text-primary">amazing together.</span></h2>
                        <p className="text-dark-text/70 max-w-md mb-8">
                            I&apos;m always open to discussing product design work or partnership opportunities.
                        </p>
                        <a
                            href="mailto:steven@chiwencheng.com"
                            className="inline-flex items-center gap-2 text-xl font-semibold text-dark-text hover:text-primary transition-colors"
                        >
                            <Mail className="h-6 w-6"/>
                            steven@chiwencheng.com
                        </a>
                    </div>

                    <div className="flex flex-col justify-end items-start md:items-end">
                        <div className="flex gap-6 mb-8">
                            <a href="https://github.chiwencheng.com" target="_blank" rel="noopener noreferrer"
                               className="p-3 bg-black/5 rounded-full text-dark-text/60 hover:text-primary hover:bg-primary/10 transition-all"><SiGithub
                                className="h-6 w-6"/></a>
                            <a href="https://thread.chiwencheng.com" target="_blank" rel="noopener noreferrer"
                               className="p-3 bg-black/5 rounded-full text-dark-text/60 hover:text-primary hover:bg-primary/10 transition-all"><SiThreads
                                className="h-6 w-6"/></a>
                        </div>
                        <p className="text-dark-text/50 text-sm">
                            Taiwan Taipei • Remote Friendly
                        </p>
                    </div>
                </div>

                <div
                    className="border-t border-border-light pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-dark-text/50 text-sm">
                        © {new Date().getFullYear()} Steven Cheng (鄭棋文). All rights reserved.
                    </p>
                    <p className="text-dark-text/50 text-sm flex items-center gap-1">
                        Made with <Heart className="h-3 w-3 text-red-500 fill-current"/> using React, Tailwind & Gemini
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
