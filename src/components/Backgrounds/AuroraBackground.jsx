import { useEffect, useRef } from "react";

// Smooth flowing aurora blobs using canvas + lerping color orbs
const AuroraBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);
    let animId;

    const orbs = [
      {
        x: w * 0.2,
        y: h * 0.3,
        vx: 0.3,
        vy: 0.2,
        r: 380,
        color: "rgba(100,60,200,",
      },
      {
        x: w * 0.7,
        y: h * 0.6,
        vx: -0.25,
        vy: 0.35,
        r: 420,
        color: "rgba(0,180,200,",
      },
      {
        x: w * 0.5,
        y: h * 0.8,
        vx: 0.2,
        vy: -0.3,
        r: 350,
        color: "rgba(180,60,220,",
      },
      {
        x: w * 0.1,
        y: h * 0.7,
        vx: 0.35,
        vy: -0.2,
        r: 300,
        color: "rgba(60,120,255,",
      },
      {
        x: w * 0.85,
        y: h * 0.2,
        vx: -0.2,
        vy: 0.28,
        r: 320,
        color: "rgba(0,220,160,",
      },
    ];

    const draw = () => {
      ctx.clearRect(0, 0, w, h);

      // Dark base
      ctx.fillStyle = "#0a0a1a";
      ctx.fillRect(0, 0, w, h);

      orbs.forEach((orb) => {
        orb.x += orb.vx;
        orb.y += orb.vy;

        // Bounce
        if (orb.x < -orb.r / 2) orb.vx = Math.abs(orb.vx);
        if (orb.x > w + orb.r / 2) orb.vx = -Math.abs(orb.vx);
        if (orb.y < -orb.r / 2) orb.vy = Math.abs(orb.vy);
        if (orb.y > h + orb.r / 2) orb.vy = -Math.abs(orb.vy);

        const grad = ctx.createRadialGradient(
          orb.x,
          orb.y,
          0,
          orb.x,
          orb.y,
          orb.r,
        );
        grad.addColorStop(0, orb.color + "0.22)");
        grad.addColorStop(0.5, orb.color + "0.10)");
        grad.addColorStop(1, orb.color + "0)");

        ctx.beginPath();
        ctx.arc(orb.x, orb.y, orb.r, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      });

      animId = requestAnimationFrame(draw);
    };

    draw();

    const handleResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

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

export default AuroraBackground;
