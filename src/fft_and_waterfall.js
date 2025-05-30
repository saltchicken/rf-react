
import Plotly from 'https://cdn.jsdelivr.net/npm/plotly.js-dist-min@2.26.0/+esm';

export function startFFTWaterfallPlot(containerFFT, containerWaterfall, websocketUrl = "ws://localhost:8765") {
  const N_FREQ_BINS = 1024;     // Number of frequency bins (FFT bins)
  const MAX_TIME_SLICES = 40; // Number of time slices visible at once

  let freqs = [];
  let mags = [];

  let fftData = [];
  for (let i = 0; i < MAX_TIME_SLICES; i++) {
    var blank = Array(N_FREQ_BINS).fill(0);
    fftData.push(blank);
  }

  let timeLabels = [];
  for (let i = 0; i < MAX_TIME_SLICES; i++) {
    timeLabels.push(i+1);
  }

  let freqLabels = [];
  for (let i = 0; i < N_FREQ_BINS; i++) {
    freqLabels.push(i+1);  // you can map to actual frequencies if you want
  }

  const FFTLayout = {
    margin: { l: 50, r: 50, t: 50, b: 0 },
    title: { text: 'Real-Time FFT', font: { color: '#ccc' } },
    plot_bgcolor: '#1e1e1e',
    paper_bgcolor: '#1e1e1e',
    xaxis: { showticklabels: false, color: '#ccc', gridcolor: '#222' },
    yaxis: { title: 'Magnitude', range: [0, 100], autorange: false, color: '#ccc', gridcolor: '#222' }
  };

  let WaterfallLayout = {
    // title: 'Real-time FFT Heatmap',
    margin: { l: 50, r: 50, t: 0, b: 50 },
    plot_bgcolor: '#1e1e1e',
    paper_bgcolor: '#1e1e1e',
    xaxis: { title: 'Freq bins' },
    yaxis: { title: 'Time (slices)' },
  };


  const FFTData = [{
    x: [],
    y: [],
    mode: 'lines',
    line: { color: 'cyan' },
    name: 'Magnitude'
  }];

  let WaterfallData = [{
    z: fftData,
    y: timeLabels,
    x: freqLabels,
    type: 'heatmap',
    colorscale: 'Viridis',
    zmin: 0,
    zmax: 30,
    showscale: false,
  }];

  Plotly.newPlot(containerFFT, FFTData, FFTLayout, { responsive: true });
  Plotly.newPlot(containerWaterfall, WaterfallData, WaterfallLayout, { responsive: true });

  const ws = new WebSocket(websocketUrl);
  ws.binaryType = "arraybuffer";

  ws.onmessage = (event) => {
    if (typeof event.data === "string") {
      const json = JSON.parse(event.data);
      if (json.type === "init") {
        freqs = Array.from(new Float32Array(json.data));
        freqLabels = Array.from(new Float32Array(json.data));
      }
    } else if (event.data instanceof ArrayBuffer) {
      mags = Array.from(new Float32Array(event.data));
      fftData.push(mags);

      if (fftData.length > MAX_TIME_SLICES) {
        fftData.shift();
      }
      Plotly.update(containerFFT, { x: [freqs], y: [mags] });
      Plotly.update(containerWaterfall, { x: [freqLabels], z: [fftData] });
    }
  };

  ws.onopen = () => {
    ws.send(JSON.stringify({ type: "init", data: "plotly" }));
  };
}

