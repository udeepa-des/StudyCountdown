import { useEffect, useRef } from "react";
import BG_IMAGE_URL from "../../assets/backgrounds/dark_forest_1.png";

// ── Swap this for any URL or a local import path ──────────────────────────────
// const BG_IMAGE_URL =
//   "https://images.unsplash.com/photo-1448375240586-882707db888b?w=1920&q=80";
// ─────────────────────────────────────────────────────────────────────────────

class Firefly {
  constructor(w, h) {
    this.w = w;
    this.h = h;
    this.x = Math.random() * w;
    this.y = Math.random() * h;
    this.s = Math.random() * 2 + 0.5;
    this.ang = Math.random() * 2 * Math.PI;
    this.v = (this.s * this.s) / 4;
    this.alpha = Math.random();
    this.alphaDir = Math.random() > 0.5 ? 0.008 : -0.008;
  }

  move() {
    this.x += this.v * Math.cos(this.ang);
    this.y += this.v * Math.sin(this.ang);
    this.ang += (Math.random() * 20 * Math.PI) / 180 - (10 * Math.PI) / 180;
    this.alpha += this.alphaDir;
    if (this.alpha <= 0 || this.alpha >= 1) this.alphaDir *= -1;
  }

  show(ctx) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.s, 0, 2 * Math.PI);
    ctx.fillStyle = `rgba(253, 219, 163, ${Math.max(0.1, this.alpha)})`;
    ctx.shadowBlur = 14;
    ctx.shadowColor = "rgba(253, 219, 163, 0.9)";
    ctx.fill();
    ctx.shadowBlur = 0;
  }
}

const FirefliesBackground = ({ imageUrl = BG_IMAGE_URL }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);
    let flies = [];
    let animId;
    let bgImage = null;

    const MAX_FLIES = 120;
    // Tweak this: lower = longer trails, higher = shorter trails (0.0 – 1.0)
    const TRAIL_OPACITY = 0.55;

    // ── Load background image ────────────────────────────────────────────────
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageUrl;
    img.onload = () => {
      bgImage = img;
    };

    const drawBackground = () => {
      if (bgImage) {
        // Cover-fit: fill canvas while preserving aspect ratio
        const scale = Math.max(w / bgImage.width, h / bgImage.height);
        const sw = bgImage.width * scale;
        const sh = bgImage.height * scale;
        const sx = (w - sw) / 2;
        const sy = (h - sh) / 2;
        ctx.drawImage(bgImage, sx, sy, sw, sh);

        // Dark tint so fireflies read well against any photo
        ctx.fillStyle = "rgba(5, 12, 3, 0.52)";
        ctx.fillRect(0, 0, w, h);
      } else {
        // Fallback while image loads
        ctx.fillStyle = "rgb(5, 12, 3)";
        ctx.fillRect(0, 0, w, h);
      }
    };
    // ────────────────────────────────────────────────────────────────────────

    const draw = () => {
      // Each frame: redraw bg at reduced alpha to fade previous firefly dots
      // Higher TRAIL_OPACITY → bg redraws more opaquely → shorter trails
      ctx.globalAlpha = TRAIL_OPACITY;
      drawBackground();
      ctx.globalAlpha = 1;

      if (flies.length < MAX_FLIES) {
        for (let j = 0; j < 5; j++) flies.push(new Firefly(w, h));
      }

      for (let i = flies.length - 1; i >= 0; i--) {
        flies[i].move();
        flies[i].show(ctx);
        if (
          flies[i].x < -10 ||
          flies[i].x > w + 10 ||
          flies[i].y < -10 ||
          flies[i].y > h + 10
        )
          flies.splice(i, 1);
      }

      animId = requestAnimationFrame(draw);
    };

    // Full-opacity initial draw so there's no flash
    drawBackground();
    draw();

    const handleResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
      ctx.globalAlpha = 1;
      drawBackground();
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
    };
  }, [imageUrl]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: -1,
        display: "block",
        pointerEvents: "none",
      }}
    />
  );
};

export default FirefliesBackground;
