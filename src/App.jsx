import { useEffect, useRef } from 'react';
import { startFFTPlot } from './fftPlot';
import { startWaterfallPlot } from './waterfallPlot';
import ClickButton from './components/ClickButton';
import { startFFTWaterfallPlot } from './fft_and_waterfall';

function App() {
  const chartRef = useRef();
  const chartRef2 = useRef();

  useEffect(() => {
    if (chartRef.current && chartRef2.current) {
      startFFTWaterfallPlot(chartRef.current, chartRef2.current, "ws://localhost:8767");
    }
    // if (chartRef2.current) {
    //   startFFTPlot(chartRef2.current, "ws://localhost:8766");
    // }
  }, []);

  return (
    <div>
    <div style={{ margin: 0, background: '#111', color: '#ccc', height: '70vh', width: '100vw' }}>
      <div ref={chartRef} style={{ height: '100%', width: '100%' }} />
    </div>
    <div style={{ margin: 0, background: '#111', color: '#ccc', height: '20vh', width: '100vw' }}>
      <div ref={chartRef2} style={{ height: '100%', width: '100%' }} />
    </div>
      <div style={{ margin: 0, background: '#111', color: '#ccc', height: '10vh', width: '100vw' }}>
    <ClickButton />
    </div>
    </div>
  );
}

export default App;
