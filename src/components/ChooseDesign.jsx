import { useState } from "react";
import { useNavigate } from "react-router-dom";

function ChooseDesign({ setDesign }) {
    const navigate = useNavigate();
    const designs = ["4x1", "3x1", "2x1"];
    const [selectedDesign, setSelectedDesign] = useState("");

    const handleSelect = (d) => {
        setSelectedDesign(d);
        setDesign(d);
    };


    const renderStripPreview = (d) => {
        const panels = Number(d.charAt(0)); // "4x1" -> 4 panels, etc.
        return (
            <div className="flex flex-col justify-center items-center space-y-2 p-4 border-2 border-gray-300 rounded-lg shadow-lg bg-gray-50">
                {Array.from({ length: panels }).map((_, index) => (
                    <div
                        key={index}
                        className="w-20 h-20 bg-white border-2 border-black rounded-lg transform hover:scale-110 transition duration-300 ease-in-out"
                    >
                        {/* You can add content to each panel if needed */}
                    </div>
                ))}
            </div>
        );
    };

    // Adjust display text if needed
    const displayText = (d) => (d === "4x1" ? "4 in 1" : d);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 space-y-6">
            <h1 className="text-3xl font-bold text-center">
                Choose the Photo Strip Layout
            </h1>

            <div className="grid grid-cols-3 gap-6">
                {designs.map((d) => (
                    <button
                        key={d}
                        onClick={() => handleSelect(d)}
                        className={`p-4 bg-white rounded shadow cursor-pointer border-4 ${
                            selectedDesign === d ? "border-green-500" : "border-transparent"
                        }`}
                    >
                        {/* Render the photo strip preview horizontally */}
                        {renderStripPreview(d)}
                        <div className="mt-2 text-xl text-center">
                            {displayText(d)}
                        </div>
                    </button>
                ))}
            </div>

            <button
                onClick={() => navigate("/choose-pattern")}
                className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
                Next
            </button>
        </div>
    );
}

export default ChooseDesign;
