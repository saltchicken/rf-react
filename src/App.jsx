import { useEffect, useRef } from 'react';
import { startFFTPlot } from './fftPlot';

function App() {
  const chartRef = useRef();

  useEffect(() => {
    if (chartRef.current) {
      startFFTPlot(chartRef.current);
    }
  }, []);

  return (
    <div style={{ margin: 0, background: '#111', color: '#ccc', height: '100vh', width: '100vw' }}>
      <div ref={chartRef} style={{ height: '100%', width: '100%' }} />
    </div>
  );
}

export default App;
