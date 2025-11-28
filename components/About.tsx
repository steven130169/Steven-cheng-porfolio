import React from 'react';
import { Cloud, GitBranch, Terminal, Shield } from 'lucide-react';

const About: React.FC = () => {
  const skills = [
    { name: "Cloud Architecture", icon: <Cloud className="h-6 w-6 text-blue-400" />, items: ["AWS", "Azure", "GCP", "Hybrid Cloud", "Serverless"] },
    { name: "DevOps & IaC", icon: <Terminal className="h-6 w-6 text-green-400" />, items: ["Terraform", "Ansible", "Kubernetes", "Docker", "Helm"] },
    { name: "CI / CD", icon: <GitBranch className="h-6 w-6 text-purple-400" />, items: ["Jenkins", "GitLab CI", "GitHub Actions", "ArgoCD", "CircleCI"] },
    { name: "Security & Ops", icon: <Shield className="h-6 w-6 text-orange-400" />, items: ["IAM Policies", "Prometheus", "Grafana", "ELK Stack", "DevSecOps"] }
  ];

  return (
    <section id="about" className="py-24 bg-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">About Me</h2>
          <div className="h-1 w-20 bg-primary mx-auto rounded-full"></div>
          <p className="mt-4 text-slate-400 max-w-2xl mx-auto">
            I architect scalable, secure, and cost-effective cloud solutions. My obsession is automating the boring stuff so teams can focus on innovation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {skills.map((skill) => (
            <div key={skill.name} className="bg-card p-6 rounded-2xl border border-white/5 hover:border-primary/50 transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mb-6">
                {skill.icon}
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">{skill.name}</h3>
              <ul className="space-y-2">
                {skill.items.map((item) => (
                  <li key={item} className="flex items-center text-slate-400 text-sm">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full mr-2"></span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-20 bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-3xl p-8 md:p-12 border border-white/10 relative overflow-hidden">
             <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
                 <div>
                     <h3 className="text-2xl font-bold text-white mb-4">Why work with me?</h3>
                     <p className="text-slate-400 mb-6 leading-relaxed">
                         I don't just provision servers; I build resilience. With a deep focus on <strong>High Availability</strong> and <strong>Disaster Recovery</strong>, I ensure your business stays online no matter what.
                     </p>
                     <p className="text-slate-400 leading-relaxed">
                         I am passionate about <span className="text-primary font-medium">DevOps culture</span>. I believe in empowering development teams with self-service infrastructure and automated pipelines (CI/CD) that remove bottlenecks and accelerate deployment velocity.
                     </p>
                 </div>
                 <div className="bg-darker/50 p-6 rounded-xl border border-white/10">
                    <code className="text-sm font-mono text-blue-300">
                        <span className="text-purple-400">resource</span> <span className="text-green-300">"cloud_architect"</span> <span className="text-yellow-300">"steven"</span> <span className="text-yellow-300">{"{"}</span><br/>
                        &nbsp;&nbsp;name&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;= <span className="text-green-300">"Steven Cheng"</span><br/>
                        &nbsp;&nbsp;specialty&nbsp;&nbsp;= <span className="text-green-300">"High Availability"</span><br/>
                        &nbsp;&nbsp;tools&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;= [<span className="text-green-300">"Terraform"</span>, <span className="text-green-300">"K8s"</span>]<br/>
                        <br/>
                        &nbsp;&nbsp;<span className="text-purple-400">provisioner</span> <span className="text-green-300">"local-exec"</span> <span className="text-yellow-300">{"{"}</span><br/>
                        &nbsp;&nbsp;&nbsp;&nbsp;command = <span className="text-green-300">"optimize_pipelines.sh"</span><br/>
                        &nbsp;&nbsp;<span className="text-yellow-300">{"}"}</span><br/>
                        <span className="text-yellow-300">{"}"}</span>
                    </code>
                 </div>
             </div>
        </div>
      </div>
    </section>
  );
};

export default About;