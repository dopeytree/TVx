import { useEffect, useRef } from "react";
import { Channel, AppSettings } from "@/types/iptv";
import { Card } from "@/components/ui/card";
import Hls from 'hls.js';

interface VideoPlayerProps {
  channel: Channel | null;
  settings: AppSettings;
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

void main()
{
    vec2 ndc_pos = vertPos;
    vec2 testVec = ndc_pos.xy / max(abs(ndc_pos.x), abs(ndc_pos.y));
    float len = max(1.0,length( testVec ));
    ndc_pos *= mix(1.0, mix(1.0,len,max(abs(ndc_pos.x), abs(ndc_pos.y))), u_distortion);
    vec2 texCoord = vec2(ndc_pos.s, -ndc_pos.t) * 0.5 + 0.5;

    float stripTile = texCoord.t * mix(10.0, 100.0, u_stripe);
    float stripFac = 1.0 + 0.25 * u_stripe * (step(0.5, stripTile-float(int(stripTile))) - 0.5);
    
    float texR = texture2D( u_texture, texCoord.st-vec2(u_rgbshift) ).r;
    float texG = texture2D( u_texture, texCoord.st ).g;
    float texB = texture2D( u_texture, texCoord.st+vec2(u_rgbshift) ).b;
    
    float clip = step(0.0, texCoord.s) * step(texCoord.s, 1.0) * step(0.0, texCoord.t) * step(texCoord.t, 1.0); 
    gl_FragColor  = vec4( vec3(texR, texG, texB) * stripFac * clip, 1.0 );
}`;

export const VideoPlayer = ({ channel, settings }: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const hlsRef = useRef<Hls>();

  useEffect(() => {
    if (settings.vintageTV) {
      const setupWebGL = () => {
        if (!canvasRef.current || !videoRef.current) return;
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
          if (videoRef.current && videoRef.current.readyState >= videoRef.current.HAVE_CURRENT_DATA) {
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, videoRef.current);
          }
          gl.viewport(0, 0, canvas.width, canvas.height);
          gl.clearColor(0, 0, 0, 1);
          gl.clear(gl.COLOR_BUFFER_BIT);
          gl.uniform1i(u_texture, 0);
          gl.uniform1f(u_distortion, 0.12);
          gl.uniform1f(u_stripe, 0.004);
          gl.uniform1f(u_rgbshift, 0.001);
          gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
          animationRef.current = requestAnimationFrame(render);
        };
        render();
      };

      if (videoRef.current && channel) {
        const video = videoRef.current;
        if (Hls.isSupported()) {
          const hls = new Hls();
          hlsRef.current = hls;
          hls.loadSource(channel.url);
          hls.attachMedia(video);
          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            video.play().then(() => {
              setupWebGL();
            }).catch(err => console.error(err));
          });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = channel.url;
          video.addEventListener('loadedmetadata', () => {
            video.play().then(() => {
              setupWebGL();
            }).catch(err => console.error(err));
          });
        } else {
          // fallback to MP4
          video.src = channel.url.replace('.m3u8', '.mp4');
          video.addEventListener('loadedmetadata', () => {
            video.play().then(() => {
              setupWebGL();
            }).catch(err => console.error(err));
          });
        }
      }
    } else {
      // Normal video mode
      if (videoRef.current && channel) {
        const video = videoRef.current;
        if (Hls.isSupported()) {
          const hls = new Hls();
          hlsRef.current = hls;
          hls.loadSource(channel.url);
          hls.attachMedia(video);
          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            video.play().catch(err => console.error(err));
          });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = channel.url;
          video.addEventListener('loadedmetadata', () => {
            video.play().catch(err => console.error(err));
          });
        } else {
          video.src = channel.url.replace('.m3u8', '.mp4');
          video.addEventListener('loadedmetadata', () => {
            video.play().catch(err => console.error(err));
          });
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
    };
  }, [channel, settings.vintageTV]);

  if (!channel) {
    return (
      <Card className="aspect-video w-full flex items-center justify-center bg-gradient-card border-border">
        <p className="text-muted-foreground text-lg">Select a channel to start watching</p>
      </Card>
    );
  }

  return (
    <Card className="aspect-video w-full overflow-hidden bg-black border-border shadow-glow rounded-3xl" style={{ boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5), 0 0 30px hsl(263 70% 60% / 0.3)' }}>
      {settings.vintageTV ? (
        <>
          <video
            ref={videoRef}
            style={{ display: 'none' }}
            autoPlay
          >
            <source src={channel.url} type="application/x-mpegURL" />
            <source src={channel.url} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <canvas
            ref={canvasRef}
            className="w-full h-full cursor-pointer"
            onClick={() => videoRef.current?.play()}
          />
          <button className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded opacity-0 hover:opacity-100 transition-opacity" onClick={() => document.documentElement.requestFullscreen()}>
            Fullscreen
          </button>
        </>
      ) : (
        <video
          ref={videoRef}
          className="w-full h-full"
          controls
          autoPlay
          muted
        >
          <source src={channel.url} type="application/x-mpegURL" />
          <source src={channel.url} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      )}
    </Card>
  );
};
