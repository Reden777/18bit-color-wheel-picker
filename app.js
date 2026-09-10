(() => {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const canvas = $('colorWheel');
  const ctx = canvas.getContext('2d', { alpha: true });
  const wrap = $('wheelWrap');
  const cursor = $('wheelCursor');
  const sliders = {
    r: $('redSlider'),
    g: $('greenSlider'),
    b: $('blueSlider'),
    v: $('valueSlider')
  };
  const state = { r: 52, g: 12, b: 12, h: 0, s: 0.769, v: 0.825 };

  function hsvToRgb(h, s, v) {
    const i = Math.floor(h * 6);
    const f = h * 6 - i;
    const p = v * (1 - s);
    const q = v * (1 - f * s);
    const t = v * (1 - (1 - f) * s);
    const choices = [[v,t,p], [q,v,p], [p,v,t], [p,q,v], [t,p,v], [v,p,q]];
    return choices[i % 6];
  }

  function rgbToHsv(r, g, b) {
    const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
    let h = 0;
    if (d) {
      if (max === r) h = ((g - b) / d) % 6;
      else if (max === g) h = (b - r) / d + 2;
      else h = (r - g) / d + 4;
      h /= 6;
      if (h < 0) h += 1;
    }
    return [h, max ? d / max : 0, max];
  }

  function drawWheel() {
    const size = canvas.width;
    const center = size / 2;
    const radius = size * 0.48;
    ctx.clearRect(0, 0, size, size);
    for (let angle = 0; angle < 360; angle += 1) {
      const start = (angle - 1.1) * Math.PI / 180;
      const end = (angle + 1.1) * Math.PI / 180;
      const hue = ((angle + 90) % 360) / 360;
      const gradient = ctx.createRadialGradient(center, center, 0, center, center, radius);
      const rgb = hsvToRgb(hue, 1, state.v);
      gradient.addColorStop(0, `rgb(${state.v*255},${state.v*255},${state.v*255})`);
      gradient.addColorStop(1, `rgb(${rgb[0]*255},${rgb[1]*255},${rgb[2]*255})`);
      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.arc(center, center, radius, start, end);
      ctx.closePath();
      ctx.fillStyle = gradient;
      ctx.fill();
    }
    ctx.save();
    ctx.globalCompositeOperation = 'destination-in';
    ctx.beginPath();
    ctx.arc(center, center, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function toHex(value) { return value.toString(16).padStart(2, '0').toUpperCase(); }
  function output8(value6) { return value6 * 4; }

  function render(source = 'rgb') {
    if (source === 'rgb') {
      [state.h, state.s, state.v] = rgbToHsv(state.r / 63, state.g / 63, state.b / 63);
      sliders.v.value = Math.round(state.v * 63);
      drawWheel();
    }
    const r8 = output8(state.r), g8 = output8(state.g), b8 = output8(state.b);
    const hex = `#${toHex(r8)}${toHex(g8)}${toHex(b8)}`;
    document.documentElement.style.setProperty('--selected', hex);
    $('hexValue').textContent = hex;
    $('rgb6Value').textContent = `${state.r}, ${state.g}, ${state.b}`;
    $('rgb8Value').textContent = `${r8}, ${g8}, ${b8}`;
    $('binaryValue').textContent = [state.r, state.g, state.b].map(v => v.toString(2).padStart(6, '0')).join(' · ');
    $('indexValue').textContent = (state.r * 4096 + state.g * 64 + state.b).toLocaleString('en-US');
    ['r', 'g', 'b'].forEach(channel => {
      sliders[channel].value = state[channel];
      $(`${channel === 'r' ? 'red' : channel === 'g' ? 'green' : 'blue'}Output`).textContent = state[channel];
    });
    $('valueOutput').textContent = `${sliders.v.value} / 63`;
    const angle = state.h * Math.PI * 2 - Math.PI / 2;
    const radius = state.s * 48;
    cursor.style.left = `${50 + Math.cos(angle) * radius}%`;
    cursor.style.top = `${50 + Math.sin(angle) * radius}%`;
  }

  function chooseFromWheel(event) {
    const rect = wrap.getBoundingClientRect();
    const x = event.clientX - rect.left - rect.width / 2;
    const y = event.clientY - rect.top - rect.height / 2;
    const radius = Math.min(1, Math.hypot(x, y) / (rect.width * .48));
    state.h = (Math.atan2(y, x) + Math.PI / 2 + Math.PI * 2) % (Math.PI * 2) / (Math.PI * 2);
    state.s = radius;
    state.v = Number(sliders.v.value) / 63;
    const [r, g, b] = hsvToRgb(state.h, state.s, state.v);
    state.r = Math.round(r * 63);
    state.g = Math.round(g * 63);
    state.b = Math.round(b * 63);
    render('wheel');
  }

  wrap.addEventListener('pointerdown', (event) => {
    wrap.setPointerCapture(event.pointerId);
    chooseFromWheel(event);
  });
  wrap.addEventListener('pointermove', (event) => {
    if (wrap.hasPointerCapture(event.pointerId)) chooseFromWheel(event);
  });

  ['r', 'g', 'b'].forEach(channel => sliders[channel].addEventListener('input', () => {
    state[channel] = Number(sliders[channel].value);
    render('rgb');
  }));
  sliders.v.addEventListener('input', () => {
    state.v = Number(sliders.v.value) / 63;
    const [r, g, b] = hsvToRgb(state.h, state.s, state.v);
    state.r = Math.round(r * 63);
    state.g = Math.round(g * 63);
    state.b = Math.round(b * 63);
    drawWheel();
    render('wheel');
  });

  $('copyHex').addEventListener('click', async () => {
    const value = $('hexValue').textContent;
    try {
      await navigator.clipboard.writeText(value);
      $('copyLabel').textContent = 'COPIED';
      setTimeout(() => { $('copyLabel').textContent = 'COPY HEX'; }, 1200);
    } catch (_) {
      $('copyLabel').textContent = value;
    }
  });

  function toggleInfo(open) {
    $('infoPanel').hidden = !open;
    $('infoButton').setAttribute('aria-expanded', String(open));
  }
  $('infoButton').addEventListener('click', () => toggleInfo($('infoPanel').hidden));
  $('closeInfo').addEventListener('click', () => toggleInfo(false));
  document.addEventListener('keydown', event => { if (event.key === 'Escape') toggleInfo(false); });

  drawWheel();
  render('rgb');
})();
