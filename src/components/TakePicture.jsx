import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Webcam from "react-webcam";

function TakePicture({ design, pattern, setCapturedImage }) {
    const webcamRef = useRef(null);
    const navigate = useNavigate();

    const [countdown, setCountdown] = useState(5); // Countdown from 5
    const [capturedImages, setCapturedImages] = useState([]); // To store the captured images
    const [isCapturing, setIsCapturing] = useState(false); // Flag to check if capturing is in progress
    const [currentCaptureIndex, setCurrentCaptureIndex] = useState(0); // Keeps track of which picture we're capturing
    const totalCaptures = design ? Number(design.split("x")[0]) : 0; // Based on the design (e.g., 2x1 means 2 pictures)

    useEffect(() => {
        // Start countdown before capturing each picture
        if (isCapturing && countdown > 0) {
            const timer = setInterval(() => {
                setCountdown((prev) => prev - 1);
            }, 1000);
            return () => clearInterval(timer); // Clean up the interval
        }

        if (countdown === 0 && isCapturing) {
            capture(); // Capture image when countdown reaches zero
        }
    }, [countdown, isCapturing]);

    const capture = () => {
        if (webcamRef.current && currentCaptureIndex < totalCaptures-1) {
            const imageSrc = webcamRef.current.getScreenshot();
            // const imageSrc  ='patterns/pattern-1.png';
            setCapturedImages((prev) => [...prev, imageSrc]); // Store captured image
            setCurrentCaptureIndex((prev) => prev + 1); // Move to the next capture index
            setCountdown(5); // Reset countdown for the next picture
        } else if (currentCaptureIndex >= totalCaptures-1) {

            navigate("/download");
        }
    };

    const renderStripPreview = () => {
        if (!design || !design.includes("x")) {
            return <div className="text-red-500">Invalid design format</div>;
        }

        const panels = Number(design.split("x")[0]); // Split and extract the panel count
        const panelWidth = 80; // Adjust the panel width as needed
        const panelHeight = 120; // Adjust the panel height as needed

        return (
            <div className="flex flex-col justify-center items-center space-y-1 p-2 border-2 border-gray-300 rounded-lg shadow-lg bg-gray-50">
                {/* Render the photo strip preview with panels */}
                {Array.from({ length: panels }).map((_, index) => (
                    <div
                        key={index}
                        className="w-20 h-20 bg-white border-2 border-black rounded-lg transform hover:scale-110 transition duration-300 ease-in-out"
                    >
                        {/* Show captured image in the panel */}
                        {capturedImages[index] && (
                            <img
                                src={capturedImages[index]}
                                alt={`Captured ${index}`}
                                className="w-full h-full object-cover rounded-lg"
                            />
                        )}
                    </div>
                ))}

                {/* Add the pattern at the bottom of the strip */}
                {pattern && pattern.img && (
                    <div className="mt-2">
                        <img
                            src={`../patterns/${pattern.img}`} // Path to the pattern image
                            alt={pattern.name}
                            className="w-20 h-20 object-contain"
                        />
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
            <h1 className="text-3xl font-bold mb-6">Take a Picture</h1>

            {/* Preview the selected design */}
            <div className="mb-6">
                <h2 className="text-xl font-semibold">Preview: {design}</h2>
                {renderStripPreview()} {/* Render the strip preview */}
            </div>

            {/* Countdown Display */}
            {isCapturing && countdown > 0 && (
                <div className="text-4xl font-bold text-red-500 mb-4">
                    {countdown}
                </div>
            )}

            {/* Webcam */}
            <div className="mb-6">
                <Webcam
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    className="rounded shadow"
                    videoConstraints={{
                        facingMode: "user", // Use front camera if available
                        width: 640,
                        height: 480,
                    }}
                />
            </div>

            {/* Start capturing button */}
            {!isCapturing && (
                <button
                    onClick={() => {
                        setCapturedImages([]); // Clear previous images
                        setCurrentCaptureIndex(0); // Reset capture index
                        setIsCapturing(true); // Start capturing
                        setCountdown(5); // Start countdown for the first picture
                    }}
                    className="px-6 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
                >
                    Start Capturing
                </button>
            )}

            {/* Capture button (triggered automatically after countdown) */}
            {isCapturing && countdown === 0 && (
                <button
                    onClick={capture}
                    className="px-6 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
                >
                    Capture
                </button>
            )}
        </div>
    );
}

export default TakePicture;
