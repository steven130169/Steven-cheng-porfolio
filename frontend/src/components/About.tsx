/* eslint-disable react/no-unescaped-entities */
import React from 'react';
import { Cloud, GitBranch, Terminal, Shield } from 'lucide-react';

const About: React.FC = () => {
  const skills = [
    { name: "Cloud Architecture", icon: <Cloud className="h-6 w-6 text-primary" />, items: ["AWS", "Azure", "GCP", "Hybrid Cloud", "Serverless"] },
    { name: "DevOps & IaC", icon: <Terminal className="h-6 w-6 text-primary" />, items: ["Terraform", "Ansible", "Kubernetes", "Docker", "Helm"] },
    { name: "CI / CD", icon: <GitBranch className="h-6 w-6 text-primary" />, items: ["Jenkins", "GitLab CI", "GitHub Actions", "ArgoCD", "CircleCI"] },
    { name: "Security & Ops", icon: <Shield className="h-6 w-6 text-primary" />, items: ["IAM Policies", "Prometheus", "Grafana", "ELK Stack", "DevSecOps"] }
  ];

  return (
    <section id="about" className="py-24 bg-light-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-dark-text mb-4">About Me</h2>
          <div className="h-1 w-20 bg-primary mx-auto rounded-full"></div>
          <p className="mt-4 text-dark-text/70 max-w-2xl mx-auto">
            I architect scalable, secure, and cost-effective cloud solutions. My obsession is automating the boring stuff so teams can focus on innovation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {skills.map((skill) => (
            <div key={skill.name} className="bg-card p-6 rounded-2xl border border-border-light shadow-sm hover:shadow-lg hover:border-primary/30 transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                {skill.icon}
              </div>
              <h3 className="text-xl font-semibold text-dark-text mb-4">{skill.name}</h3>
              <ul className="space-y-2">
                {skill.items.map((item) => (
                  <li key={item} className="flex items-center text-dark-text/70 text-sm">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full mr-2"></span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-20 bg-white rounded-3xl p-8 md:p-12 border border-border-light relative overflow-hidden shadow-md">
             <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
                 <div>
                     <h3 className="text-2xl font-bold text-dark-text mb-4">Why work with me?</h3>
                     <p className="text-dark-text/70 mb-6 leading-relaxed">
                         I don't just provision servers; I build resilience. With a deep focus on <strong>High Availability</strong> and <strong>Disaster Recovery</strong>, I ensure your business stays online no matter what.
                     </p>
                     <p className="text-dark-text/70 leading-relaxed">
                         I am passionate about <span className="text-primary font-medium">DevOps culture</span>. I believe in empowering development teams with self-service infrastructure and automated pipelines (CI/CD) that remove bottlenecks and accelerate deployment velocity.
                     </p>
                 </div>
                 <div className="bg-light-background p-6 rounded-xl border border-border-light">
                    <code className="text-sm font-mono text-dark-text/70">
                        <span className="text-purple-600">resource</span> <span className="text-green-600">"cloud_architect"</span> <span className="text-orange-500">"steven"</span> <span className="text-orange-500">{"{"}</span><br/>
                        &nbsp;&nbsp;name&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;= <span className="text-green-600">"Steven Cheng"</span><br/>
                        &nbsp;&nbsp;specialty&nbsp;&nbsp;= <span className="text-green-600">"High Availability"</span><br/>
                        &nbsp;&nbsp;tools&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;= [<span className="text-green-600">"Terraform"</span>, <span className="text-green-600">"K8s"</span>]<br/>
                        <br/>
                        &nbsp;&nbsp;<span className="text-purple-600">provisioner</span> <span className="text-green-600">"local-exec"</span> <span className="text-orange-500">{"{"}</span><br/>
                        &nbsp;&nbsp;&nbsp;&nbsp;command = <span className="text-green-600">"optimize_pipelines.sh"</span><br/>
                        &nbsp;&nbsp;<span className="text-orange-500">{"}"}</span><br/>
                        <span className="text-orange-500">{"}"}</span>
                    </code>
                 </div>
             </div>
        </div>
      </div>
    </section>
  );
};

export default About;