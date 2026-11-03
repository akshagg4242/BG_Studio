import Navbar from './components/Navbar';
import Hero from './components/Hero';
import UploadSection from './components/UploadSection';
import HowItWorks from './components/HowItWorks';
import Features from './components/Features';
import FAQ from './components/FAQ';
import Footer from './components/Footer';
import { useBackgroundRemoval } from './hooks/useBackgroundRemoval';

function App() {
  const {
    uploadedFile,
    status,
    resultUrl,
    error,
    selectFile,
    processImage,
    reset,
    downloadResult,
  } = useBackgroundRemoval();

  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <UploadSection
        uploadedFile={uploadedFile}
        status={status}
        error={error}
        resultUrl={resultUrl}
        onFileSelect={selectFile}
        onProcess={processImage}
        onReset={reset}
        onDownload={downloadResult}
      />
      <HowItWorks />
      <Features />
      <FAQ />
      <Footer />
    </div>
  );
}

export default App;
