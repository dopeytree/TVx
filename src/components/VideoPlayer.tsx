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

void main()
{
    vec2 ndc_pos = vertPos;
    vec2 testVec = ndc_pos.xy / max(abs(ndc_pos.x), abs(ndc_pos.y));
    float len = max(1.0,length( testVec ));
    ndc_pos *= mix(1.0, mix(1.0,len,max(abs(ndc_pos.x), abs(ndc_pos.y))), u_distortion);
    vec2 texCoord = vec2(ndc_pos.s, -ndc_pos.t) * 0.52 + 0.5;

    float stripTile = texCoord.t * mix(10.0, 100.0, u_stripe);
    float stripFac = 1.0 + 0.25 * u_stripe * (step(0.5, stripTile-float(int(stripTile))) - 0.5);
    
    float vignette_factor = max(0.0, (length(ndc_pos) - u_vignette_radius) / (1.0 - u_vignette_radius));
    float vignette = 1.0 - vignette_factor * u_vignette;
    vignette = clamp(vignette, 0.0, 1.0);
    
    float radialShift = 1.0 + length(ndc_pos) * 0.5; // stronger at edges
    float shift = u_rgbshift * radialShift;
    
    float texR = texture2D( u_texture, texCoord.st-vec2(shift) ).r;
    float texG = texture2D( u_texture, texCoord.st ).g;
    float texB = texture2D( u_texture, texCoord.st+vec2(shift) ).b;
    
    float clip = step(0.0, texCoord.s) * step(texCoord.s, 1.0) * step(0.0, texCoord.t) * step(texCoord.t, 1.0); 
    gl_FragColor  = vec4( vec3(texR, texG, texB) * stripFac * vignette * clip, 1.0 );
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

        // Show loading video ONLY during channel changes (not same-channel buffering)
        if (settings.showLoadingVideo && isChannelChanging &&
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
      <Card className="aspect-video w-full flex items-center justify-center bg-gradient-card border-border">
        <p className="text-muted-foreground text-lg">Select a channel to start watching</p>
      </Card>
    );
  }

  return (
    <Card className={`${isFullGuide ? 'h-[50vh]' : 'aspect-video'} w-full overflow-hidden bg-black border-border shadow-glow rounded-3xl`} style={isFullGuide ? (isFullGuideExpanded ? { height: '100vh', width: 'calc(100vh * 16 / 9)', margin: '0 auto', boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5), 0 0 30px hsl(263 70% 60% / 0.3)' } : { height: '50vh', width: 'calc(50vh * 16 / 9)', margin: '0 auto', boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5), 0 0 30px hsl(263 70% 60% / 0.3)' }) : { boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5), 0 0 30px hsl(263 70% 60% / 0.3)', maxHeight: 'calc(100vh - 50px)' }}>
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
