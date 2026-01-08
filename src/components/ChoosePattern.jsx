import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { FaArrowRight } from "react-icons/fa";

// Add setSticker to your props
function ChoosePattern({ setPattern, setColor, setSticker, design, pattern, color, sticker }) {
    const navigate = useNavigate();
    const [customText, setCustomText] = useState("");
    const [isCustomizing, setIsCustomizing] = useState(false);

    const patterns = [
        { name: "Zeal", img: "zeal-1.png" },
        { name: "Komisi Pemuda", img: "kopem.png" },
        { name: "Komisi Remaja", img: "korem.png" },
        { name: "New Year 2026", img: "new-year.png" }
    ];

    // Define available stickers (using emojis or image paths)
    const stickers = [
        { name: "None", value: null },
        { name: "Heart", value: "❤️" },
        { name: "Star", value: "⭐" },
        { name: "Sparkles", value: "✨" },
        { name: "Flower", value: "🌸" },
        { name: "Fire", value: "🔥" }
    ];

    const colors = ["#FFB6C1", "#FFD1DC", "#FFCC99", "#FFFF99", "#C1FFC1", "#AFE1AF", "#ADD8E6", "#B2BEB5", "#E6E6FA", "#D8BFD8",  "#FFFFFF"];

    const renderStripPreview = (d) => {
        if (!d || d.indexOf('x') === -1) {
            return <div className="text-red-500">Invalid design format</div>;
        }

        const panels = Number(d.split('x')[0]);

        // Small stickers with further outward offsets (negative values)
        const aestheticBorderStickers = [
            { top: '-10px', left: '10%', rotate: '-15deg' },  // Above top border
            { top: '15%', right: '-12px', rotate: '20deg' },  // Outside right border
            { bottom: '25%', left: '-12px', rotate: '-25deg' },// Outside left border
            { bottom: '-10px', right: '15%', rotate: '10deg' }, // Below bottom border
            { top: '-8px', right: '5%', rotate: '-10deg' },   // Near top right edge
            { bottom: '5%', left: '40%', rotate: '15deg' },   // Bottom edge center-ish
        ];

        return (
            /* Added more padding (p-6) to give space for the "further" stickers */
            <div
                className="flex flex-col justify-center items-center space-y-2 p-6 shadow-lg transition-all duration-500"
                style={{ backgroundColor: color || "white" }}
            >
                {Array.from({ length: panels }).map((_, index) => (
                    <div
                        key={index}
                        /* overflow-visible is crucial so stickers sitting outside aren't cut off */
                        className="relative w-28 h-20 border-2 border-black rounded-sm bg-white overflow-visible z-10 shadow-sm"
                    >
                        {/* SMALL AESTHETIC STICKERS */}
                        {sticker && aestheticBorderStickers.map((pos, i) => (
                            <div
                                key={i}
                                className="absolute z-20 pointer-events-none text-sm opacity-90 transition-transform"
                                style={{
                                    top: pos.top,
                                    bottom: pos.bottom,
                                    left: pos.left,
                                    right: pos.right,
                                    transform: `rotate(${pos.rotate})`
                                }}
                            >
                                {sticker}
                            </div>
                        ))}

                        {/* Placeholder text for photo */}
                        <div className="flex items-center justify-center h-full text-[8px] text-gray-300 uppercase italic">
                            Photo {index + 1}
                        </div>
                    </div>
                ))}

                {/* Pattern Area */}
                <div className="pt-4 z-10">
                    {pattern?.img ? (
                        <img src={`/patterns/${pattern.img}`} alt={pattern.name} className="w-20 h-20 object-contain" />
                    ) : isCustomizing && customText ? (
                        <div className="max-w-20 text-center text-lg font-semibold text-gray-700">
                            {customText}
                        </div>
                    ) : null}
                </div>
            </div>
        );
    };

    const hexToRgba = (hex, opacity = 0.3) => {
        hex = hex.replace('#', '');
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    };

    const shadowColor = color ? hexToRgba(color, 0.3) : 'rgba(162, 102, 255, 0.3)';

    const handleCustomize = () => {
        setIsCustomizing(true);
        setPattern("");
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white space-y-6 mb-5">
            <h1 className="text-4xl font-extrabold text-center text-black font-serif tracking-wide mb-10">
                🎨 Customize Your Photo Strip ✨
            </h1>

            <div className="flex flex-row items-center justify-between space-x-20 ">
                {/* PREVIEW SECTION */}
                <div
                    className=" mb-6 flex "
                    style={{
                        boxShadow: `46px 46px 92px ${shadowColor}, -46px -46px 92px ${shadowColor}`
                    }}
                >
                    {design ? renderStripPreview(design) : (
                        <div className="text-red-500">Please choose a design first.</div>
                    )}
                </div>

                {/* OPTIONS SECTION */}
                <div className="flex flex-col items-center justify-start space-y-8">

                    {/* 1. Patterns */}
                    <div>
                        <h2 className="text-xl font-semibold mb-3 text-center">Choose Pattern</h2>
                        <div className="flex gap-4">
                            {patterns.map((p) => (
                                <div
                                    key={p.name}
                                    onClick={() => {
                                        setPattern(p);
                                        setIsCustomizing(false);
                                    }}
                                    className={`p-4 bg-white rounded shadow cursor-pointer text-center border-2 ${pattern?.name === p.name ? "border-green-500 bg-green-50" : "border-transparent hover:bg-green-100"}`}
                                >
                                    {p.name}
                                </div>
                            ))}
                            <div
                                onClick={handleCustomize}
                                className={`p-4 bg-white rounded shadow cursor-pointer text-center border-2 ${isCustomizing ? "border-blue-500" : "border-transparent hover:bg-blue-100"}`}
                            >
                                Customize
                            </div>
                        </div>
                    </div>

                    {isCustomizing && (
                        <div className="mb-6 flex flex-row">
                            <input
                                type="text"
                                value={customText}
                                onChange={(e) => {
                                    setCustomText(e.target.value);
                                    setPattern({name: e.target.value, img: null});
                                }}
                                placeholder="Enter your custom text"
                                className="p-2 border-2 border-gray-300 rounded-lg"
                                maxLength={20}
                            />
                        </div>
                    )}

                    {/* 2. OVERLAY STICKERS (PicaPica Style) */}
                    <div>
                        <h2 className="text-xl font-semibold mb-3 text-center">Add Overlay Sticker</h2>
                        <div className="flex gap-4 flex-wrap justify-center">
                            {stickers.map((s) => (
                                <div
                                    key={s.name}
                                    onClick={() => setSticker(s.value)}
                                    className={`w-12 h-12 flex items-center justify-center bg-white rounded-full shadow cursor-pointer text-2xl border-2 transition-all ${sticker === s.value ? "border-purple-500 scale-110" : "border-transparent hover:scale-105"}`}
                                >
                                    {s.value || "🚫"}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 3. Colors */}
                    <div>
                        <h2 className="text-xl font-semibold mb-3 text-center">Choose Background Color</h2>
                        <div className="flex gap-3 flex-wrap justify-center max-w-sm">
                            {colors.map((c) => (
                                <div
                                    key={c}
                                    onClick={() => setColor(c)}
                                    className={`w-10 h-10 rounded-full cursor-pointer border-2 transition-transform ${color === c ? "border-black scale-110" : "border-gray-400 hover:scale-105"}`}
                                    style={{backgroundColor: c}}
                                />
                            ))}
                        </div>
                    </div>

                </div>
            </div>

            <div className="flex flex-row gap-4 mb-6 pt-10">
                <button
                    onClick={() => navigate("/")}
                    className="px-16 py-3 bg-gray-400 text-white rounded hover:bg-gray-500 transition-colors"
                >
                    Back
                </button>
                <button
                    onClick={() => navigate("/take-picture")}
                    className="px-16 py-3 bg-green-500 text-white rounded hover:bg-green-600 transition-colors shadow-lg"
                >
                    Start
                </button>
            </div>
        </div>
    );
}

export default ChoosePattern;