function Download({ design, pattern, capturedImage }) {
    const downloadImage = () => {
        if (!capturedImage) return;

        const link = document.createElement("a");
        link.href = capturedImage; // This should work fine if it's a base64 image or blob URL
        link.download = `${design || "photo"}-${pattern.name || "default"}-photo.jpg`; // Ensure filename is safe
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
            <h1 className="text-3xl font-bold mb-6">Download Your Photo</h1>
            {capturedImage ? (
                <img
                    src={capturedImage}
                    alt="Captured"
                    className="mb-6 rounded shadow max-w-sm"
                />
            ) : (
                <p className="text-red-500">No image available</p>
            )}
            <div className="mb-6">
                <p className="text-lg">Design: <span className="font-semibold">{design || "N/A"}</span></p>
                <p className="text-lg">Pattern: <span className="font-semibold">{pattern.name || "N/A"}</span></p>
            </div>
            <button
                onClick={downloadImage}
                className="px-6 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-gray-400"
                disabled={!capturedImage}
            >
                Download
            </button>
        </div>
    );
}

export default Download;
