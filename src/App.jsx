import { useEffect, useRef } from 'react';
import { startFFTPlot } from './fftPlot';
import ClickButton from './components/ClickButton';

function App() {
  const chartRef = useRef();

  useEffect(() => {
    if (chartRef.current) {
      startFFTPlot(chartRef.current);
    }
  }, []);

  return (
    <div>
    <div style={{ margin: 0, background: '#111', color: '#ccc', height: '90vh', width: '100vw' }}>
      <div ref={chartRef} style={{ height: '100%', width: '100%' }} />
    </div>
    <ClickButton />
    </div>
  );
}

export default App;
