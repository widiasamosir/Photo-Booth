import { useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { createClient } from "@supabase/supabase-js";

const SB_URL = import.meta.env.VITE_SUPABASE_URL;
const SB_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SB_URL || !SB_KEY) {
    console.error("Supabase credentials are missing! Check your .env file.");
}

const supabase = createClient(SB_URL, SB_KEY);

function Download({ design, pattern, sticker, capturedImage, filter }) {
    const navigate = useNavigate();
    const [qrUrl, setQrUrl] = useState("");
    const [timeLeft, setTimeLeft] = useState(60);
    const [isUploading, setIsUploading] = useState(false);
    const currentFilePath = useRef(null);
    const hasStartedUpload = useRef(false);
    const fileDeleted = useRef(false);

    useEffect(() => {
        // Only run if we have an image AND we haven't started an upload yet
        if (capturedImage && !hasStartedUpload.current) {
            hasStartedUpload.current = true;
            uploadAndGenerateQR();
        }
    }, [capturedImage]);

    // Timer Logic
    useEffect(() => {
        let interval;
        if (qrUrl && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [qrUrl, timeLeft]);

    const uploadAndGenerateQR = async () => {
        setIsUploading(true);
        try {
            // Convert dataURL to Blob
            const res = await fetch(capturedImage);
            const blob = await res.blob();

            const fileName = `strip_${Date.now()}.jpg`;
            const filePath = `uploads/${fileName}`;
            console.log(filePath);
            // 1. Upload to Supabase
            const { error: uploadError } = await supabase.storage
                .from('photobooth')
                .upload(filePath, blob);
            console.log("errorUpload:", uploadError);
            if (uploadError) throw uploadError;
            currentFilePath.current = filePath;
            // 2. Generate Signed URL (valid for 60 seconds)
            const { data, error: signError } = await supabase.storage
                .from('photobooth')
                .createSignedUrl(filePath, 60);
            console.log("data: ", JSON.stringify(data));
            console.log("error:", signError);
            if (signError) throw signError;

            console.log("QR URL Generated:", data.signedUrl);
            setQrUrl(data.signedUrl);

            // 3. Set a timeout to delete the file after 60 seconds
            setTimeout(() => {
                handleAutoDelete(filePath);
            }, 60000);

        } catch (err) {
            console.error("Process Failed:", err);
            hasStartedUpload.current = false; // Allow retry on failure
        } finally {
            setIsUploading(false);
        }
    };

    const handleAutoDelete = async () => {
        // 6. Access using .current
        const pathToDelete = currentFilePath.current;

        if (!pathToDelete) {
            console.warn("Delete aborted: currentFilePath.current is empty.");
            return;
        }

        console.log("Attempting to delete from Ref:", pathToDelete);

        const { data, error } = await supabase.storage
            .from('photobooth')
            .remove([pathToDelete]);

        if (error) {
            console.error("Delete failed:", error.message);
        } else if (data && data.length > 0) {
            console.log("Successfully deleted:", data);
            setQrUrl("");
            currentFilePath.current = null; // Clear Ref after success
        } else {
            console.warn("Delete call returned no error, but 0 files were removed. Check path format.");
        }
    };

    const downloadImage = () => {
        if (!capturedImage) return;
        const link = document.createElement("a");
        link.href = capturedImage;
        link.download = `${design || "photo"}-strip.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    const handleBackHome =async () => {
        if (currentFilePath) {
            await handleAutoDelete(currentFilePath);
            currentFilePath.current = null;
        }
        navigate("/")
    }

    return (
        <div
            className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-50 via-purple-200 to-purple-100 space-y-6 p-4">
            <h1 className="text-3xl font-bold">Welcome, Komisi Pemuda dan Remaja!!</h1>
            <h5 className="text-xl font-bold">Scan QR to Download Your Photo</h5>

            <div
                className="flex flex-col md:flex-row items-center gap-10 bg-white/50 p-8 rounded-3xl shadow-2xl backdrop-blur-sm">
                {/* Photo Preview */}
                <div className="flex flex-col items-center">
                    {capturedImage ? (
                        <img
                            src={capturedImage}
                            alt="Captured Strip"
                            className="rounded-lg shadow-lg max-w-40 border-4 border-white"
                        />
                    ) : (
                        <p className="text-red-500">No image available</p>
                    )}
                </div>

                {/* QR Code Section */}
                <div className="flex flex-col items-center min-w-[200px]">
                    {isUploading ? (
                        <div className="flex flex-col items-center">
                            <div
                                className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-700 mb-2"></div>
                            <p className="text-purple-700 font-medium">Preparing QR...</p>
                        </div>
                    ) : qrUrl ? (
                        <div className="text-center p-4 bg-white rounded-xl shadow-inner">
                            {/* This is the component that shows the QR */}
                            <QRCodeCanvas value={qrUrl} size={160}/>
                            <p className="mt-4 text-xs font-bold uppercase tracking-widest text-red-500">
                                Scan to Mobile
                            </p>
                            <p className="text-lg font-mono text-gray-700">
                                00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}
                            </p>
                        </div>
                    ) : (
                        timeLeft === 0 && (
                            <div className="text-center text-gray-500 italic">
                                <p>QR Code Expired</p>
                                <p className="text-xs">File deleted for privacy</p>
                            </div>
                        )
                    )}
                </div>
            </div>

            <div className="flex flex-row items-center justify-center space-x-4">
                <button
                    onClick={handleBackHome}
                    className="px-6 py-2 text-black border-2 border-black rounded-lg hover:bg-white/50 transition"
                >
                    Home 📸
                </button>

                <button
                    onClick={downloadImage}
                    className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-800 shadow-lg transition disabled:bg-gray-400"
                    disabled={!capturedImage}
                >
                    Download ✨
                </button>
            </div>
        </div>
    );
}

export default Download;