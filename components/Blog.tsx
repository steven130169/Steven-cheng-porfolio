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
    imageUrl: "https://picsum.photos/800/600?grayscale"
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
  },
