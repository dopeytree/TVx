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
  const [isLoading, setIsLoading] = useState(true);
  const [isBuffering, setIsBuffering] = useState(false);
  const [isChannelChanging, setIsChannelChanging] = useState(false);
  const [mainVideoReady, setMainVideoReady] = useState(false);
  const [currentChannelId, setCurrentChannelId] = useState<string | null>(null);

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
      // Check if this is a channel change
      const isChannelChange = currentChannelId !== channel.id;
      setCurrentChannelId(channel.id);

      // Always treat as channel change to ensure loading video shows
      // This ensures the 2-second minimum delay even for previously streamed channels
      setIsChannelChanging(true);
      setMainVideoReady(false); // Reset main video ready state
      setIsLoading(true);
      setIsBuffering(true);

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

          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            // Start playing and completely pause loading video when stream is ready
            video.play().catch(err => console.error('Play error:', err));
            if (loadingVideoRef.current) {
              loadingVideoRef.current.pause();
              loadingVideoRef.current.muted = true;
            }
            // Set main video as ready when it starts playing
            video.addEventListener('playing', () => {
              setMainVideoReady(true);
            }, { once: true });
            // Reset ready state when video pauses
            video.addEventListener('pause', () => {
              setMainVideoReady(false);
            });
            // Loading will be set to false by the timeout (always 2 seconds minimum)
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
          video.addEventListener('loadedmetadata', () => {
            // Start playing and completely pause loading video when stream is ready
            video.play().catch(err => console.error('Play error:', err));
            if (loadingVideoRef.current) {
              loadingVideoRef.current.pause();
              loadingVideoRef.current.muted = true;
            }
            // Set main video as ready when it starts playing
            video.addEventListener('playing', () => {
              setMainVideoReady(true);
            }, { once: true });
            // Reset ready state when video pauses
            video.addEventListener('pause', () => {
              setMainVideoReady(false);
            });
            // Loading will be set to false by the timeout (always 2 seconds minimum)
          });
          // For channel changes, buffering is managed by the timeout
        } else {
          video.src = channel.url.replace('.m3u8', '.mp4');
          video.addEventListener('loadedmetadata', () => {
            // Start playing and completely pause loading video when stream is ready
            video.play().catch(err => console.error('Play error:', err));
            if (loadingVideoRef.current) {
              loadingVideoRef.current.pause();
              loadingVideoRef.current.muted = true;
            }
            // Set main video as ready when it starts playing
            video.addEventListener('playing', () => {
              setMainVideoReady(true);
            }, { once: true });
            // Reset ready state when video pauses
            video.addEventListener('pause', () => {
              setMainVideoReady(false);
            });
            // Loading will be set to false by the timeout (always 2 seconds minimum)
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

  if (!channel) {
    return (
      <Card className={`aspect-video w-full flex items-center justify-center bg-gradient-card ${settings.panelStyle === 'shadow' ? 'border-none shadow-lg' : 'border-border'}`}>
        <p className="text-muted-foreground text-lg">Select a channel to start watching</p>
      </Card>
    );
  }

  return (
    <Card className={`${isFullGuide ? 'h-[35vh]' : 'aspect-video'} w-full overflow-hidden bg-black rounded-3xl ${settings.panelStyle === 'shadow' ? 'border-none shadow-lg' : 'border-border shadow-glow'}`} style={isFullGuide ? (isFullGuideExpanded ? { height: '100vh', width: 'calc(100vh * 16 / 9)', margin: '0 auto', boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5), 0 0 30px hsl(215.4 25% 26.7% / 0.3)' } : { height: '35vh', width: 'calc(35vh * 16 / 9)', margin: '0 auto', boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5), 0 0 30px hsl(215.4 25% 26.7% / 0.3)' }) : { boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5), 0 0 30px hsl(215.4 25% 26.7% / 0.3)', maxHeight: 'calc(100vh - 50px)' }}>
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
