import React from 'react';
import { ArrowRight, BookOpen, Clock, Mail } from 'lucide-react';
import { BlogPost } from '../types';

const posts: BlogPost[] = [
  {
    id: '1',
    title: "Understanding Kubernetes Networking: A Deep Dive",
    excerpt: "Exploring the intricacies of CNI plugins, Service meshes, and how packet flow works in a k8s cluster. This guide covers everything from Pod-to-Pod communication to advanced Ingress controllers.",
    date: "Oct 12, 2023",
    readTime: "8 min read",
    tags: ["Kubernetes", "Networking"],
    category: "Featured",
    imageUrl: "https://picsum.photos/seed/k8s/800/600?grayscale"
  },
  {
    id: '2',
    title: "Terraform State Management Strategies",
    excerpt: "Best practices for handling remote state, locking, and team collaboration in large-scale infrastructure projects.",
    date: "Sep 28, 2023",
    readTime: "6 min read",
    tags: ["Terraform", "DevOps"],
    category: "DevOps"
  },
  {
    id: '3',
    title: "Migrating from Jenkins to GitHub Actions",
    excerpt: "A case study on reducing maintenance overhead and improving developer experience with modern CI/CD.",
    date: "Aug 15, 2023",
    readTime: "5 min read",
    tags: ["CI/CD", "Automation"],
    category: "CI/CD"
  }
];

const Blog: React.FC = () => {
  const featuredPost = posts[0];
  const recentPosts = posts.slice(1);

  return (
    <section id="blog" className="py-24 bg-darker">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Tech Insights</h2>
            <div className="h-1 w-20 bg-primary rounded-full mb-4"></div>
            <p className="text-slate-400 max-w-2xl">
              Deep dives into Cloud Architecture, DevOps patterns, and Engineering culture.
            </p>
          </div>
          <a href="#" className="flex items-center text-primary hover:text-blue-400 transition-colors font-medium group">
            View all articles <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </a>
        </div>

        {/* Magazine Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-20">
          
          {/* Featured Post (Left 2/3) */}
          <div className="lg:col-span-2 group cursor-pointer">
            <div className="relative h-[400px] rounded-2xl overflow-hidden mb-6 border border-white/5 group-hover:border-primary/50 transition-all">
              <img 
                src={featuredPost.imageUrl} 
                alt={featuredPost.title} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute top-4 left-4">
                <span className="px-3 py-1 bg-primary text-white text-xs font-bold uppercase tracking-wider rounded-full">
                  {featuredPost.category}
                </span>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-darker via-darker/50 to-transparent"></div>
              <div className="absolute bottom-0 left-0 p-8">
                 <div className="flex items-center text-slate-300 text-sm mb-3 space-x-4">
                    <span className="flex items-center"><Clock className="h-4 w-4 mr-1.5" /> {featuredPost.readTime}</span>
                    <span>{featuredPost.date}</span>
                 </div>
                 <h3 className="text-3xl font-bold text-white mb-3 group-hover:text-primary transition-colors">
                   {featuredPost.title}
                 </h3>
                 <p className="text-slate-300 line-clamp-2 max-w-2xl">
                   {featuredPost.excerpt}
                 </p>
              </div>
            </div>
          </div>

          {/* Recent Posts List (Right 1/3) */}
          <div className="lg:col-span-1 space-y-6">
             <h3 className="text-lg font-bold text-white border-b border-white/10 pb-2">Recent Posts</h3>
             {recentPosts.map(post => (
               <div key={post.id} className="group cursor-pointer bg-card p-5 rounded-xl border border-white/5 hover:border-white/20 transition-all">
                 <div className="flex items-center justify-between mb-2">
                   <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded">
                     {post.category}
                   </span>
                   <span className="text-xs text-slate-500">{post.date}</span>
                 </div>
                 <h4 className="text-lg font-bold text-white mb-2 group-hover:text-primary transition-colors line-clamp-2">
                   {post.title}
                 </h4>
                 <p className="text-slate-400 text-sm line-clamp-2 mb-3">
                   {post.excerpt}
                 </p>
                 <div className="flex items-center text-xs text-slate-500">
                    <Clock className="h-3 w-3 mr-1" /> {post.readTime}
                 </div>
               </div>
             ))}
          </div>
        </div>

        {/* Newsletter Subscription */}
        <div className="relative rounded-3xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-900/40 to-purple-900/40 blur-xl"></div>
            <div className="relative bg-card/30 backdrop-blur-sm border border-white/10 rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center gap-8">
                <div className="flex-1 text-center md:text-left">
                    <div className="inline-flex items-center justify-center p-3 bg-white/5 rounded-full mb-4">
                        <Mail className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">Join the Lab</h3>
                    <p className="text-slate-400 max-w-md">
                        Get weekly insights on High Availability, DevOps culture, and infrastructure patterns directly to your inbox.
                    </p>
                </div>
                <div className="w-full md:w-auto flex-1 max-w-md">
                    <form className="flex flex-col sm:flex-row gap-3">
                        <input 
                            type="email" 
                            placeholder="Enter your email" 
                            className="flex-1 bg-darker/50 border border-white/10 text-white placeholder-slate-500 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                        />
                        <button className="px-6 py-3 bg-primary hover:bg-blue-600 text-white font-medium rounded-lg transition-colors whitespace-nowrap shadow-lg shadow-primary/20">
                            Subscribe
                        </button>
                    </form>
                    <p className="text-xs text-slate-500 mt-3 text-center md:text-left">
                        No spam, unsubscribe anytime. Join 500+ engineers.
                    </p>
                </div>
            </div>
        </div>

      </div>
    </section>
  );
};

export default Blog;