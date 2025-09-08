import Navigation from './components/Navigation';
import MithrilWhisper from './components/MithrilWhisper';
import LocalLMSuite from './components/LocalLMSuite';
import Footer from './components/Footer';
import './App.css';

function App() {
  return (
    <>
      <Navigation />
      
      {/* Split Hero Section */}
      <main className="flex-1 pt-20">
        <div className="min-h-[calc(100vh-5rem)] flex">
          {/* Left Half - Mithril Whisper */}
          <MithrilWhisper />
          
          {/* Divider */}
          <div className="w-px bg-gradient-to-b from-transparent via-gray-600 to-transparent hero-divider"></div>
          
          {/* Right Half - Local LM Suite */}
          <LocalLMSuite />
        </div>
      </main>

      <Footer />
    </>
  )
}

export default App
