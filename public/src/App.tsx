import { Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { ScrollToTop } from './components/ScrollToTop';
import { Home } from './views/Home';
import { About } from './views/About';
import { Services } from './views/Services';
import { Announcements } from './views/Announcements';


function App() {
  return (
    <>
      <ScrollToTop />
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/announcements" element={<Announcements />} />
        </Routes>
      </main>
    </>
  );
}

export default App;
