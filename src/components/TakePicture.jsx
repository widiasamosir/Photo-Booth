import { useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Webcam from "react-webcam";

function TakePicture({ design, setCapturedImage }) {
    const webcamRef = useRef(null);
    const navigate = useNavigate();

    // Ensure 'design' is valid before proceeding
    useEffect(() => {
        if (!design) {
            console.error("Design is not set or is invalid.");
            navigate("/choose-design"); // Navigate back to design selection if no design is selected
        }
    }, [design, navigate]);

    // Capture image from webcam
    const capture = () => {
        if (webcamRef.current) {
            const imageSrc = webcamRef.current.getScreenshot();
            setCapturedImage(imageSrc);
            navigate("/download");
        }
    };

    const renderStripPreview = () => {
        if (!design || !design.includes("x")) {
            return <div className="text-red-500">Invalid design format</div>;
        }

        const panels = Number(design.split("x")[0]); // Split and extract the panel count

        return (
            <div className="flex flex-col justify-center items-center space-y-1 p-2 border-2 border-gray-300 rounded-lg shadow-lg bg-gray-50">
                {/* Render the photo strip preview */}
                {Array.from({ length: panels }).map((_, index) => (
                    <div
                        key={index}
                        className="w-28 h-20 bg-white border-2 border-black rounded-lg transform hover:scale-110 transition duration-300 ease-in-out"
                    />
                ))}
            </div>
        );
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
            <h1 className="text-3xl font-bold mb-6">Take a Picture</h1>

            {/* Preview the selected design */}
            <div className="mb-6">
                <h2 className="text-xl font-semibold">Preview: {design}</h2>
                {renderStripPreview()}
            </div>

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

            {/* Capture button */}
            <button
                onClick={capture}
                className="px-6 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
            >
                Capture
            </button>
        </div>
    );
}

export default TakePicture;
