import { useNavigate } from "react-router-dom";

const floatingSymbols = ["?"];

function FloatingSymbol({ symbol, style }: { symbol: string; style: React.CSSProperties }) {
  return (
    <span
      className="absolute text-gray-400 select-none pointer-events-none opacity-30 animate-bounce"
      style={style}
    >
      {symbol}
    </span>
  );
}

export default function Home() {
  const navigate = useNavigate();

  // Content box size approx (in px) based on max-w-xl (576px) + padding (40px*2 = 80px)
  const boxWidth = 576 + 80;
  const boxHeight = 300; // approx height (adjust if needed)

  // Get viewport size to compute forbidden zone - fallback for server render
  const viewportWidth = typeof window !== "undefined" ? window.innerWidth : 1024;
  const viewportHeight = typeof window !== "undefined" ? window.innerHeight : 768;

  // Compute forbidden box coordinates (centered)
  const boxLeft = (viewportWidth - boxWidth) / 2;
  const boxRight = boxLeft + boxWidth;
  const boxTop = (viewportHeight - boxHeight) / 2;
  const boxBottom = boxTop + boxHeight;

  // Function to generate a random position outside the forbidden box
  function randomPositionOutsideBox() {
    let top: number;
    let left: number;

    do {
      top = Math.random() * viewportHeight;
      left = Math.random() * viewportWidth;
    } while (top > boxTop && top < boxBottom && left > boxLeft && left < boxRight);

    return { top, left };
  }

  const totalSymbols = 40;
  const columns = 8; // Adjust to control horizontal spread
  const rows = 5;    // Adjust to control vertical spread
  const spacingX = window.innerWidth / columns;
  const spacingY = window.innerHeight / rows;

  const symbols = Array(totalSymbols).fill(0).map((_, i) => {
    const row = Math.floor(i / columns);
    const col = i % columns;

    // Slight jitter to make it look more natural
    const jitterX = (Math.random() - 0.5) * spacingX * 0.4;
    const jitterY = (Math.random() - 0.5) * spacingY * 0.4;

    const top = row * spacingY + jitterY;
    const left = col * spacingX + jitterX;

    return {
      symbol: "?",
      style: {
        top: `${top}px`,
        left: `${left}px`,
        fontSize: `${10 + Math.random() * 30}px`,
        animationDelay: `${Math.random() * 7000}ms`,
        opacity: 0.4 + Math.random() * 0.2,
        color: `rgba(30, 60, 255, ${0.4 + Math.random() * 0.2})`, // vivid blue
      },
    };
  });


  return (
    <div className="relative min-h-screen flex justify-center items-center bg-gradient-to-br from-blue-100 to-gray-300 overflow-hidden">
      {/* Floating symbols */}
      {symbols.map(({ symbol, style }, idx) => (
        <FloatingSymbol key={idx} symbol={symbol} style={style} />
      ))}

      {/* Content Box */}
      <div
        className="
      relative
      bg-gradient-to-r from-blue-300 to-gray-400
      rounded-3xl
      p-10
      max-w-xl
      w-full
      text-center
      shadow-lg
      ring-4 ring-blue-400
      transition
      duration-700
      ease-in-out
      hover:shadow-[0_0_60px_20px_rgba(96,165,250,0.7)]
      z-10
    "
        style={{ minHeight: boxHeight }}
      >
        <h1 className="text-5xl font-bold mb-4 text-blue-900 drop-shadow-md">Welcome to QuickPoll</h1>
        <p className="text-lg text-blue-900 mb-10 max-w-xl drop-shadow-sm">
          QuickPoll is a real-time polling application. Create polls, share them, and view results instantly.
          No signup needed for participants!
        </p>

        {/* Buttons with equal width */}
        <div className="flex gap-4">
          <button
            onClick={() => navigate("/participant")}
            className="flex-1 bg-blue-700 text-white px-6 py-3 rounded hover:bg-blue-800 transition"
          >
            Continue as Participant
          </button>
          <button
            onClick={() => navigate("/admin/login")}
            className="flex-1 bg-gray-900 text-white px-6 py-3 rounded hover:bg-gray-950 transition"
          >
            Continue as Admin
          </button>
        </div>
      </div>
    </div>
  );
}
