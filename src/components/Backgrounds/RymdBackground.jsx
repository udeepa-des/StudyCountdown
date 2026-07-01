import { useEffect, useRef } from "react";

const STAR_COUNT = 800;
const STAR_SIZE = 3;
const STAR_MIN_SCALE = 0.2;
const OVERFLOW_THRESHOLD = 50;

const RymdBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let width, height, scale;
    let stars = [];
    let pointerX = null,
      pointerY = null;
    let touchInput = false;
    let velocity = { x: 0, y: 0, tx: 0, ty: 0, z: 0.0005 };
    let animId;

    const generate = () => {
      const count = (window.innerWidth + window.innerHeight) / 8;
      stars = [];
      for (let i = 0; i < count; i++) {
        stars.push({
          x: 0,
          y: 0,
          z: STAR_MIN_SCALE + Math.random() * (1 - STAR_MIN_SCALE),
        });
      }
    };

    const placeStar = (star) => {
      star.x = Math.random() * width;
      star.y = Math.random() * height;
    };

    const recycleStar = (star) => {
      let direction = "z";
      const vx = Math.abs(velocity.x);
      const vy = Math.abs(velocity.y);

      if (vx > 1 || vy > 1) {
        let axis;
        if (vx > vy) axis = Math.random() < vx / (vx + vy) ? "h" : "v";
        else axis = Math.random() < vy / (vx + vy) ? "v" : "h";
        if (axis === "h") direction = velocity.x > 0 ? "l" : "r";
        else direction = velocity.y > 0 ? "t" : "b";
      }

      star.z = STAR_MIN_SCALE + Math.random() * (1 - STAR_MIN_SCALE);

      if (direction === "z") {
        star.z = 0.1;
        star.x = Math.random() * width;
        star.y = Math.random() * height;
      } else if (direction === "l") {
        star.x = -OVERFLOW_THRESHOLD;
        star.y = height * Math.random();
      } else if (direction === "r") {
        star.x = width + OVERFLOW_THRESHOLD;
        star.y = height * Math.random();
      } else if (direction === "t") {
        star.x = width * Math.random();
        star.y = -OVERFLOW_THRESHOLD;
      } else if (direction === "b") {
        star.x = width * Math.random();
        star.y = height + OVERFLOW_THRESHOLD;
      }
    };

    const resize = () => {
      scale = window.devicePixelRatio || 1;
      width = window.innerWidth * scale;
      height = window.innerHeight * scale;
      canvas.width = width;
      canvas.height = height;
      stars.forEach(placeStar);
    };

    const update = () => {
      velocity.tx *= 0.96;
      velocity.ty *= 0.96;
      velocity.x += (velocity.tx - velocity.x) * 0.8;
      velocity.y += (velocity.ty - velocity.y) * 0.8;

      stars.forEach((star) => {
        star.x += velocity.x * star.z;
        star.y += velocity.y * star.z;
        star.x += (star.x - width / 2) * velocity.z * star.z;
        star.y += (star.y - height / 2) * velocity.z * star.z;
        star.z += velocity.z;
        if (
          star.x < -OVERFLOW_THRESHOLD ||
          star.x > width + OVERFLOW_THRESHOLD ||
          star.y < -OVERFLOW_THRESHOLD ||
          star.y > height + OVERFLOW_THRESHOLD
        )
          recycleStar(star);
      });
    };

    const render = () => {
      stars.forEach((star) => {
        ctx.beginPath();
        ctx.lineCap = "round";
        ctx.lineWidth = STAR_SIZE * star.z * scale;
        ctx.globalAlpha = 0.5 + 0.5 * Math.random();
        ctx.strokeStyle = "#fff";
        ctx.moveTo(star.x, star.y);
        let tailX = velocity.x * 2;
        let tailY = velocity.y * 2;
        if (Math.abs(tailX) < 0.1) tailX = 0.5;
        if (Math.abs(tailY) < 0.1) tailY = 0.5;
        ctx.lineTo(star.x + tailX, star.y + tailY);
        ctx.stroke();
      });
    };

    const step = () => {
      ctx.clearRect(0, 0, width, height);
      update();
      render();
      animId = requestAnimationFrame(step);
    };

    const movePointer = (x, y) => {
      if (typeof pointerX === "number" && typeof pointerY === "number") {
        const ox = x - pointerX;
        const oy = y - pointerY;
        velocity.tx += (ox / 8) * scale * (touchInput ? 1 : -1);
        velocity.ty += (oy / 8) * scale * (touchInput ? 1 : -1);
      }
      pointerX = x;
      pointerY = y;
    };

    const onMouseMove = (e) => {
      touchInput = false;
      movePointer(e.clientX, e.clientY);
    };
    const onTouchMove = (e) => {
      touchInput = true;
      movePointer(e.touches[0].clientX, e.touches[0].clientY);
      e.preventDefault();
    };
    const onMouseLeave = () => {
      pointerX = null;
      pointerY = null;
    };

    generate();
    resize();
    step();

    window.addEventListener("resize", resize);
    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("touchmove", onTouchMove, { passive: false });
    canvas.addEventListener("mouseleave", onMouseLeave);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("mousemove", onMouseMove);
      canvas.removeEventListener("touchmove", onTouchMove);
      canvas.removeEventListener("mouseleave", onMouseLeave);
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
        background:
          "radial-gradient(circle at top right, rgba(121,68,154,0.25), transparent 60%), radial-gradient(circle at 20% 80%, rgba(41,196,255,0.2), transparent 60%), #000",
        pointerEvents: "auto",
      }}
    />
  );
};

export default RymdBackground;
