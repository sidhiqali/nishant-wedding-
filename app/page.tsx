import {
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type TouchEvent as ReactTouchEvent,
  type UIEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

const NAV_ITEMS = [
  ["home", "Home"],
  ["save-the-date", "Save the Date"],
  ["countdown", "Countdown"],
  ["events", "Events"],
  ["venue", "Venue"],
  ["gallery", "Gallery"],
  ["weather", "Weather"],
] as const;

// Times are IST; the same slots live in public/calendar/*.ics for Apple and Outlook.
const EVENTS = [
  {
    name: "Cocktail & Sangeet",
    date: "Monday, 30 November 2026",
    time: "7:30 PM onwards",
    venue: "Ballroom",
    theme: "Theme: All that Glitters",
    emoji: "💃",
    image: "/assets/event-sangeet.jpg",
    wash: "wash-sangeet",
    slug: "sangeet",
    start: "20261130T193000",
    end: "20261130T233000",
  },
  {
    name: "Haldi",
    date: "Tuesday, 1 December 2026",
    time: "9:00 AM onwards",
    venue: "Poolside Alfresco",
    theme: "Theme: Pastels & Floral (no yellow)",
    emoji: "🌸",
    image: "/assets/event-haldi.jpg",
    wash: "wash-haldi",
    slug: "haldi",
    start: "20261201T090000",
    end: "20261201T120000",
  },
  {
    name: "The Wedding",
    date: "Tuesday, 1 December 2026",
    time: "3:00 PM onwards",
    venue: "Wedding Lawn",
    theme: "Theme: Elegant & Effortless",
    emoji: "💍",
    image: "/assets/event-wedding.jpg",
    wash: "wash-wedding",
    slug: "wedding",
    start: "20261201T150000",
    end: "20261201T190000",
  },
  {
    name: "The Celebration Continues",
    date: "Tuesday, 1 December 2026",
    time: "8:00 PM onwards",
    venue: "Wedding Lawn",
    theme: "A live band awaits after the “I do”… ✨",
    emoji: "🎶",
    image: "/assets/event-celebration.jpg",
    wash: "wash-reception",
    slug: "celebration",
    start: "20261201T200000",
    end: "20261201T233000",
  },
];

const GALLERY = [
  { src: "/assets/gallery-1.jpg", alt: "City lights & happy hearts" },
  { src: "/assets/gallery-2.jpg", alt: "Caught in a candid moment" },
  { src: "/assets/gallery-3.jpg", alt: "The official beginning of forever" },
  { src: "/assets/gallery-4.jpg", alt: "A quiet moment together" },
  { src: "/assets/gallery-5.jpg", alt: "From London, with love" },
];

const RSVP_CONTACTS = [
  ["Bride’s family", "Munish Vohra", "+91 93122 49854", "tel:+919312249854"],
  ["Groom’s family", "Nishant Dutt", "+44 7825 596713", "https://wa.me/447825596713"],
] as const;

const WEATHER = [
  { date: "Monday, 30 November", events: "Cocktail & Sangeet", high: 21, low: 10, note: "Sunny & crisp", icon: "sun" },
  { date: "Tuesday, 1 December", events: "Haldi & Wedding", high: 20, low: 9, note: "Clear, starlit evening", icon: "moon" },
] as const;

type Particle = {
  id: number;
  left: number;
  delay: number;
  duration: number;
  size: number;
  drift: number;
  rotate: number;
  src: string;
  opacity: number;
};

function googleCalendarUrl(event: (typeof EVENTS)[number]) {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `${event.name} · Tanvi & Nishant`,
    dates: `${event.start}/${event.end}`,
    ctz: "Asia/Kolkata",
    location: `${event.venue}, Fairfield by Marriott, Dehradun`,
    details: event.theme,
  });
  return `https://calendar.google.com/calendar/render?${params}`;
}

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function useScrolled(threshold: number) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);
  return scrolled;
}

function useRevealOnScroll(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    const elements = document.querySelectorAll<HTMLElement>(".reveal-on-scroll");
    if (!("IntersectionObserver" in window)) {
      elements.forEach((element) => element.classList.add("is-visible"));
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [enabled]);
}

function EnvelopeIntro({ onOpened }: { onOpened: () => void }) {
  const [state, setState] = useState<"idle" | "opening">("idle");
  const open = () => {
    if (state !== "idle") return;
    startMusic();
    setState("opening");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.setTimeout(onOpened, reduceMotion ? 300 : 2700);
  };

  return (
    <div className={`envelope-screen ${state === "opening" ? "is-opening" : ""}`} aria-label="Wedding invitation envelope">
      <div className="envelope-radial" />
      <div className={`envelope-stage ${state === "opening" ? "is-opening" : ""}`}>
        <p className="eyebrow envelope-eyebrow">An Invitation Awaits</p>
        <button
          type="button"
          className="envelope-button"
          onClick={open}
          disabled={state !== "idle"}
          aria-label="Open the royal envelope"
        >
          <span className="envelope-art-wrap">
            <span className="envelope-inside" />
            <span className="envelope-card" aria-hidden="true">
              <small>Together with their families</small>
              <b>Tanvi &amp; Nishant</b>
              <i>✦</i>
              <small>30 Nov – 1 Dec 2026</small>
              <small>Dehradun</small>
            </span>
            <img className="envelope-pocket" src="/assets/envelope.png" alt="Royal wedding envelope" />
            <span className="seal-cover seal-bottom" aria-hidden="true">
              <span className="seal-monogram">N&amp;T</span>
            </span>
            <span className="envelope-flap" aria-hidden="true">
              <img src="/assets/envelope.png" alt="" />
              <span className="envelope-lining" />
              <span className="seal-cover seal-top">
                <span className="seal-monogram">N&amp;T</span>
              </span>
            </span>
          </span>
        </button>
        <p className="envelope-prompt">✦ Tap the seal to open ✦</p>
      </div>
    </div>
  );
}

function AmbientPetals() {
  const [petals, setPetals] = useState<Particle[]>([]);

  useEffect(() => {
    const sources = ["/assets/petal-red.png", "/assets/petal-pink.png", "/assets/petal-gold.png"];
    setPetals(
      Array.from({ length: 20 }, (_, id) => ({
        id,
        left: Math.random() * 100,
        delay: Math.random() * 12,
        duration: 10 + Math.random() * 14,
        size: 18 + Math.random() * 28,
        drift: -60 + Math.random() * 120,
        rotate: 180 + Math.random() * 540,
        src: sources[Math.floor(Math.random() * sources.length)],
        opacity: 0.55 + Math.random() * 0.4,
      })),
    );
  }, []);

  return (
    <div className="petal-layer" aria-hidden="true">
      {petals.map((petal) => (
        <span
          key={petal.id}
          className="falling-petal"
          style={
            {
              left: `${petal.left}%`,
              width: petal.size,
              height: petal.size,
              opacity: petal.opacity,
              animationDuration: `${petal.duration}s`,
              animationDelay: `${petal.delay}s`,
              "--petal-drift": `${petal.drift}px`,
              "--petal-rotate": `${petal.rotate}deg`,
            } as CSSProperties
          }
        >
          <img src={petal.src} alt="" />
        </span>
      ))}
    </div>
  );
}

let music: HTMLAudioElement | null = null;

// iOS only lets audio start from inside the tap handler, so the envelope tap calls this directly.
function startMusic() {
  if (music) return;
  const audio = new Audio("/assets/wedding-music.m4a");
  audio.loop = true;
  audio.volume = 0.45;
  audio.play().catch(() => undefined);
  music = audio;
}

function BackgroundMusic() {
  const [playing, setPlaying] = useState(() => Boolean(music && !music.paused));

  useEffect(() => {
    const audio = music;
    if (!audio) return;
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    // Mobile browsers keep audio running after the guest switches apps.
    let resumeOnReturn = false;
    const onVisibility = () => {
      if (document.hidden) {
        resumeOnReturn = !audio.paused;
        audio.pause();
      } else if (resumeOnReturn) {
        audio.play().catch(() => undefined);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  const toggle = () => {
    if (!music) startMusic();
    else if (music.paused) music.play().catch(() => undefined);
    else music.pause();
  };

  return (
    <button
      type="button"
      className={`music-toggle ${playing ? "is-playing" : ""}`}
      onClick={toggle}
      aria-label={playing ? "Pause music" : "Play music"}
      aria-pressed={playing}
    >
      <span />
      <span />
      <span />
      <span />
    </button>
  );
}

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const scrolled = useScrolled(60);

  const navigate = (id: string) => {
    scrollToSection(id);
    setMenuOpen(false);
  };

  return (
    <header className={`site-header ${scrolled ? "is-scrolled" : ""}`}>
      <nav className="nav-shell" aria-label="Wedding website navigation">
        <button className="monogram" onClick={() => navigate("home")} aria-label="Go to top">
          N <span>&amp;</span> T
        </button>
        <ul className="desktop-nav">
          {NAV_ITEMS.map(([id, label]) => (
            <li key={id}>
              <button onClick={() => navigate(id)}>{label}</button>
            </li>
          ))}
        </ul>
        <button
          type="button"
          className="menu-toggle"
          onClick={() => setMenuOpen((value) => !value)}
          aria-expanded={menuOpen}
          aria-label="Toggle menu"
        >
          {menuOpen ? "×" : "☰"}
        </button>
      </nav>
      {menuOpen && (
        <div className="mobile-menu">
          <ul>
            {NAV_ITEMS.map(([id, label]) => (
              <li key={id}>
                <button onClick={() => navigate(id)}>{label}</button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  );
}

const MARIGOLD_RINGS = [
  { count: 14, distance: 13, rx: 5.5, ry: 9.5, fill: "#d9751b", turn: 0 },
  { count: 12, distance: 8.5, rx: 4.6, ry: 7.5, fill: "#ee9728", turn: 15 },
  { count: 9, distance: 4.2, rx: 3.4, ry: 5.2, fill: "#f6c445", turn: 0 },
];

// [x, y, angle, scale, delay]; each half of the corner is mirrored across the diagonal
const FLORAL_LEAVES = [
  [42, 28, -112, 1, 0.3],
  [62, 54, 18, 1.05, 0.35],
  [88, 22, -48, 0.9, 0.5],
  [102, 17, 32, 0.8, 0.62],
  [124, 13, -40, 0.85, 0.74],
  [162, 20, 40, 0.8, 0.9],
  [180, 27, -34, 0.75, 1.02],
  [202, 26, 44, 0.68, 1.14],
  [92, 84, 58, 0.72, 0.8],
] as const;

function Blossom({ petal, heart, slim = false }: { petal: string; heart: string; slim?: boolean }) {
  return (
    <>
      {Array.from({ length: 5 }, (_, i) => (
        <ellipse key={i} cy={slim ? -7 : -6.5} rx={slim ? 3.2 : 5.2} ry={slim ? 7.2 : 7} fill={petal} stroke="var(--vine)" strokeWidth={0.5} transform={`rotate(${i * 72})`} />
      ))}
      <circle r={slim ? 2 : 2.8} fill={heart} />
    </>
  );
}

function FloralHalf() {
  return (
    <>
      <path className="vine" pathLength={1} d="M66 36C90 18 116 12 142 16S190 30 212 22C226 17 229 5 219 4C211 3 210 13 218 13" />
      <path className="vine" pathLength={1} d="M150 20C158 34 170 40 186 40" />
      <path className="vine" pathLength={1} d="M68 64C84 78 98 90 114 94" />
      {FLORAL_LEAVES.map(([x, y, angle, scale, at]) => (
        <g key={`${x}-${y}`} transform={`translate(${x} ${y}) rotate(${angle}) scale(${scale})`}>
          <path className="leaf" style={{ "--at": `${at}s` } as CSSProperties} d="M0 0C5-6 15-6 20 0C15 6 5 6 0 0ZM2 0H17" />
        </g>
      ))}
      <g transform="translate(142 16)">
        <g className="bloom" style={{ "--at": "0.9s" } as CSSProperties}>
          <Blossom petal="#d95a74" heart="#f2cf7a" />
        </g>
      </g>
      <g transform="translate(188 40)">
        <g className="bloom" style={{ "--at": "1.35s" } as CSSProperties}>
          <Blossom petal="#fbf6ec" heart="#e4c77d" slim />
        </g>
      </g>
      <g transform="translate(116 95)">
        <g className="bloom" style={{ "--at": "1.15s" } as CSSProperties}>
          <Blossom petal="#fbf6ec" heart="#e4c77d" slim />
        </g>
      </g>
    </>
  );
}

function CornerFloral({ position, delay = 0 }: { position: "tl" | "tr" | "bl" | "br"; delay?: number }) {
  return (
    <div className={`corner-floral corner-floral-${position}`} aria-hidden="true">
      <svg className="floral-art reveal-on-scroll" viewBox="0 0 240 240" style={{ "--floral-delay": `${delay}s` } as CSSProperties}>
        <FloralHalf />
        <g transform="matrix(0 1 1 0 0 0)">
          <FloralHalf />
        </g>
        <g transform="translate(48 48)">
          <g className="bloom" style={{ "--at": "0.1s" } as CSSProperties}>
            {MARIGOLD_RINGS.map((ring) =>
              Array.from({ length: ring.count }, (_, i) => (
                <ellipse key={`${ring.fill}-${i}`} cy={-ring.distance} rx={ring.rx} ry={ring.ry} fill={ring.fill} stroke="#b5601a" strokeWidth={0.5} transform={`rotate(${ring.turn + (i * 360) / ring.count})`} />
              )),
            )}
            <circle r={3} fill="#a9500e" />
          </g>
        </g>
      </svg>
    </div>
  );
}

function Divider({ light = false }: { light?: boolean }) {
  return (
    <div className={`ornament-divider ${light ? "is-light" : ""}`} aria-hidden="true">
      <span />
      <b>✦</b>
      <span />
    </div>
  );
}

function SectionTitle({
  eyebrow,
  title,
  copy,
  light = false,
}: {
  eyebrow: string;
  title: string;
  copy?: string;
  light?: boolean;
}) {
  return (
    <div className={`section-title reveal-on-scroll ${light ? "is-light" : ""}`}>
      <p className="eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
      <Divider light={light} />
      {copy && <p className="section-copy">{copy}</p>}
    </div>
  );
}

function CelebrationBurst({ active, mode }: { active: boolean; mode: "date" | "fireworks" }) {
  const confetti = useMemo(
    () =>
      Array.from({ length: 140 }, (_, id) => ({
        id,
        left: Math.random() * 100,
        delay: Math.random() * 0.6,
        duration: 2.5 + Math.random() * 2.5,
        size: 6 + Math.random() * 10,
        color: ["#b8112e", "#d4a017", "#f4c98c", "#e89bb0", "#7a1c2e", "#f6e3a3"][id % 6],
        rotate: Math.random() * 360,
      })),
    [],
  );
  const hearts = useMemo(
    () =>
      Array.from({ length: 30 }, (_, id) => ({
        id,
        left: Math.random() * 100,
        delay: Math.random() * 0.8,
        duration: 3 + Math.random() * 2.5,
        size: 18 + Math.random() * 22,
      })),
    [],
  );
  const fireworks = useMemo(
    () =>
      Array.from({ length: 10 }, (_, id) => ({
        id,
        x: 15 + Math.random() * 70,
        y: 15 + Math.random() * 50,
        color: ["#f4c98c", "#e89bb0", "#b8112e", "#d4a017", "#7a1c2e", "#fff3b0"][id % 6],
        delay: id * 0.25,
      })),
    [],
  );

  if (!active) return null;

  if (mode === "fireworks") {
    return (
      <div className="celebration-layer" aria-hidden="true">
        {fireworks.map((firework) => (
          <span
            key={firework.id}
            className="firework"
            style={{ left: `${firework.x}%`, top: `${firework.y}%`, animationDelay: `${firework.delay}s` }}
          >
            {Array.from({ length: 24 }, (_, particle) => {
              const angle = (particle / 24) * Math.PI * 2;
              const distance = 90 + Math.random() * 40;
              return (
                <i
                  key={particle}
                  style={
                    {
                      background: firework.color,
                      boxShadow: `0 0 10px ${firework.color}, 0 0 20px ${firework.color}`,
                      animationDelay: `${firework.delay}s`,
                      "--firework-end": `translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance}px)`,
                    } as CSSProperties
                  }
                />
              );
            })}
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className="celebration-layer" aria-hidden="true">
      {confetti.map((piece) => (
        <i
          key={`c-${piece.id}`}
          className="confetti"
          style={{
            left: `${piece.left}%`,
            width: piece.size,
            height: piece.size * 0.4,
            background: piece.color,
            animationDuration: `${piece.duration}s`,
            animationDelay: `${piece.delay}s`,
            transform: `rotate(${piece.rotate}deg)`,
          }}
        />
      ))}
      {hearts.map((heart) => (
        <i
          key={`h-${heart.id}`}
          className="rising-heart"
          style={{
            left: `${heart.left}%`,
            fontSize: heart.size,
            animationDuration: `${heart.duration}s`,
            animationDelay: `${heart.delay}s`,
          }}
        >
          ♥
        </i>
      ))}
    </div>
  );
}

function ScratchCard({
  message,
  hint,
  onReveal,
  tall = false,
}: {
  message: string;
  hint: string;
  onReveal: () => void;
  tall?: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawingRef = useRef(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  const completedRef = useRef(false);
  const [revealed, setRevealed] = useState(false);

  const setupCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || revealed) return;
    const parent = canvas.parentElement;
    if (!parent) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = parent.clientWidth * dpr;
    canvas.height = parent.clientHeight * dpr;
    const context = canvas.getContext("2d");
    if (!context) return;
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    const gradient = context.createLinearGradient(0, 0, parent.clientWidth, parent.clientHeight);
    gradient.addColorStop(0, "#e8c163");
    gradient.addColorStop(0.5, "#b58632");
    gradient.addColorStop(1, "#7a5418");
    context.globalCompositeOperation = "source-over";
    context.fillStyle = gradient;
    context.fillRect(0, 0, parent.clientWidth, parent.clientHeight);
    context.fillStyle = "rgba(255,255,255,.08)";
    for (let i = 0; i < 40; i += 1) {
      context.beginPath();
      context.arc(Math.random() * parent.clientWidth, Math.random() * parent.clientHeight, 2 + Math.random() * 3, 0, Math.PI * 2);
      context.fill();
    }
    context.fillStyle = "rgba(255,255,255,.9)";
    context.textAlign = "center";
    context.font = "600 14px Cinzel, serif";
    context.fillText("✦ SCRATCH TO REVEAL ✦", parent.clientWidth / 2, parent.clientHeight / 2 - 10);
    context.font = "italic 13px 'Cormorant Garamond', serif";
    context.fillText(hint, parent.clientWidth / 2, parent.clientHeight / 2 + 14);
  }, [hint, revealed]);

  useEffect(() => {
    setupCanvas();
    window.addEventListener("resize", setupCanvas);
    return () => window.removeEventListener("resize", setupCanvas);
  }, [setupCanvas]);

  const pointFromEvent = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const bounds = canvas.getBoundingClientRect();
    return { x: event.clientX - bounds.left, y: event.clientY - bounds.top };
  };

  const reveal = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    setRevealed(true);
    onReveal();
  }, [onReveal]);

  const draw = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return;
    const canvas = canvasRef.current;
    const point = pointFromEvent(event);
    const context = canvas?.getContext("2d");
    if (!canvas || !point || !context) return;
    context.globalCompositeOperation = "destination-out";
    context.lineWidth = 36;
    context.lineCap = "round";
    context.lineJoin = "round";
    context.beginPath();
    if (lastPointRef.current) {
      context.moveTo(lastPointRef.current.x, lastPointRef.current.y);
      context.lineTo(point.x, point.y);
    } else {
      context.arc(point.x, point.y, 18, 0, Math.PI * 2);
    }
    context.stroke();
    context.fill();
    lastPointRef.current = point;

    if (Math.random() < 0.08) {
      const data = context.getImageData(0, 0, canvas.width, canvas.height).data;
      let clear = 0;
      let sampled = 0;
      for (let index = 3; index < data.length; index += 200 * 4) {
        sampled += 1;
        if (data[index] === 0) clear += 1;
      }
      if (clear / sampled > 0.45) reveal();
    }
  };

  const pointerDown = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    drawingRef.current = true;
    lastPointRef.current = pointFromEvent(event);
    draw(event);
  };

  const pointerUp = () => {
    drawingRef.current = false;
    lastPointRef.current = null;
  };

  return (
    <div className={`scratch-card ${tall ? "is-tall" : ""}`}>
      <div className="scratch-message">
        <span>✦</span>
        <p>{message}</p>
      </div>
      <canvas
        ref={canvasRef}
        className={revealed ? "is-revealed" : ""}
        onPointerDown={pointerDown}
        onPointerMove={draw}
        onPointerUp={pointerUp}
        onPointerCancel={pointerUp}
        onPointerLeave={pointerUp}
        aria-label={hint}
      />
      {!revealed && (
        <button className="scratch-accessible" onClick={reveal} type="button">
          Reveal without scratching
        </button>
      )}
    </div>
  );
}

function ScrollHint() {
  const scrolled = useScrolled(40);
  return (
    <div className={`scroll-hint ${scrolled ? "is-hidden" : ""}`}>
      <button onClick={() => scrollToSection("save-the-date")} tabIndex={scrolled ? -1 : 0}>
        <span aria-hidden="true">
          <svg viewBox="0 0 24 24"><path d="M6 9l6 6 6-6" /></svg>
        </span>
        Scroll down
      </button>
    </div>
  );
}

function Hero() {
  return (
    <section id="home" className="hero-section ivory-section">
      <CornerFloral position="tl" />
      <CornerFloral position="tr" delay={0.6} />
      <div className="hero-inner">
        <p className="eyebrow hero-animate delay-01">✦&nbsp;Together with their families&nbsp;✦</p>
        <div className="hero-name hero-animate delay-03">
          <h1>Tanvi</h1>
          <p>( D/o Mrs. Ritu &amp; Mr. Munish Vohra )</p>
        </div>
        <div className="hero-with hero-animate delay-055"><span />&amp;<span /></div>
        <div className="hero-name hero-animate delay-07">
          <h1>Nishant</h1>
          <p>( S/o Mrs. Sarita &amp; Dr. Madanlal Dutt )</p>
        </div>
        <p className="hero-quote hero-animate delay-11">
          “Two souls, one heart, woven by destiny, request the joy of your presence as we begin our forever.”
        </p>
        <div className="hero-details hero-animate delay-13">
          <span>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <rect x="3.5" y="5" width="17" height="15" rx="2" />
              <path d="M3.5 9.5h17M8 3v4M16 3v4" />
            </svg>
            30 Nov – 1 Dec 2026
          </span>
          <b aria-hidden="true">✦</b>
          <span>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z" />
              <circle cx="12" cy="10" r="2.4" />
            </svg>
            Dehradun, Uttarakhand
          </span>
        </div>
      </div>
      <CornerFloral position="bl" delay={1.1} />
      <CornerFloral position="br" delay={0.4} />
      <ScrollHint />
    </section>
  );
}

function SaveTheDate() {
  const [burst, setBurst] = useState(false);
  const reveal = () => {
    setBurst(false);
    requestAnimationFrame(() => setBurst(true));
    window.setTimeout(() => setBurst(false), 6500);
  };
  return (
    <section id="save-the-date" className="blush-section section-pad">
      <CelebrationBurst active={burst} mode="date" />
      <div className="section-shell narrow-shell">
        <SectionTitle eyebrow="Mark Your Calendar" title="Save the Date" />
        <div className="date-card reveal-on-scroll stagger-1">
          <span className="card-icon">▣</span>
          <p className="eyebrow">Two Days of Celebration</p>
          <div className="date-scratch-wrap">
            <ScratchCard message="30 November — 1 December, 2026 ✦" hint="Scratch the gold to reveal our wedding dates" onReveal={reveal} />
            <p className="script-note">Swipe the gold to unveil the magic</p>
          </div>
          <p className="location-line">⌖ Fairfield by Marriott · Dehradun</p>
        </div>
      </div>
      <CornerFloral position="bl" delay={1.1} />
      <CornerFloral position="br" delay={0.4} />
    </section>
  );
}

const WEDDING_TIME = new Date("2026-12-01T15:00:00+05:30").getTime();

function getRemaining() {
  const remaining = Math.max(0, WEDDING_TIME - Date.now());
  return {
    Days: Math.floor(remaining / 86400000),
    Hours: Math.floor((remaining / 3600000) % 24),
    Minutes: Math.floor((remaining / 60000) % 60),
    Seconds: Math.floor((remaining / 1000) % 60),
  };
}

function Countdown() {
  const [remaining, setRemaining] = useState(getRemaining);
  const [revealed, setRevealed] = useState(false);
  const [fireworks, setFireworks] = useState(false);

  useEffect(() => {
    const interval = window.setInterval(() => setRemaining(getRemaining()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  const reveal = () => {
    setRevealed(true);
    setFireworks(true);
    window.setTimeout(() => setFireworks(false), 5000);
  };

  return (
    <section id="countdown" className="velvet-section section-pad countdown-section">
      <CelebrationBurst active={fireworks} mode="fireworks" />
      <div className="twinkle-field" aria-hidden="true">
        {Array.from({ length: 40 }, (_, index) => <i key={index} style={{ left: `${(index * 37) % 100}%`, top: `${(index * 53) % 100}%`, animationDelay: `${(index % 9) * 0.31}s` }} />)}
      </div>
      <div className="section-shell narrow-shell">
        <SectionTitle eyebrow="The Countdown Begins" title="Counting the Moments" light />
        <div className="countdown-card reveal-on-scroll stagger-2">
          <div className="countdown-grid">
            {Object.entries(remaining).map(([label, value]) => (
              <div className="countdown-unit" key={label}>
                <strong>{String(value).padStart(2, "0")}</strong>
                <span>{label}</span>
              </div>
            ))}
          </div>
          <p>Until forever begins ✦ 1 December 2026</p>
          {!revealed && (
            <div className="countdown-scratch">
              <ScratchCard message="✦ Let the fireworks fly ✦" hint="Scratch to unveil the countdown" onReveal={reveal} tall />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function Events() {
  return (
    <section id="events" className="ivory-section section-pad">
      <CornerFloral position="tl" />
      <CornerFloral position="tr" delay={0.5} />
      <div className="section-shell">
        <SectionTitle eyebrow="Two Days of Celebration" title="Wedding Events" />
        <div className="event-grid">
          {EVENTS.map((event, index) => (
            <article className={`event-card reveal-on-scroll stagger-${(index % 4) + 1}`} key={event.name}>
              <div className="event-image">
                <img src={event.image} alt={event.name} loading="lazy" />
                <span />
              </div>
              <div className={`event-copy ${event.wash}`}>
                <div className="event-meta"><b>{event.emoji}</b><span>Ceremony {index + 1}</span></div>
                <h3>{event.name}</h3>
                <i className="gold-rule" />
                <ul>
                  <li><span>▣</span>{event.date}</li>
                  <li><span>◷</span>{event.time}</li>
                  <li><span>⌖</span>{event.venue}</li>
                  <li><span>✦</span><em>{event.theme}</em></li>
                </ul>
                <details className="event-calendar">
                  <summary>＋ Add to calendar</summary>
                  <div>
                    <a href={googleCalendarUrl(event)} target="_blank" rel="noreferrer">Google Calendar</a>
                    <a href={`/calendar/${event.slug}.ics`}>iPhone / Outlook</a>
                  </div>
                </details>
              </div>
            </article>
          ))}
        </div>
      </div>
      <CornerFloral position="bl" delay={1.2} />
      <CornerFloral position="br" delay={0.3} />
    </section>
  );
}

function Venue() {
  return (
    <section id="venue" className="blush-section section-pad">
      <div className="section-shell">
        <SectionTitle eyebrow="Where We Begin Forever" title="The Venue" />
        <div className="venue-hero reveal-on-scroll stagger-1">
          <img src="/assets/venue-dehradun.jpg" alt="Luxury wedding venue in the Mussoorie foothills" loading="lazy" />
          <div><h3>Fairfield by Marriott</h3><p>Dehradun, Uttarakhand</p></div>
        </div>
        <div className="venue-details">
          <article className="venue-copy reveal-on-scroll stagger-2">
            <span className="card-icon">⌖</span>
            <h3>Fairfield by Marriott</h3>
            <p className="eyebrow">Dehradun, Uttarakhand</p>
            <p>Set against the calm beauty of the Mussoorie foothills, Fairfield by Marriott offers a warm, contemporary setting for two unforgettable days of celebration.</p>
            <dl>
              <div><dt>Location</dt><dd>Dehradun, Uttarakhand</dd></div>
              <div><dt>Parking</dt><dd>Valet and on-site parking available</dd></div>
              <div><dt>Nearest airport</dt><dd>Jolly Grant Airport (DED)</dd></div>
            </dl>
            <a className="directions-button" target="_blank" rel="noreferrer" href="https://www.google.com/maps/search/?api=1&query=Fairfield+by+Marriott+Dehradun">⌖ Get Directions</a>
          </article>
          <div className="map-frame reveal-on-scroll stagger-3">
            <iframe title="Wedding venue map — Fairfield by Marriott Dehradun" src="https://www.google.com/maps?q=Fairfield+by+Marriott+Dehradun&output=embed" width="100%" height="450" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
          </div>
        </div>
      </div>
    </section>
  );
}

function Lightbox({ index, onClose, onNavigate }: { index: number; onClose: () => void; onNavigate: (index: number) => void }) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowRight") onNavigate((index + 1) % GALLERY.length);
      if (event.key === "ArrowLeft") onNavigate((index - 1 + GALLERY.length) % GALLERY.length);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [index, onClose, onNavigate]);

  const touchStartX = useRef<number | null>(null);
  const onTouchEnd = (event: ReactTouchEvent) => {
    if (touchStartX.current === null) return;
    const dx = event.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(dx) < 50) return;
    onNavigate((index + (dx < 0 ? 1 : -1) + GALLERY.length) % GALLERY.length);
  };

  return (
    <div
      className="lightbox"
      role="dialog"
      aria-modal="true"
      aria-label="Wedding photo viewer"
      onClick={onClose}
      onTouchStart={(event) => { touchStartX.current = event.touches[0].clientX; }}
      onTouchEnd={onTouchEnd}
    >
      <button className="lightbox-close" onClick={onClose} aria-label="Close">×</button>
      <button className="lightbox-prev" onClick={(event) => { event.stopPropagation(); onNavigate((index - 1 + GALLERY.length) % GALLERY.length); }} aria-label="Previous">‹</button>
      <button className="lightbox-next" onClick={(event) => { event.stopPropagation(); onNavigate((index + 1) % GALLERY.length); }} aria-label="Next">›</button>
      <div className="lightbox-image" onClick={(event) => event.stopPropagation()}>
        <span />
        <img src={GALLERY[index].src} alt={GALLERY[index].alt} />
        <p>{GALLERY[index].alt} — {index + 1} / {GALLERY.length}</p>
      </div>
    </div>
  );
}

function Gallery() {
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState<number | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const frameRef = useRef(0);
  const close = useCallback(() => setOpen(null), []);
  const navigate = useCallback((index: number) => setOpen(index), []);

  const showCard = (index: number) => {
    trackRef.current?.children[index]?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    setActive(index);
  };

  // Desktop picks the active card on hover; the centred-card tracking only runs where swipe snapping is on.
  const onScroll = (event: UIEvent<HTMLDivElement>) => {
    if (!window.matchMedia("(max-width: 767px)").matches) return;
    const scroller = event.currentTarget;
    cancelAnimationFrame(frameRef.current);
    frameRef.current = requestAnimationFrame(() => {
      const box = scroller.getBoundingClientRect();
      const center = box.left + box.width / 2;
      const cards = [...(trackRef.current?.children ?? [])];
      const distances = cards.map((card) => {
        const rect = card.getBoundingClientRect();
        return Math.abs(rect.left + rect.width / 2 - center);
      });
      setActive(distances.indexOf(Math.min(...distances)));
    });
  };

  return (
    <section id="gallery" className="ivory-section section-pad gallery-section">
      <div className="section-shell">
        <SectionTitle eyebrow="Memories in Bloom" title="Our Gallery" copy="From an unexpected beginning to a forever they never saw coming — some of the best stories are the ones that write themselves." />
      </div>
      <div className="gallery-scroll" onScroll={onScroll}>
        <div className="gallery-track" ref={trackRef}>
          {GALLERY.map((image, index) => {
            const isActive = active === index;
            return (
              <button
                type="button"
                key={image.src}
                className={`gallery-card ${isActive ? "is-active" : ""}`}
                onMouseEnter={() => setActive(index)}
                onFocus={() => setActive(index)}
                onClick={() => isActive ? setOpen(index) : showCard(index)}
                aria-label={`Open ${image.alt}`}
              >
                <img src={image.src} alt={image.alt} loading="lazy" />
                <span className="gallery-shade" />
                <span className="gallery-caption">{image.alt}</span>
              </button>
            );
          })}
        </div>
      </div>
      <div className="gallery-dots">
        {GALLERY.map((image, index) => (
          <button
            type="button"
            key={image.src}
            className={active === index ? "is-active" : ""}
            onClick={() => showCard(index)}
            aria-label={`Show photo ${index + 1}`}
            aria-current={active === index}
          />
        ))}
      </div>
      {open !== null && <Lightbox index={open} onClose={close} onNavigate={navigate} />}
    </section>
  );
}

function Weather() {
  return (
    <section id="weather" className="blush-section section-pad">
      <CornerFloral position="tl" delay={0.2} />
      <CornerFloral position="tr" delay={0.7} />
      <div className="section-shell">
        <SectionTitle eyebrow="What to Expect" title="Dehradun Weather" copy="Cool mountain air, gentle sunshine and crisp December evenings." />
        <div className="weather-card reveal-on-scroll stagger-1">
          <div className="weather-days">
            {WEATHER.map(({ date, events, high, low, note, icon }) => (
              <div className="weather-day" key={date}>
                <span className="weather-icon" aria-hidden="true">
                  {icon === "sun" ? (
                    <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4" /><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8" /></svg>
                  ) : (
                    <svg viewBox="0 0 24 24"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" /><path d="M17 3v3M15.5 4.5h3" /></svg>
                  )}
                </span>
                <span className="weather-date">{date}</span>
                <h3>{events}</h3>
                <strong>{high}<sup>°</sup><span aria-hidden="true">/</span>{low}<sup>°</sup></strong>
                <small>High · Low °C</small>
                <em>{note}</em>
              </div>
            ))}
          </div>
          <p className="weather-tip">✦&nbsp;&nbsp;Pack a warm shawl or light jacket for the evening celebrations&nbsp;&nbsp;✦</p>
        </div>
      </div>
      <CornerFloral position="bl" delay={1.1} />
      <CornerFloral position="br" delay={0.4} />
    </section>
  );
}

function ThankYou() {
  return (
    <section id="thanks" className="velvet-section thank-you">
      <div className="twinkle-field" aria-hidden="true">
        {Array.from({ length: 30 }, (_, index) => <i key={index} style={{ left: `${(index * 41) % 100}%`, top: `${(index * 67) % 100}%`, animationDelay: `${(index % 8) * 0.37}s` }} />)}
      </div>
      <CornerFloral position="bl" delay={0.2} />
      <CornerFloral position="br" delay={0.9} />
      <div className="thank-you-inner reveal-on-scroll">
        <span className="thank-heart">♥</span>
        <p className="eyebrow">From the bottom of our hearts</p>
        <h2>Thank You</h2>
        <Divider light />
        <p>To every soul who has loved us, prayed for us and journeyed with us — your presence is a blessing we will carry forever.</p>
        <h3 className="thank-sign">— Tanvi &amp; Nishant</h3>
        <div className="rsvp">
          <Divider light />
          <h3>Kindly RSVP</h3>
          <p>Please let us know you’ll be joining us</p>
          <ul>
            {RSVP_CONTACTS.map(([family, name, phone, href]) => {
              const whatsapp = href.startsWith("https://wa.me/");
              return (
                <li key={phone}>
                  <span className="rsvp-family">{family}</span>
                  <strong>{name}</strong>
                  <a
                    href={href}
                    target={whatsapp ? "_blank" : undefined}
                    rel={whatsapp ? "noreferrer" : undefined}
                    aria-label={`${whatsapp ? "WhatsApp" : "Call"} ${name}, ${phone}`}
                  >
                    {whatsapp ? (
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5.1-1.3A10 10 0 1 0 12 2zm0 1.8a8.2 8.2 0 1 1-4.2 15.3l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 0 1 12 3.8zm-3.3 4.4c-.2 0-.5.1-.7.3-.3.3-1 1-1 2.4s1 2.8 1.2 3c.1.2 2 3.2 5 4.4 2.5 1 3 .8 3.5.7.5-.1 1.7-.7 2-1.4.2-.7.2-1.3.1-1.4-.1-.1-.3-.2-.6-.3l-2-1c-.3-.1-.5-.1-.7.1l-.9 1.1c-.2.2-.3.2-.6.1-.3-.1-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6l.5-.5.3-.5V11l-.1-.5-.9-2.1c-.2-.6-.5-.5-.7-.5h-.5z" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25c1.1.37 2.3.57 3.6.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1z" />
                      </svg>
                    )}
                    {phone}
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
        <small>Made with love · 30&nbsp;November&nbsp;–&nbsp;1&nbsp;December&nbsp;2026</small>
      </div>
    </section>
  );
}

export default function Home() {
  const [opened, setOpened] = useState(false);
  useRevealOnScroll(opened);

  return (
    <>
      {!opened && <EnvelopeIntro onOpened={() => setOpened(true)} />}
      {opened && (
        <main className="site-main">
          <Header />
          <AmbientPetals />
          <BackgroundMusic />
          <Hero />
          <SaveTheDate />
          <Countdown />
          <Events />
          <Venue />
          <Gallery />
          <Weather />
          <ThankYou />
        </main>
      )}
    </>
  );
}
