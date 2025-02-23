import {useNavigate} from "react-router-dom";

function Download({ design, pattern, capturedImage }) {
    const navigate = useNavigate();

    const downloadImage = () => {
        if (!capturedImage) return;

        const link = document.createElement("a");
        link.href = capturedImage; // This should work fine if it's a base64 image or blob URL
        link.download = `${design || "photo"}-${pattern.name || "default"}-photo.jpg`; // Ensure filename is safe
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    const handleBackHome=()=> {
        navigate("/");
    }
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-50 via-purple-200 to-purple-100 space-y-6 mb-5">
            <h1 className="text-3xl font-bold mb-6">Download Your Photo</h1>
            {capturedImage ? (
                <img
                    src={capturedImage}
                    alt="Captured"
                    className="mb-6 rounded shadow max-w-48 "
                />
            ) : (
                <p className="text-red-500">No image available</p>
            )}


            <div className="flex flex-row items-center justify-center ">
                <button
                    onClick={handleBackHome}
                    className="px-6 mr-10 py-1  text-black border-2 border-black rounded-lg  disabled:bg-gray-400"
                >
                    Back to Home 📸
                </button>

                <button
                    onClick={downloadImage}
                    className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-800 disabled:bg-gray-400"
                    disabled={!capturedImage}
                >
                    Download ✨
                </button>

            </div>

        </div>
    );
}

export default Download;
