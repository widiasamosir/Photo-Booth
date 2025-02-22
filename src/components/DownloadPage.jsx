import { useState, useEffect } from "react";

function Download({ design, pattern, capturedImage }) {
    const [imageUrl, setImageUrl] = useState(capturedImage);

    // Ensure that the image is loaded and converted to a proper URL
    useEffect(() => {
        if (capturedImage) {
            const objectUrl = URL.createObjectURL(capturedImage);
            setImageUrl(objectUrl);
            return () => {
                URL.revokeObjectURL(objectUrl); // Clean up the URL when component unmounts
            };
        }
    }, [capturedImage]);

    const downloadImage = () => {
        const link = document.createElement("a");
        link.href = imageUrl;
        link.download = "photo_booth.jpg";
        link.click();
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
            <h1 className="text-3xl font-bold mb-6">Download Your Photo</h1>
            {capturedImage && (
                <img
                    src={imageUrl}
                    alt="Captured"
                    className="mb-6 rounded shadow max-w-sm"
                />
            )}
            <div className="mb-6">
                <p className="text-lg">Design: <span className="font-semibold">{design}</span></p>
                <p className="text-lg">Pattern: <span className="font-semibold">{pattern}</span></p>
            </div>
            <button
                onClick={downloadImage}
                className="px-6 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
                Download
            </button>
        </div>
    );
}

export default Download;
