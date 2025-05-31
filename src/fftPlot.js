
import Plotly from 'https://cdn.jsdelivr.net/npm/plotly.js-dist-min@2.26.0/+esm';

export function startFFTPlot(containerFFT, containerWaterfall, websocketUrl = "ws://localhost:8765") {
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
    timeLabels.push(i + 1);
  }


  const FFTLayout = {
    margin: { l: 50, r: 50, t: 50, b: 0 },
    title: { text: 'Real-Time FFT', font: { color: '#ccc' } },
    plot_bgcolor: '#1e1e1e',
    paper_bgcolor: '#1e1e1e',
    xaxis: { showticklabels: false, nticks: 10, color: '#ccc', gridcolor: '#222' },
    yaxis: { title: 'Magnitude', range: [0, 100], autorange: false, color: '#ccc', gridcolor: '#222' }
  };

  let WaterfallLayout = {
    // title: 'Real-time FFT Heatmap',
    margin: { l: 50, r: 50, t: 0, b: 50 },
    plot_bgcolor: '#1e1e1e',
    paper_bgcolor: '#1e1e1e',
    xaxis: { title: 'Freq bins', nticks: 20 },
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
    x: freqs,
    type: 'heatmap',
    colorscale: 'Viridis',
    zmin: 0,
    zmax: 30,
    showscale: false,
  }];

  Plotly.newPlot(containerFFT, FFTData, FFTLayout, { responsive: true, staticPlot: true });
  Plotly.newPlot(containerWaterfall, WaterfallData, WaterfallLayout, { responsive: true });




  let isDragging = false;

  // Create vertical line shape at a given x position
  function createVerticalLine(xData) {
    return {
      type: 'line',
      x0: xData,
      x1: xData,
      y0: 0,
      y1: 1,
      yref: 'paper',
      line: {
        color: 'red',
        width: 2,
        dash: 'line'
      }
    };
  }

  // Convert mouse x pixel to data coordinate
  function getXDataFromMouse(event) {
    const bb = containerFFT.getBoundingClientRect();
    const xPixel = event.clientX - bb.left;
    const xaxis = containerFFT._fullLayout.xaxis;
    return xaxis.p2l(xPixel - xaxis._offset);
  }

  // Mouse down: start dragging
  containerFFT.addEventListener('mousedown', function (event) {
    const xData = getXDataFromMouse(event);
    Plotly.relayout(containerFFT, { shapes: [createVerticalLine(xData)] });
    isDragging = true;
  });

  // Mouse move: update line if dragging and within bounds
  containerFFT.addEventListener('mousemove', function (event) {
    if (!isDragging) return;

    const xaxis = containerFFT._fullLayout.xaxis;
    const yaxis = containerFFT._fullLayout.yaxis;
    const mouseX = event.clientX;
    const mouseY = event.clientY;

    const bbox = containerFFT.getBoundingClientRect();

    const plotLeft = bbox.left + xaxis._offset;
    const plotRight = plotLeft + xaxis._length;
    const plotTop = bbox.top + yaxis._offset;
    const plotBottom = plotTop + yaxis._length;

    if (
      mouseX < plotLeft ||
      mouseX > plotRight ||
      mouseY < plotTop ||
      mouseY > plotBottom
    ) {
      return; // Don't update if outside plot area
    }

    const xData = getXDataFromMouse(event);
    Plotly.relayout(containerFFT, { shapes: [createVerticalLine(xData)] });
  });

  // Mouse up: stop dragging
  containerFFT.addEventListener('mouseup', function () {
    isDragging = false;
  });

  // Optional: stop dragging if mouse leaves container
  containerFFT.addEventListener('mouseleave', function () {
    isDragging = false;
  });






  const ws = new WebSocket(websocketUrl);
  ws.binaryType = "arraybuffer";

  ws.onmessage = (event) => {
    if (typeof event.data === "string") {
      const json = JSON.parse(event.data);
      if (json.type === "init") {
        freqs = Array.from(new Float32Array(json.data));
      }
    } else if (event.data instanceof ArrayBuffer) {
      mags = Array.from(new Float32Array(event.data));
      fftData.push(mags);

      if (fftData.length > MAX_TIME_SLICES) {
        fftData.shift();
      }
      Plotly.update(containerFFT, { x: [freqs], y: [mags] });
      Plotly.update(containerWaterfall, { x: [freqs], z: [fftData] });
    }
  };

  ws.onopen = () => {
    ws.send(JSON.stringify({ type: "init", data: "plotly" }));
  };
}

