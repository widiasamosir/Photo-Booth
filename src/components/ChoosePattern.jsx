import { useNavigate } from "react-router-dom";
import { useState } from "react";
import {FaArrowRight} from "react-icons/fa";

function ChoosePattern({ setPattern, design, pattern }) {
    const navigate = useNavigate();
    const [customText, setCustomText] = useState(""); // State for storing custom text
    const [isCustomizing, setIsCustomizing] = useState(false); // State to track if customizing is active

    // Patterns with their corresponding image files
    const patterns = [
        { name: "Joy Blessings", img: "pattern-1.png" },
        { name: "Sunday", img: "pattern-2.png" },
        { name: "Happy Sunday", img: "pattern-3.png" }
    ];

    // Render the photo strip preview based on the chosen design (vertical)
    const renderStripPreview = (d) => {
        if (!d || d.indexOf('x') === -1) {
            return <div className="text-red-500">Invalid design format</div>;
        }

        const panels = Number(d.split('x')[0]);

        return (
            <div className="flex flex-col justify-center items-center space-y-1 p-2 border-2 border-gray-300 rounded-lg shadow-lg bg-gray-50">
                {Array.from({ length: panels }).map((_, index) => (
                    <div
                        key={index}
                        className="w-28 h-20 bg-white border-2 border-black rounded-lg transform hover:scale-110 transition duration-300 ease-in-out"
                    >
                        {/* Content for each panel can go here */}
                    </div>
                ))}

                {/* Render pattern or custom text at the bottom */}
                {pattern.img ? (
                    <div className="mt-2">
                        <img
                            src={`/patterns/${pattern.img}`}
                            alt={pattern.name}
                            className="w-20 h-20 object-contain"
                        />
                    </div>
                ) : isCustomizing && customText ? (
                    <div className="mt-2 max-w-20 text-center text-lg font-semibold text-gray-700">
                        {customText}
                    </div>
                ) : null}
            </div>
        );
    };

    const handleCustomize = () => {
        setIsCustomizing(true); // Activate custom text mode
        setPattern("");
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 space-y-8">
            <h1 className="text-3xl font-bold mb-6">Choose a Pattern Overlay</h1>

            {/* Show the preview of the selected strip design */}
            <div className="mb-6">
                <h2 className="text-xl font-semibold">Preview: {design}</h2>
                {design ? renderStripPreview(design) : <div className="text-red-500">Please choose a design first.</div>}
            </div>

            {/* Show the pattern options and Customize button */}
            <div className="flex gap-4 mb-6">
                {patterns.map((p) => (
                    <div
                        key={p.name}
                        onClick={() => {
                            setPattern(p); // Set the selected pattern
                            setIsCustomizing(false); // Disable custom text if a pattern is selected
                        }}
                        className={`p-4 bg-white rounded shadow cursor-pointer text-center ${
                            pattern.name === p.name
                                ? "bg-green-200"
                                : "hover:bg-green-100"
                        }`}
                    >
                        {p.name}
                    </div>
                ))}

                <div
                    onClick={handleCustomize}
                    className={`p-4 bg-white rounded shadow cursor-pointer text-center hover:bg-blue-100`}
                >
                    Customize
                </div>
            </div>

            {/* Input field for custom text */}
            {isCustomizing && (
                <div className="mb-6 flex flex-row ">
                    <input
                        type="text"
                        value={customText}
                        onChange={(e) => {
                            setCustomText(e.target.value)
                            setPattern({name: e.target.value, img: null})
                        }}
                        placeholder="Enter your custom text"
                        className="p-2 border-2 border-gray-300 rounded-lg"
                        maxLength={20}
                    />
                </div>
            )}

            {/* Navigation buttons */}
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
