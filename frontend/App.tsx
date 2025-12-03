import React from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Blog from './components/Blog';
import Event from './components/Event';
import Speak from './components/Speak';
import Footer from './components/Footer';

const App: React.FC = () => {
  return (
    <div>
      <Navbar />
      <main id="home">
        <Hero />
        <About />
        <Blog />
        <Event />
        <Speak />
      </main>
      <Footer />
    </div>
  );
};

export default App;
