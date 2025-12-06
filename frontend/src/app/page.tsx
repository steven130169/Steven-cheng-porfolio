import Hero from "../components/Hero";
import About from "../components/About";
import Blog from "../components/Blog";
import Event from "../components/Event";
import Speak from "../components/Speak";

export default function Home() {
  return (
    <main id="home">
      <Hero />
      <About />
      <Blog />
      <Event />
      <Speak />
    </main>
  );
}