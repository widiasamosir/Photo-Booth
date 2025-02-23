import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { FaArrowRight } from "react-icons/fa";

function ChoosePattern({ setPattern, setColor, design, pattern, color }) {
    const navigate = useNavigate();
    const [customText, setCustomText] = useState("");
    const [isCustomizing, setIsCustomizing] = useState(false);

    const patterns = [
        { name: "Joy Blessings", img: "pattern-1.png" },
        { name: "Sunday", img: "pattern-2.png" },
        { name: "Happy Sunday", img: "pattern-3.png" }
    ];

    const colors = ["#FFB6C1", "#FFD1DC", "#FFCC99", "#FFFF99", "#C1FFC1", "#AFE1AF", "#ADD8E6", "#B2BEB5", "#E6E6FA", "#D8BFD8",  "#FFFFFF"];
    const renderStripPreview = (d) => {
        if (!d || d.indexOf('x') === -1) {
            return <div className="text-red-500">Invalid design format</div>;
        }

        const panels = Number(d.split('x')[0]);
        return (
            <div className={`flex flex-col justify-center items-center space-y-1 p-2 shadow-lg `}  style={{ backgroundColor: color || "white" }}>
                {Array.from({ length: panels }).map((_, index) => (
                    <div
                        key={index}
                        className={`w-28 h-20 border-2 border-black rounded-lg transform hover:scale-110 transition duration-300 ease-in-out bg-white`}
                    />
                ))}

                {pattern?.img ? (
                    <div className="mt-2">
                        <img src={`/patterns/${pattern.img}`} alt={pattern.name} className="w-20 h-20 object-contain" />
                    </div>
                ) : isCustomizing && customText ? (
                    <div className="mt-2 max-w-20 text-center text-lg font-semibold text-gray-700">
                        {customText}
                    </div>
                ) : null}
            </div>
        );
    };
    const hexToRgba = (hex, opacity = 0.3) => {
        // Remove '#' if present
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
        <div
            className="min-h-screen flex flex-col items-center justify-center bg-white space-y-6 mb-5">
            <h1 className="text-4xl font-extrabold text-center text-black font-serif tracking-wide mb-10">
                🎨 Choose a Pattern or Color Overlay ✨
            </h1>
            <div className="flex flex-row items-center justify-between space-x-20 ">
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

                <div className="flex flex-col items-center justify-start ">


                    <div className="flex gap-4 mb-6">
                        {patterns.map((p) => (
                            <div
                                key={p.name}
                                onClick={() => {
                                    setPattern(p);
                                    setIsCustomizing(false);
                                }}
                                className={`p-4 bg-white rounded shadow cursor-pointer text-center ${pattern?.name === p.name ? "bg-green-200" : "hover:bg-green-100"}`}
                            >
                                {p.name}
                            </div>
                        ))}

                        <div
                            onClick={handleCustomize}
                            className="p-4 bg-white rounded shadow cursor-pointer text-center hover:bg-blue-100"
                        >
                            Customize
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

                    <h2 className="text-xl font-semibold mb-4">Or Choose a Color</h2>
                    <div className="flex gap-4 mb-6">
                        {colors.map((c) => (
                            <div
                                key={c}
                                onClick={() => {
                                    setColor(c);
                                }}
                                className="w-10 h-10 rounded-full cursor-pointer border-2 border-gray-400"
                                style={{backgroundColor: c}}
                            />
                        ))}
                    </div>

                </div>
            </div>


            <div className="flex flex-row gap-4 mb-6">
                <button
                    onClick={() => navigate("/")}
                    className="px-16 py-3 bg-gray-400 text-white rounded hover:bg-gray-200"
                >
                    Back
                </button>
                <button
                    onClick={() => navigate("/take-picture")}
                    className="px-16 py-3 bg-green-500 text-white rounded hover:bg-green-600"
                >
                    Start
                </button>
            </div>
        </div>
    );
}

export default ChoosePattern;
