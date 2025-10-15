import { useEffect, useRef, useState } from "react";
import { Channel, AppSettings } from "@/types/iptv";
import { Card } from "@/components/ui/card";
import Hls from 'hls.js';

interface VideoPlayerProps {
  channel: Channel | null;
  settings: AppSettings;
  muted: boolean;
  isFullGuide: boolean;
  isFullGuideExpanded: boolean;
}

const vertexShaderSource = `precision mediump float;

attribute vec2 inPos;
varying vec2 vertPos;

void main()
{
    vertPos = inPos;
    gl_Position = vec4( inPos, 0.0, 1.0 );
}`;

const fragmentShaderSource = `precision mediump float;

varying vec2 vertPos;
uniform sampler2D u_texture;
uniform float u_distortion;
uniform float u_stripe;
uniform float u_rgbshift;
uniform float u_vignette;
uniform float u_vignette_radius;
uniform float u_edge_aberration;
uniform float u_frame_edge_blur;
uniform float u_center_sharpness;
uniform float u_sharpen_first;
uniform vec2 u_resolution;

// Sharpening helper function - applies unsharp mask with center feathering
vec3 applySharpen(sampler2D tex, vec2 coord, float amount, float centerMask) {
    if (amount < 0.01) return texture2D(tex, coord).rgb;
    
    vec2 pixelSize = 1.0 / u_resolution;
    
    // Sample center and neighbors
    vec3 center = texture2D(tex, coord).rgb;
    vec3 blur = vec3(0.0);
    
    // Simple 3x3 box blur for the unsharp mask
    blur += texture2D(tex, coord + vec2(-pixelSize.x, -pixelSize.y)).rgb;
    blur += texture2D(tex, coord + vec2(0.0, -pixelSize.y)).rgb;
    blur += texture2D(tex, coord + vec2(pixelSize.x, -pixelSize.y)).rgb;
    blur += texture2D(tex, coord + vec2(-pixelSize.x, 0.0)).rgb;
    blur += texture2D(tex, coord).rgb;
    blur += texture2D(tex, coord + vec2(pixelSize.x, 0.0)).rgb;
    blur += texture2D(tex, coord + vec2(-pixelSize.x, pixelSize.y)).rgb;
    blur += texture2D(tex, coord + vec2(0.0, pixelSize.y)).rgb;
    blur += texture2D(tex, coord + vec2(pixelSize.x, pixelSize.y)).rgb;
    blur /= 9.0;
    
    // Unsharp mask: original + (original - blurred) * amount * centerMask
    vec3 sharpened = center + (center - blur) * amount * centerMask;
    return clamp(sharpened, 0.0, 1.0);
}

void main()
{
    vec2 ndc_pos = vertPos;
    vec2 testVec = ndc_pos.xy / max(abs(ndc_pos.x), abs(ndc_pos.y));
    float len = max(1.0,length( testVec ));
    ndc_pos *= mix(1.0, mix(1.0,len,max(abs(ndc_pos.x), abs(ndc_pos.y))), u_distortion);
    vec2 texCoord = vec2(ndc_pos.s, -ndc_pos.t) * 0.52 + 0.5;

    float stripTile = texCoord.t * mix(10.0, 100.0, u_stripe);
    float stripFac = 1.0 + 0.25 * u_stripe * (step(0.5, stripTile-float(int(stripTile))) - 0.5);
    
    // Vignette with smooth feathering to avoid hard circle edge
    float dist = length(ndc_pos);
    float vignette_factor = smoothstep(u_vignette_radius - 0.1, u_vignette_radius + 0.3, dist);
    float vignette = 1.0 - vignette_factor * u_vignette;
    vignette = clamp(vignette, 0.0, 1.0);
    
    // Center sharpening mask - full strength at center, fades to 0 at edges
    // Creates a feathered circle that's strongest in the middle 40% of the screen
    float centerDist = length(ndc_pos);
    float sharpenMask = 1.0 - smoothstep(0.3, 0.9, centerDist);
    
    // Standard chromatic aberration (center to edge)
    float radialShift = 1.0 + length(ndc_pos) * 0.5;
    float shift = u_rgbshift * radialShift;
    
    // Edge-only aberration - calculate distance from edge in pixels
    vec2 pixelCoord = texCoord * u_resolution;
    vec2 edgeDist = min(pixelCoord, u_resolution - pixelCoord);
    float minEdgeDist = min(edgeDist.x, edgeDist.y);
    
    // Create edge mask: 1.0 at edge (0px), 0.0 at 40px+ from edge (thin vaseline-like effect)
    float edgeMask = 1.0 - smoothstep(0.0, 40.0, minEdgeDist);
    
    // Vaseline-like blur on edges only (no chromatic aberration for this effect)
    float blurAmount = u_edge_aberration * edgeMask * 0.002;
    
    // Sample with standard chromatic aberration and edge blur
    float texR, texG, texB;
    vec3 finalColor;
    
    // Apply sharpening first if enabled, otherwise apply after other effects
    if (u_sharpen_first > 0.5 && u_center_sharpness > 0.01) {
        // Sharpen first, then apply chromatic aberration
        vec3 sharpened = applySharpen(u_texture, texCoord.st, u_center_sharpness * 2.0, sharpenMask);
        
        // Now apply effects to the sharpened result (approximation - just use the sharpened center for green)
        if (u_edge_aberration > 0.01 && edgeMask > 0.01) {
            vec3 blurredColor = vec3(0.0);
            blurredColor += applySharpen(u_texture, texCoord.st, u_center_sharpness * 2.0, sharpenMask) * 0.4;
            blurredColor += applySharpen(u_texture, texCoord.st + vec2(blurAmount, 0.0), u_center_sharpness * 2.0, sharpenMask) * 0.15;
            blurredColor += applySharpen(u_texture, texCoord.st - vec2(blurAmount, 0.0), u_center_sharpness * 2.0, sharpenMask) * 0.15;
            blurredColor += applySharpen(u_texture, texCoord.st + vec2(0.0, blurAmount), u_center_sharpness * 2.0, sharpenMask) * 0.15;
            blurredColor += applySharpen(u_texture, texCoord.st - vec2(0.0, blurAmount), u_center_sharpness * 2.0, sharpenMask) * 0.15;
            
            texR = applySharpen(u_texture, texCoord.st - vec2(shift), u_center_sharpness * 2.0, sharpenMask).r;
            texG = blurredColor.g;
            texB = applySharpen(u_texture, texCoord.st + vec2(shift), u_center_sharpness * 2.0, sharpenMask).b;
        } else {
            texR = applySharpen(u_texture, texCoord.st - vec2(shift), u_center_sharpness * 2.0, sharpenMask).r;
            texG = sharpened.g;
            texB = applySharpen(u_texture, texCoord.st + vec2(shift), u_center_sharpness * 2.0, sharpenMask).b;
        }
    } else {
        // Apply chromatic aberration and edge blur first
        if (u_edge_aberration > 0.01 && edgeMask > 0.01) {
            // Multi-sample blur for vaseline effect on edges
            vec3 blurredColor = vec3(0.0);
            blurredColor += texture2D(u_texture, texCoord.st).rgb * 0.4;
            blurredColor += texture2D(u_texture, texCoord.st + vec2(blurAmount, 0.0)).rgb * 0.15;
            blurredColor += texture2D(u_texture, texCoord.st - vec2(blurAmount, 0.0)).rgb * 0.15;
            blurredColor += texture2D(u_texture, texCoord.st + vec2(0.0, blurAmount)).rgb * 0.15;
            blurredColor += texture2D(u_texture, texCoord.st - vec2(0.0, blurAmount)).rgb * 0.15;
            
            // Apply standard chromatic aberration to the blurred edge
            texR = texture2D(u_texture, texCoord.st - vec2(shift)).r;
            texG = blurredColor.g;
            texB = texture2D(u_texture, texCoord.st + vec2(shift)).b;
        } else {
            // Standard chromatic aberration only (no edge blur)
            texR = texture2D(u_texture, texCoord.st - vec2(shift)).r;
            texG = texture2D(u_texture, texCoord.st).g;
            texB = texture2D(u_texture, texCoord.st + vec2(shift)).b;
        }
        
        // Apply sharpening after other effects
        if (u_center_sharpness > 0.01) {
            vec3 baseColor = vec3(texR, texG, texB);
            vec3 sharpened = applySharpen(u_texture, texCoord.st, u_center_sharpness * 2.0, sharpenMask);
            // Blend the sharpened center with the aberrated RGB
            finalColor = mix(baseColor, sharpened, sharpenMask * u_center_sharpness);
        } else {
            finalColor = vec3(texR, texG, texB);
        }
    }
    
    // If sharpen first was used, finalize the color
    if (u_sharpen_first > 0.5 && u_center_sharpness > 0.01) {
        finalColor = vec3(texR, texG, texB);
    }
    
    // Anti-aliased/blurred frame edge (smooth clipping)
    // u_frame_edge_blur: 2 = subtle AA, 10 = soft blur, 50 = heavy blur
    float edgeWidth = u_frame_edge_blur / min(u_resolution.x, u_resolution.y);
    float clipX = smoothstep(0.0, edgeWidth, texCoord.s) * smoothstep(1.0, 1.0 - edgeWidth, texCoord.s);
    float clipY = smoothstep(0.0, edgeWidth, texCoord.t) * smoothstep(1.0, 1.0 - edgeWidth, texCoord.t);
    float clip = clipX * clipY;
    
    gl_FragColor  = vec4( finalColor * stripFac * vignette * clip, 1.0 );
}`;




export const VideoPlayer = ({ channel, settings, muted, isFullGuide, isFullGuideExpanded }: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const loadingVideoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const hlsRef = useRef<Hls>();
  const channelChangeTimeoutRef = useRef<NodeJS.Timeout>();
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const lowMidFilterRef = useRef<BiquadFilterNode | null>(null);
  const presenceFilterRef = useRef<BiquadFilterNode | null>(null);
  const highpassFilterRef = useRef<BiquadFilterNode | null>(null);
  const lowpassFilterRef = useRef<BiquadFilterNode | null>(null);
  const reverbNodeRef = useRef<ConvolverNode | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBuffering, setIsBuffering] = useState(false);
  const [isChannelChanging, setIsChannelChanging] = useState(false);
  const [mainVideoReady, setMainVideoReady] = useState(false);
  const [currentChannelId, setCurrentChannelId] = useState<string | null>(null);

  const [audioContextReady, setAudioContextReady] = useState(false);

  const ensureAudioContext = async (): Promise<boolean> => {
    try {
      // Create audio context if not exists
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        console.log('ensureAudioContext: created new AudioContext, state:', audioContextRef.current.state);
      }
      
      const ctx = audioContextRef.current;
      
      // If already running, return true
      if (ctx.state === 'running') {
        console.log('ensureAudioContext: context already running');
        setAudioContextReady(true);
        return true;
      }
      
      // If suspended, try to resume
      if (ctx.state === 'suspended') {
        console.log('ensureAudioContext: attempting to resume suspended context');
        await ctx.resume();
        console.log('ensureAudioContext: context resumed successfully, new state:', ctx.state);
        setAudioContextReady(true);
        return true;
      }
      
      // If closed or interrupted, we can't use it
      if (ctx.state === 'closed' || ctx.state === 'interrupted') {
        console.log('ensureAudioContext: context is closed or interrupted, creating new one');
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        const newCtx = audioContextRef.current;
        if (newCtx.state === 'running') {
          setAudioContextReady(true);
          return true;
        }
        if (newCtx.state === 'suspended') {
          await newCtx.resume();
          setAudioContextReady(true);
          return true;
        }
      }
      
      console.log('ensureAudioContext: context state:', ctx.state);
      return false;
    } catch (error) {
      console.error('ensureAudioContext: failed to ensure audio context:', error);
      return false;
    }
  };

  const setupAudioEffects = async () => {
    if (!videoRef.current || !settings.audioFilterEnabled) {
      console.log('setupAudioEffects: skipping - no video element or filter disabled');
      return;
    }

    // Check if video has audio data
    if (videoRef.current.readyState < videoRef.current.HAVE_CURRENT_DATA) {
      console.log('setupAudioEffects: video not ready, readyState:', videoRef.current.readyState, 'for channel:', channel?.name);
      return;
    }

    console.log('setupAudioEffects: starting audio setup for channel:', channel?.name, 'video readyState:', videoRef.current.readyState);

    // Ensure AudioContext is ready
    const contextReady = await ensureAudioContext();
    if (!contextReady) {
      console.log('setupAudioEffects: AudioContext not ready, will retry later');
      return;
    }

    try {
      const ctx = audioContextRef.current!;
      
      // CRITICAL: The video element must NOT be muted for Web Audio API to capture audio!
      // We'll control volume through the gain node instead
      videoRef.current.muted = false;
      console.log('setupAudioEffects: video element UNMUTED for Web Audio API capture');
      
      // CRITICAL: You can only create a MediaElementAudioSourceNode ONCE per video element
      // If we already have one, just reconnect it. Don't try to create a new one.
      if (!sourceNodeRef.current) {
        console.log('setupAudioEffects: creating MediaElementAudioSourceNode (FIRST TIME ONLY)');
        try {
          sourceNodeRef.current = ctx.createMediaElementSource(videoRef.current);
          console.log('setupAudioEffects: MediaElementAudioSourceNode created successfully');
        } catch (error) {
          console.error('setupAudioEffects: FAILED to create MediaElementAudioSourceNode:', error);
          // If creation fails, it's likely already been created - this is the problem!
          return;
        }
      } else {
        console.log('setupAudioEffects: reusing existing MediaElementAudioSourceNode');
      }

      // Create gain node if it doesn't exist (for volume control)
      if (!gainNodeRef.current) {
        gainNodeRef.current = ctx.createGain();
        console.log('setupAudioEffects: created gain node for volume control');
      }

      // Create vintage audio filter chain if it doesn't exist
      // This creates the classic "warm vintage valve/tube amplifier" sound by:
      // 1. Removing very low frequencies (< 450Hz) - highpass filter
      // 2. Boosting low-mids for warmth (700Hz) - peaking filter for body
      // 3. Boosting upper-mids for presence (2.8kHz) - peaking filter for clarity
      // 4. Rolling off high frequencies aggressively (> 3.5kHz) - lowpass filter for smoothness
      
      if (!highpassFilterRef.current) {
        highpassFilterRef.current = ctx.createBiquadFilter();
        highpassFilterRef.current.type = 'highpass';
        highpassFilterRef.current.frequency.value = 450; // Cut bass below 450Hz (very tight vintage speaker sound)
        highpassFilterRef.current.Q.value = 0.8; // Slightly steeper rolloff
        console.log('setupAudioEffects: created highpass filter (450Hz)');
      }

      if (!lowMidFilterRef.current) {
        lowMidFilterRef.current = ctx.createBiquadFilter();
        lowMidFilterRef.current.type = 'peaking';
        lowMidFilterRef.current.frequency.value = 700; // Boost low-mids (warmth and body)
        lowMidFilterRef.current.Q.value = 1.0; // Moderate bandwidth for pronounced warmth
        lowMidFilterRef.current.gain.value = 8; // +8dB boost for strong warmth
        console.log('setupAudioEffects: created low-mid warmth filter (700Hz, +8dB)');
      }

      if (!presenceFilterRef.current) {
        presenceFilterRef.current = ctx.createBiquadFilter();
        presenceFilterRef.current.type = 'peaking';
        presenceFilterRef.current.frequency.value = 2800; // Boost upper-mids (presence/clarity)
        presenceFilterRef.current.Q.value = 1.5; // Narrower boost for strong character
        presenceFilterRef.current.gain.value = 10; // +10dB boost for very "forward" vintage sound
        console.log('setupAudioEffects: created presence filter (2.8kHz, +10dB)');
      }

      if (!lowpassFilterRef.current) {
        lowpassFilterRef.current = ctx.createBiquadFilter();
        lowpassFilterRef.current.type = 'lowpass';
        lowpassFilterRef.current.frequency.value = 3500; // Cut highs above 3.5kHz (heavily muffled vintage sound)
        lowpassFilterRef.current.Q.value = 0.7; // Moderate rolloff for vintage character
        console.log('setupAudioEffects: created lowpass filter (3.5kHz)');
      }

      // Create a subtle reverb/echo effect using ConvolverNode
      if (!reverbNodeRef.current) {
        reverbNodeRef.current = ctx.createConvolver();
        // Generate a short impulse response (mono, 60ms, gentle decay)
        const sampleRate = ctx.sampleRate;
        const length = Math.floor(sampleRate * 0.06); // 60ms
        const impulse = ctx.createBuffer(1, length, sampleRate);
        const channelData = impulse.getChannelData(0);
        for (let i = 0; i < length; i++) {
          // Exponential decay, very low amplitude
          channelData[i] = (Math.random() * 2 - 1) * 0.08 * Math.pow(1 - i / length, 2.5);
        }
        reverbNodeRef.current.buffer = impulse;
        console.log('setupAudioEffects: created short impulse response for reverb');
      }

      // Disconnect existing connections before reconnecting
      try {
        sourceNodeRef.current.disconnect();
        highpassFilterRef.current.disconnect();
        lowMidFilterRef.current.disconnect();
        presenceFilterRef.current.disconnect();
        lowpassFilterRef.current.disconnect();
        reverbNodeRef.current.disconnect();
        gainNodeRef.current.disconnect();
        console.log('setupAudioEffects: disconnected existing connections');
      } catch (e) {
        // Ignore disconnect errors
      }

      // Connect vintage audio chain: source → highpass → low-mid warmth → presence → lowpass → reverb → gain → destination
      console.log('setupAudioEffects: connecting vintage audio filter chain with reverb');
      sourceNodeRef.current.connect(highpassFilterRef.current);
      highpassFilterRef.current.connect(lowMidFilterRef.current);
      lowMidFilterRef.current.connect(presenceFilterRef.current);
      presenceFilterRef.current.connect(lowpassFilterRef.current);
      lowpassFilterRef.current.connect(reverbNodeRef.current);
      reverbNodeRef.current.connect(gainNodeRef.current);
      gainNodeRef.current.connect(ctx.destination);
      
      // Set gain based on muted prop
      gainNodeRef.current.gain.value = muted ? 0 : 1;
      console.log('setupAudioEffects: gain set to', muted ? 0 : 1, '(muted:', muted + ')');
      
      console.log('setupAudioEffects: audio setup complete for channel:', channel?.name);
    } catch (error) {
      console.error('setupAudioEffects: error setting up audio:', error);
    }
  };  const teardownAudioEffects = () => {
    console.log('teardownAudioEffects: called');
    try {
      // CRITICAL: Do NOT set sourceNodeRef.current to null
      // The MediaElementAudioSourceNode must persist for the lifetime of the video element
      // We can disconnect it, but we must keep the reference
      
      if (sourceNodeRef.current) {
        console.log('teardownAudioEffects: disconnecting source node');
        sourceNodeRef.current.disconnect();
      }
      
      // Disconnect filter nodes if they exist
      if (highpassFilterRef.current) {
        highpassFilterRef.current.disconnect();
      }
      if (lowMidFilterRef.current) {
        lowMidFilterRef.current.disconnect();
      }
      if (presenceFilterRef.current) {
        presenceFilterRef.current.disconnect();
      }
      if (lowpassFilterRef.current) {
        lowpassFilterRef.current.disconnect();
      }
      if (reverbNodeRef.current) {
        reverbNodeRef.current.disconnect();
      }
      if (gainNodeRef.current) {
        gainNodeRef.current.disconnect();
      }
      
      // If audio filter is disabled, unmute the video so we get native audio
      if (videoRef.current && !settings.audioFilterEnabled) {
        videoRef.current.muted = muted; // Restore to prop value
        console.log('teardownAudioEffects: video muted set to', muted);
      }
    } catch (error) {
      console.error('teardownAudioEffects: error:', error);
    }
  };

  const setupWebGL = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const gl = canvas.getContext('webgl');
    if (!gl) {
      console.error('WebGL not supported');
      return;
    }
    canvas.width = canvas.clientWidth || 640;
    canvas.height = canvas.clientHeight || 360;
    // compile shaders
    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vertexShaderSource);
    gl.compileShader(vertexShader);
    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
      console.error('Vertex shader compile error:', gl.getShaderInfoLog(vertexShader));
      return;
    }
    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fragmentShaderSource);
    gl.compileShader(fragmentShader);
    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
      console.error('Fragment shader compile error:', gl.getShaderInfoLog(fragmentShader));
      return;
    }
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program link error:', gl.getProgramInfoLog(program));
      return;
    }
    gl.useProgram(program);
    const inPos = gl.getAttribLocation(program, 'inPos');
    const u_texture = gl.getUniformLocation(program, 'u_texture');
    const u_distortion = gl.getUniformLocation(program, 'u_distortion');
    const u_stripe = gl.getUniformLocation(program, 'u_stripe');
    const u_rgbshift = gl.getUniformLocation(program, 'u_rgbshift');
    const u_vignette = gl.getUniformLocation(program, 'u_vignette');
    const u_vignette_radius = gl.getUniformLocation(program, 'u_vignette_radius');
    const u_edge_aberration = gl.getUniformLocation(program, 'u_edge_aberration');
    const u_frame_edge_blur = gl.getUniformLocation(program, 'u_frame_edge_blur');
    const u_center_sharpness = gl.getUniformLocation(program, 'u_center_sharpness');
    const u_sharpen_first = gl.getUniformLocation(program, 'u_sharpen_first');
    const u_resolution = gl.getUniformLocation(program, 'u_resolution');
    // buffer
    const bufRect = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufRect);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, 1, 1, -1, 1]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(inPos);
    gl.vertexAttribPointer(inPos, 2, gl.FLOAT, false, 0, 0);
    // texture
    const texture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    // render
    const render = () => {
      let currentVideo = videoRef.current;

      // Priority: main video when ready > loading video during channel change > fallback to loading video
      if (mainVideoReady && videoRef.current && videoRef.current.readyState >= videoRef.current.HAVE_CURRENT_DATA) {
        currentVideo = videoRef.current;
      } else if (settings.showLoadingVideo && isChannelChanging &&
          loadingVideoRef.current && loadingVideoRef.current.readyState >= loadingVideoRef.current.HAVE_CURRENT_DATA) {
        currentVideo = loadingVideoRef.current;
      } else if (videoRef.current && videoRef.current.readyState >= videoRef.current.HAVE_CURRENT_DATA) {
        currentVideo = videoRef.current;
      } else if (loadingVideoRef.current && loadingVideoRef.current.readyState >= loadingVideoRef.current.HAVE_CURRENT_DATA) {
        currentVideo = loadingVideoRef.current;
      }

      if (currentVideo) {
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, currentVideo);
      }
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0, 0, 0, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform1i(u_texture, 0);
      gl.uniform1f(u_distortion, 0.12);
      gl.uniform1f(u_stripe, 0.004);
      gl.uniform1f(u_rgbshift, settings.rgbShiftStrength);
      gl.uniform1f(u_vignette, settings.vignetteStrength);
      gl.uniform1f(u_vignette_radius, settings.vignetteRadius);
      gl.uniform1f(u_edge_aberration, settings.edgeAberration || 0);
      gl.uniform1f(u_frame_edge_blur, settings.frameEdgeBlur || 2);
      gl.uniform1f(u_center_sharpness, settings.centerSharpness || 0);
      gl.uniform1f(u_sharpen_first, settings.sharpenFirst ? 1.0 : 0.0);
      gl.uniform2f(u_resolution, canvas.width, canvas.height);
      gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
      animationRef.current = requestAnimationFrame(render);
    };
    render();
  };

  useEffect(() => {
    const setupWebGL = () => {
      if (!canvasRef.current) return;
      const canvas = canvasRef.current;
      const gl = canvas.getContext('webgl');
      if (!gl) {
        console.error('WebGL not supported');
        return;
      }
      canvas.width = canvas.clientWidth || 640;
      canvas.height = canvas.clientHeight || 360;
      // compile shaders
      const vertexShader = gl.createShader(gl.VERTEX_SHADER);
      gl.shaderSource(vertexShader, vertexShaderSource);
      gl.compileShader(vertexShader);
      if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
        console.error('Vertex shader compile error:', gl.getShaderInfoLog(vertexShader));
        return;
      }
      const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
      gl.shaderSource(fragmentShader, fragmentShaderSource);
      gl.compileShader(fragmentShader);
      if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
        console.error('Fragment shader compile error:', gl.getShaderInfoLog(fragmentShader));
        return;
      }
      const program = gl.createProgram();
      gl.attachShader(program, vertexShader);
      gl.attachShader(program, fragmentShader);
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('Program link error:', gl.getProgramInfoLog(program));
        return;
      }
      gl.useProgram(program);
      const inPos = gl.getAttribLocation(program, 'inPos');
      const u_texture = gl.getUniformLocation(program, 'u_texture');
      const u_distortion = gl.getUniformLocation(program, 'u_distortion');
      const u_stripe = gl.getUniformLocation(program, 'u_stripe');
      const u_rgbshift = gl.getUniformLocation(program, 'u_rgbshift');
      const u_vignette = gl.getUniformLocation(program, 'u_vignette');
      const u_vignette_radius = gl.getUniformLocation(program, 'u_vignette_radius');
      const u_edge_aberration = gl.getUniformLocation(program, 'u_edge_aberration');
      const u_frame_edge_blur = gl.getUniformLocation(program, 'u_frame_edge_blur');
      const u_center_sharpness = gl.getUniformLocation(program, 'u_center_sharpness');
      const u_sharpen_first = gl.getUniformLocation(program, 'u_sharpen_first');
      const u_resolution = gl.getUniformLocation(program, 'u_resolution');
      // buffer
      const bufRect = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, bufRect);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, 1, 1, -1, 1]), gl.STATIC_DRAW);
      gl.enableVertexAttribArray(inPos);
      gl.vertexAttribPointer(inPos, 2, gl.FLOAT, false, 0, 0);
      // texture
      const texture = gl.createTexture();
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      // render
      const render = () => {
        let currentVideo = videoRef.current;

        // Priority: main video when ready > loading video during channel change > fallback to loading video
        if (mainVideoReady && videoRef.current && videoRef.current.readyState >= videoRef.current.HAVE_CURRENT_DATA) {
          currentVideo = videoRef.current;
        } else if (settings.showLoadingVideo && isChannelChanging &&
            loadingVideoRef.current && loadingVideoRef.current.readyState >= loadingVideoRef.current.HAVE_CURRENT_DATA) {
          currentVideo = loadingVideoRef.current;
        } else if (videoRef.current && videoRef.current.readyState >= videoRef.current.HAVE_CURRENT_DATA) {
          currentVideo = videoRef.current;
        } else if (loadingVideoRef.current && loadingVideoRef.current.readyState >= loadingVideoRef.current.HAVE_CURRENT_DATA) {
          currentVideo = loadingVideoRef.current;
        }

        if (currentVideo) {
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, currentVideo);
        }
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.uniform1i(u_texture, 0);
        gl.uniform1f(u_distortion, 0.12);
        gl.uniform1f(u_stripe, 0.004);
        gl.uniform1f(u_rgbshift, settings.rgbShiftStrength);
        gl.uniform1f(u_vignette, settings.vignetteStrength);
        gl.uniform1f(u_vignette_radius, settings.vignetteRadius);
        gl.uniform1f(u_edge_aberration, settings.edgeAberration || 0);
        gl.uniform1f(u_frame_edge_blur, settings.frameEdgeBlur || 2);
        gl.uniform1f(u_center_sharpness, settings.centerSharpness || 0);
        gl.uniform1f(u_sharpen_first, settings.sharpenFirst ? 1.0 : 0.0);
        gl.uniform2f(u_resolution, canvas.width, canvas.height);
        gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
        animationRef.current = requestAnimationFrame(render);
      };
      render();
    };

    // Setup loading video
    if (loadingVideoRef.current) {
      loadingVideoRef.current.src = '/loading-VHS.mp4';
      loadingVideoRef.current.loop = true;
      loadingVideoRef.current.muted = true; // Start muted, unmute only during channel changes
      loadingVideoRef.current.play().catch(err => console.error('Loading video play error:', err));
    }

    if (settings.vintageTV) {
      setupWebGL();
    }

    if (channel) {
      console.log('VideoPlayer: channel changed to:', channel?.name, channel?.id);
      // Check if this is a channel change
      const isChannelChange = currentChannelId !== channel.id;
      const isFirstLoad = currentChannelId === null;
      setCurrentChannelId(channel.id);

      // Always treat as channel change to ensure loading video shows
      // This ensures the 2-second minimum delay even for previously streamed channels
      setIsChannelChanging(true);
      setMainVideoReady(false); // Reset main video ready state
      setIsLoading(true);
      setIsBuffering(true);

      // IMPORTANT: Do NOT teardown audio or clear sourceNodeRef on channel changes!
      // The MediaElementAudioSourceNode must persist for the lifetime of the video element
      // We'll just disconnect and reconnect it when the new channel loads
      console.log('VideoPlayer: keeping audio nodes intact during channel change');

      // Unmute loading video during channel changes
      if (loadingVideoRef.current) {
        loadingVideoRef.current.muted = false;
        loadingVideoRef.current.play().catch(err => console.error('Loading video restart error:', err));
      }

      // Clear any existing timeout
      if (channelChangeTimeoutRef.current) {
        clearTimeout(channelChangeTimeoutRef.current);
      }

      // Set minimum 2-second delay for ALL channel loads
      channelChangeTimeoutRef.current = setTimeout(() => {
        setIsChannelChanging(false);
        setIsLoading(false);
      }, 2000);

      // Load main video
      if (videoRef.current) {
        const video = videoRef.current;

        // Ensure video is reset for channel changes
        video.pause();
        video.currentTime = 0;

        if (Hls.isSupported()) {
          const hls = new Hls();
          hlsRef.current = hls;
          hls.loadSource(channel.url);
          hls.attachMedia(video);

          // Add canplaythrough listener immediately after attachMedia
          video.addEventListener('canplaythrough', async () => {
            console.log('VideoPlayer: canplaythrough fired for HLS, setting mainVideoReady=true');
            setMainVideoReady(true);
            // Setup audio effects after video can play through
            if (settings.audioFilterEnabled) {
              await setupAudioEffects();
            }
          }, { once: true });

          // Also add loadeddata listener as backup - fires when first frame is loaded
          video.addEventListener('loadeddata', async () => {
            console.log('VideoPlayer: loadeddata fired for HLS (backup trigger)');
            // Only setup audio if not already set up
            if (settings.audioFilterEnabled && !sourceNodeRef.current) {
              console.log('VideoPlayer: Setting up audio from loadeddata event');
              await setupAudioEffects();
            }
          }, { once: true });

          // Reset ready state when video pauses
          video.addEventListener('pause', () => {
            setMainVideoReady(false);
          });

          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            // Start playing and completely pause loading video when stream is ready
            video.play().catch(err => console.error('Play error:', err));
            if (loadingVideoRef.current) {
              loadingVideoRef.current.pause();
              loadingVideoRef.current.muted = true;
            }
            // Loading will be set to false by the timeout (always 2 seconds minimum)
            
            // Additional check: if audio filter is enabled and audio isn't set up yet, try to set it up
            setTimeout(async () => {
              if (settings.audioFilterEnabled && !sourceNodeRef.current && video.readyState >= video.HAVE_CURRENT_DATA) {
                console.log('VideoPlayer: Setting up audio from MANIFEST_PARSED timeout');
                await setupAudioEffects();
              }
            }, 500);
          });

          hls.on(Hls.Events.BUFFER_APPENDED, () => {
            setIsBuffering(false);
          });

          hls.on(Hls.Events.BUFFER_EOS, () => {
            setIsBuffering(false);
          });

          hls.on(Hls.Events.BUFFER_FLUSHING, () => {
            // For channel changes, we ignore buffering events during the loading phase
            // Buffering state is managed by the timeout
          });

          hls.on(Hls.Events.ERROR, (event, data) => {
            console.error('HLS Error:', data);
            if (data.fatal) {
              setIsBuffering(true);
              setMainVideoReady(false); // Reset ready state on error
              // Try to recover
              switch (data.type) {
                case Hls.ErrorTypes.NETWORK_ERROR:
                  hls.startLoad();
                  break;
                case Hls.ErrorTypes.MEDIA_ERROR:
                  hls.recoverMediaError();
                  break;
                default:
                  hls.destroy();
                  break;
              }
            }
          });

        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = channel.url;

          // Add canplaythrough listener immediately after setting src
          video.addEventListener('canplaythrough', async () => {
            console.log('VideoPlayer: canplaythrough fired for native HLS, setting mainVideoReady=true');
            setMainVideoReady(true);
            // Setup audio effects after video can play through
            if (settings.audioFilterEnabled) {
              await setupAudioEffects();
            }
          }, { once: true });

          // Also add loadeddata listener as backup
          video.addEventListener('loadeddata', async () => {
            console.log('VideoPlayer: loadeddata fired for native HLS (backup trigger)');
            if (settings.audioFilterEnabled && !sourceNodeRef.current) {
              console.log('VideoPlayer: Setting up audio from loadeddata event');
              await setupAudioEffects();
            }
          }, { once: true });

          // Reset ready state when video pauses
          video.addEventListener('pause', () => {
            setMainVideoReady(false);
          });

          video.addEventListener('loadedmetadata', () => {
            // Start playing and completely pause loading video when stream is ready
            video.play().catch(err => console.error('Play error:', err));
            if (loadingVideoRef.current) {
              loadingVideoRef.current.pause();
              loadingVideoRef.current.muted = true;
            }
            // Loading will be set to false by the timeout (always 2 seconds minimum)
            
            // Additional check for audio setup
            setTimeout(async () => {
              if (settings.audioFilterEnabled && !sourceNodeRef.current && video.readyState >= video.HAVE_CURRENT_DATA) {
                console.log('VideoPlayer: Setting up audio from loadedmetadata timeout (native HLS)');
                await setupAudioEffects();
              }
            }, 500);
          });
          // For channel changes, buffering is managed by the timeout
        } else {
          video.src = channel.url.replace('.m3u8', '.mp4');

          // Add canplaythrough listener immediately after setting src
          video.addEventListener('canplaythrough', async () => {
            console.log('VideoPlayer: canplaythrough fired for MP4, setting mainVideoReady=true');
            setMainVideoReady(true);
            // Setup audio effects after video can play through
            if (settings.audioFilterEnabled) {
              await setupAudioEffects();
            }
          }, { once: true });

          // Also add loadeddata listener as backup
          video.addEventListener('loadeddata', async () => {
            console.log('VideoPlayer: loadeddata fired for MP4 (backup trigger)');
            if (settings.audioFilterEnabled && !sourceNodeRef.current) {
              console.log('VideoPlayer: Setting up audio from loadeddata event');
              await setupAudioEffects();
            }
          }, { once: true });

          // Reset ready state when video pauses
          video.addEventListener('pause', () => {
            setMainVideoReady(false);
          });

          video.addEventListener('loadedmetadata', () => {
            // Start playing and completely pause loading video when stream is ready
            video.play().catch(err => console.error('Play error:', err));
            if (loadingVideoRef.current) {
              loadingVideoRef.current.pause();
              loadingVideoRef.current.muted = true;
            }
            // Loading will be set to false by the timeout (always 2 seconds minimum)
            
            // Additional check for audio setup
            setTimeout(async () => {
              if (settings.audioFilterEnabled && !sourceNodeRef.current && video.readyState >= video.HAVE_CURRENT_DATA) {
                console.log('VideoPlayer: Setting up audio from loadedmetadata timeout (MP4)');
                await setupAudioEffects();
              }
            }, 500);
          });
          // For channel changes, buffering is managed by the timeout
        }
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
      if (channelChangeTimeoutRef.current) {
        clearTimeout(channelChangeTimeoutRef.current);
      }
    };
  }, [channel, settings.vintageTV, settings.vignetteStrength, settings.rgbShiftStrength, settings.vignetteRadius, settings.showLoadingVideo]);

  // Handle video player resizing
  useEffect(() => {
    if (settings.vintageTV && canvasRef.current) {
      // Re-setup WebGL with new canvas dimensions when size changes
      setupWebGL();
    }
  }, [isFullGuide, isFullGuideExpanded, settings.vintageTV]);

  // Handle audio filter enable/disable - setup or teardown audio routing
  useEffect(() => {
    const handleAudioFilterToggle = async () => {
      if (!videoRef.current) return;
      
      if (settings.audioFilterEnabled) {
        console.log('VideoPlayer: Audio filter enabled, setting up Web Audio API');
        // Setup audio effects if video is ready
        if (videoRef.current.readyState >= videoRef.current.HAVE_CURRENT_DATA) {
          await setupAudioEffects();
        }
      } else {
        console.log('VideoPlayer: Audio filter disabled, using native audio');
        // Disconnect Web Audio API routing
        if (sourceNodeRef.current) {
          try {
            sourceNodeRef.current.disconnect();
            console.log('VideoPlayer: Disconnected Web Audio API');
          } catch (e) {
            // Ignore
          }
        }
        // Unmute video to use native audio
        videoRef.current.muted = muted;
        console.log('VideoPlayer: Video unmuted for native audio, muted =', muted);
      }
    };
    
    handleAudioFilterToggle();
  }, [settings.audioFilterEnabled, muted]);

  // Handle muted prop changes - control audio output based on audio filter state
  useEffect(() => {
    if (!videoRef.current) return;
    
    if (settings.audioFilterEnabled && gainNodeRef.current) {
      // Audio filter is enabled - control volume via gain node
      // Video element must stay UNMUTED for Web Audio API to capture audio
      videoRef.current.muted = false;
      gainNodeRef.current.gain.value = muted ? 0 : 1;
      console.log('VideoPlayer: audio filter enabled, gain set to', muted ? 0 : 1);
    } else {
      // Audio filter disabled - use native video audio
      videoRef.current.muted = muted;
      console.log('VideoPlayer: using native audio, video muted =', muted);
    }
  }, [muted, settings.audioFilterEnabled]);

  // When AudioContext becomes ready, try to set up audio if video is ready
  useEffect(() => {
    const setupAudioIfReady = async () => {
      if (audioContextReady && mainVideoReady && settings.audioFilterEnabled && videoRef.current) {
        console.log('VideoPlayer: AudioContext ready and video ready, setting up audio');
        await setupAudioEffects();
      }
    };
    setupAudioIfReady();
  }, [audioContextReady, mainVideoReady, settings.audioFilterEnabled]);

  // Resume AudioContext on user interactions to ensure audio works after page reload
  useEffect(() => {
    const resumeAudioContext = async () => {
      if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
        console.log('VideoPlayer: attempting to resume AudioContext');
        const success = await ensureAudioContext();
        if (success && mainVideoReady && settings.audioFilterEnabled) {
          console.log('VideoPlayer: AudioContext resumed, setting up audio effects');
          await setupAudioEffects();
        }
      } else {
        console.log('VideoPlayer: AudioContext already running or not created yet');
      }
    };

    // Try to resume immediately (might fail if no user gesture)
    resumeAudioContext();

    // Also resume on user interaction
    const events = ['click', 'touchstart', 'keydown', 'play'];
    const handlers = events.map(event => {
      const handler = () => resumeAudioContext();
      document.addEventListener(event, handler);
      return { event, handler };
    });

    return () => {
      handlers.forEach(({ event, handler }) => {
        document.removeEventListener(event, handler);
      });
    };
  }, [mainVideoReady, settings.audioFilterEnabled]);

  if (!channel) {
    return (
      <Card className={`aspect-video w-full flex items-center justify-center bg-gradient-card ${settings.panelStyle === 'shadow' ? 'border-none shadow-lg' : 'border-border'}`}>
        <p className="text-muted-foreground text-lg">Select a channel to start watching</p>
      </Card>
    );
  }

  return (
    <Card className={`${isFullGuide ? 'h-[35vh]' : 'aspect-video'} w-full overflow-hidden bg-black rounded-3xl ${settings.panelStyle === 'shadow' ? 'border-none shadow-lg' : 'border-border shadow-glow'}`} style={isFullGuide ? (isFullGuideExpanded ? { height: '100vh', width: 'calc(100vh * 16 / 9)', margin: '0 auto', boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5), 0 0 30px hsl(215.4 25% 26.7% / 0.3)' } : { height: '35vh', width: 'calc(35vh * 16 / 9)', marginLeft: 'auto', boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5), 0 0 30px hsl(215.4 25% 26.7% / 0.3)' }) : { boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5), 0 0 30px hsl(215.4 25% 26.7% / 0.3)', maxHeight: 'calc(100vh - 50px)' }}>
      {settings.vintageTV ? (
        <>
          <video
            ref={videoRef}
            style={{ display: 'none' }}
            autoPlay
            muted={muted}
            playsInline
          >
            <source src={channel.url} type="application/x-mpegURL" />
            <source src={channel.url} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <video
            ref={loadingVideoRef}
            style={{ display: 'none' }}
            autoPlay
            muted
            loop
            playsInline
          >
            <source src="/loading-VHS.mp4" type="video/mp4" />
          </video>
          <canvas
            ref={canvasRef}
            className="w-full h-full"
            onClick={() => videoRef.current?.play()}
          />
        </>
      ) : (
        <video
          ref={videoRef}
          className="w-full h-full object-contain"
          controls
          autoPlay
          muted={muted}
          playsInline
        >
          <source src={channel.url} type="application/x-mpegURL" />
          <source src={channel.url} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      )}
    </Card>
  );
};
