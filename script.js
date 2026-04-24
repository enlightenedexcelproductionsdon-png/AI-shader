const descriptionInput = document.getElementById('description');
const temperatureInput = document.getElementById('temperature');
const temperatureValue = document.getElementById('temperatureValue');
const generateBtn = document.getElementById('generateBtn');
const downloadBtn = document.getElementById('downloadBtn');
const shaderOutput = document.getElementById('shaderOutput');

const styleKeywords = [
  { keywords: ['nebula', 'space', 'cosmic', 'galaxy'], theme: 'Cosmic Glow' },
  { keywords: ['fire', 'flame', 'lava', 'ember'], theme: 'Molten Flame' },
  { keywords: ['water', 'ocean', 'wave', 'sea'], theme: 'Ocean Ripple' },
  { keywords: ['forest', 'leaf', 'nature', 'moss'], theme: 'Forest Mist' },
  { keywords: ['ice', 'frost', 'snow', 'crystal'], theme: 'Frosted Shimmer' },
  { keywords: ['digital', 'grid', 'tech', 'wireframe'], theme: 'Cyber Grid' },
];

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function extractTheme(description) {
  const lower = description.toLowerCase();
  for (const entry of styleKeywords) {
    for (const keyword of entry.keywords) {
      if (lower.includes(keyword)) {
        return entry.theme;
      }
    }
  }
  return 'Abstract Motion';
}

function buildShaderCode(description, temperature) {
  const theme = extractTheme(description);
  const speed = 0.7 + temperature * 1.8;
  const detail = Math.round(3 + temperature * 5);
  const saturation = 0.5 + temperature * 0.4;

  const colorPalette = {
    'Cosmic Glow': ['vec3(0.2, 0.35, 0.9)', 'vec3(0.6, 0.25, 1.0)', 'vec3(0.95, 0.45, 1.0)'],
    'Molten Flame': ['vec3(0.9, 0.2, 0.0)', 'vec3(1.0, 0.55, 0.1)', 'vec3(1.0, 0.9, 0.2)'],
    'Ocean Ripple': ['vec3(0.0, 0.35, 0.7)', 'vec3(0.2, 0.7, 0.9)', 'vec3(0.9, 0.95, 1.0)'],
    'Forest Mist': ['vec3(0.1, 0.5, 0.25)', 'vec3(0.2, 0.75, 0.5)', 'vec3(0.85, 0.95, 0.7)'],
    'Frosted Shimmer': ['vec3(0.5, 0.85, 0.95)', 'vec3(0.7, 0.9, 1.0)', 'vec3(0.95, 0.98, 1.0)'],
    'Cyber Grid': ['vec3(0.1, 0.9, 1.0)', 'vec3(0.15, 0.6, 0.95)', 'vec3(0.9, 0.5, 1.0)'],
    'Abstract Motion': ['vec3(0.45, 0.3, 0.75)', 'vec3(0.95, 0.4, 0.7)', 'vec3(0.2, 0.8, 0.9)'],
  };

  const colors = colorPalette[theme];
  const baseColor = colors[0];
  const accentColor = colors[1];
  const highlightColor = colors[2];

  return `// AI Shader Generator
// Description: ${description.trim() || 'No description provided'}
// Theme: ${theme}
// Temperature: ${temperature}

vec3 palette(vec3 p) {
    return mix(${baseColor}, mix(${accentColor}, ${highlightColor}, p.y), p.x * 0.7);
}

float noise(vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);
    float a = dot(i, vec2(127.1, 311.7));
    float b = dot(i + vec2(1.0), vec2(127.1, 311.7));
    float c = dot(i + vec2(0.0, 1.0), vec2(127.1, 311.7));
    float d = dot(i + vec2(1.0, 1.0), vec2(127.1, 311.7));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(fract(sin(a) * 43758.5453), fract(sin(b) * 43758.5453), u.x),
               mix(fract(sin(c) * 43758.5453), fract(sin(d) * 43758.5453), u.x), u.y);
}

float fbm(vec2 st) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 0.0;
    for (int i = 0; i < ${detail}; i++) {
        value += amplitude * noise(st);
        st *= 2.0;
        amplitude *= 0.5;
    }
    return value;
}

vec3 mainImage(vec2 fragCoord, vec2 resolution, float time) {
    vec2 uv = (fragCoord.xy - 0.5 * resolution.xy) / min(resolution.x, resolution.y);
    vec2 pos = uv * 1.6;
    float t = time * ${speed};
    float variation = fbm(pos + vec2(t * 0.3, -t * 0.2));
    float shape = sin(pos.x * 2.0 + variation * 3.0) * cos(pos.y * 2.0 - variation * 3.0);
    float mask = smoothstep(0.1, 0.7, abs(shape) * (1.0 + ${temperature.toFixed(2)} * 0.5));
    vec3 color = palette(vec3(mask, variation, 1.0 - mask));
    color = mix(color, vec3(0.04), pow(1.0 - mask, 3.0));
    return pow(color, vec3(0.85 + ${temperature.toFixed(2)} * 0.15));
}

void main() {
    vec2 fragCoord = gl_FragCoord.xy;
    vec2 resolution = vec2(1280.0, 720.0);
    float time = 0.0;
    vec3 color = mainImage(fragCoord, resolution, time);
    gl_FragColor = vec4(color, 1.0);
}
`;
}

function updateTemperatureLabel() {
  temperatureValue.textContent = temperatureInput.value;
}

function handleGenerate() {
  const description = descriptionInput.value.trim();
  const temperature = parseFloat(temperatureInput.value);
  const shaderCode = buildShaderCode(description, temperature);

  shaderOutput.value = shaderCode;
  downloadBtn.disabled = false;
}

function handleDownload() {
  const code = shaderOutput.value;
  if (!code) {
    return;
  }

  const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
  const filename = `generated-shader-${Date.now()}.shader`;
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}

temperatureInput.addEventListener('input', updateTemperatureLabel);
generateBtn.addEventListener('click', handleGenerate);
downloadBtn.addEventListener('click', handleDownload);
updateTemperatureLabel();
