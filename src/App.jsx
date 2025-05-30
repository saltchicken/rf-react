import { useEffect, useRef } from 'react';
import { startFFTPlot } from './fftPlot';
import { startWaterfallPlot } from './waterfallPlot';
import ClickButton from './components/ClickButton';

function App() {
  const chartRef = useRef();
  const chartRef2 = useRef();

  useEffect(() => {
    if (chartRef.current) {
      startWaterfallPlot(chartRef.current, "ws://localhost:8766");
    }
    if (chartRef2.current) {
      startFFTPlot(chartRef2.current, "ws://localhost:8766");
    }
  }, []);

  return (
    <div>
    <div style={{ margin: 0, background: '#111', color: '#ccc', height: '75vh', width: '100vw' }}>
      <div ref={chartRef2} style={{ height: '100%', width: '100%' }} />
    </div>
    <div style={{ margin: 0, background: '#111', color: '#ccc', height: '25vh', width: '100vw' }}>
      <div ref={chartRef} style={{ height: '100%', width: '100%' }} />
    </div>
    <ClickButton />
    </div>
  );
}

export default App;
