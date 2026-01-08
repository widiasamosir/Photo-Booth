import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Webcam from "react-webcam";

function TakePicture({ color, design, sticker, pattern, setCapturedImage }) {
    const webcamRef = useRef(null);
    const navigate = useNavigate();

    const [countdown, setCountdown] = useState(5);
    const [capturedImages, setCapturedImages] = useState([]);
    const [isCapturing, setIsCapturing] = useState(false);
    const [currentCaptureIndex, setCurrentCaptureIndex] = useState(0);
    const [isFinished, setIsFinished] = useState(false);
    const [filter, setFilter] = useState("none");

    // Define the exact same aesthetic positions used in the ChoosePattern screen
    const aestheticBorderStickers = [
        { top: '-10px', left: '10%', rotate: '-15deg' },
        { top: '15%', right: '-12px', rotate: '20deg' },
        { bottom: '25%', left: '-12px', rotate: '-25deg' },
        { bottom: '-10px', right: '15%', rotate: '10deg' },
        { top: '-8px', right: '5%', rotate: '-10deg' },
        { bottom: '5%', left: '40%', rotate: '15deg' },
    ];

    const totalCaptures = design ? Number(design.split("x")[0]) : 0;

    useEffect(() => {
        if (isCapturing && countdown > 0) {
            const timer = setInterval(() => {
                setCountdown((prev) => prev - 1);
            }, 1000);
            return () => clearInterval(timer);
        }
        if (countdown === 0 && isCapturing) {
            capture();
        }
    }, [countdown, isCapturing]);

    const capture = () => {
        if (webcamRef.current && currentCaptureIndex < totalCaptures) {
            const imageSrc = webcamRef.current.getScreenshot();
            setCapturedImages((prev) => [...prev, imageSrc]);
            setCurrentCaptureIndex((prev) => prev + 1);
            setCountdown(5);
        }
        if (currentCaptureIndex >= totalCaptures - 1) {
            setIsCapturing(false);
            setIsFinished(true);
        }
    };

    const handleRedo = () => {
        setCapturedImages([]);
        setCurrentCaptureIndex(0);
        setIsCapturing(false);
        setIsFinished(false);
    };

    const handleNext = async () => {
        await generatePhotoStrip();
        navigate("/download");
    };
    const applyFilters = (ctx, x, y, width, height, filterType) => {
        if (filterType === "none") return;

        // Grab the pixel data of the image we just drew
        const imageData = ctx.getImageData(x * 2, y * 2, width * 2, height * 2);
        // Note: We multiply by 2 because of your 'scale = 2' high-res setting
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            if (filterType === "bnw") {
                // Standard Grayscale formula
                const avg = 0.3 * r + 0.59 * g + 0.11 * b;
                data[i] = data[i + 1] = data[i + 2] = avg;
            } else if (filterType === "smoothing") {
                // Simple Contrast/Brightness logic
                // Brightness +10% (~25 units), Contrast 0.9
                data[i] = (r - 128) * 0.9 + 128 + 25;
                data[i + 1] = (g - 128) * 0.9 + 128 + 25;
                data[i + 2] = (b - 128) * 0.9 + 128 + 25;
            }
        }
        ctx.putImageData(imageData, x * 2, y * 2);
    };
    const generatePhotoStrip = async () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        const panels = Number(design.split("x")[0]);
        const panelWidth = 640;
        const panelHeight = (panelWidth * 3) / 4;
        const spacing = 20;
        const horizontalPadding = 40;

        // Height for the pattern/branding area at the bottom
        const footerHeight = 150;
        const stripWidth = panelWidth + (horizontalPadding * 2);
        const stripHeight = (panels * (panelHeight + spacing)) + footerHeight;

        const scale = 2; // High-res export
        canvas.width = stripWidth * scale;
        canvas.height = stripHeight * scale;
        ctx.scale(scale, scale);

        // 1. Draw Background
        ctx.fillStyle = color || "#FFFFFF";
        ctx.fillRect(0, 0, stripWidth, stripHeight);

        try {
            // Draw each captured photo
            for (let i = 0; i < capturedImages.length; i++) {
                const img = await new Promise((resolve) => {
                    const image = new Image();
                    image.src = capturedImages[i];
                    image.onload = () => resolve(image);
                });

                const x = horizontalPadding;
                const y = i * (panelHeight + spacing) + spacing;

                // --- PHOTO & FILTER ---
                ctx.save();

                // Draw the photo (Maintains aspect ratio of the webcam feed)
                ctx.drawImage(img, x, y, panelWidth, panelHeight);
                applyFilters(ctx, x, y, panelWidth, panelHeight, filter);
                ctx.restore();

                // --- STICKERS (Drawn after restore so filter doesn't affect them) ---
                if (sticker) {
                    ctx.save();
                    ctx.font = "40px Arial";
                    ctx.textAlign = "center";
                    ctx.textBaseline = "middle";

                    aestheticBorderStickers.forEach(pos => {
                        let sX = x;
                        let sY = y;
                        if (pos.left) sX += pos.left.includes('%') ? (parseFloat(pos.left)/100 * panelWidth) : parseFloat(pos.left);
                        if (pos.right) sX += panelWidth - (pos.right.includes('%') ? (parseFloat(pos.right)/100 * panelWidth) : parseFloat(pos.right));
                        if (pos.top) sY += pos.top.includes('%') ? (parseFloat(pos.top)/100 * panelHeight) : parseFloat(pos.top);
                        if (pos.bottom) sY += panelHeight - (pos.bottom.includes('%') ? (parseFloat(pos.bottom)/100 * panelHeight) : parseFloat(pos.bottom));

                        ctx.save();
                        ctx.translate(sX, sY);
                        ctx.rotate((parseFloat(pos.rotate) * Math.PI) / 180);
                        ctx.fillText(sticker, 0, 0);
                        ctx.restore();
                    });
                    ctx.restore();
                }
            }

            // --- PATTERN / LOGO (PROPER ASPECT RATIO) ---
            if (pattern?.img) {
                const pImg = await new Promise((resolve) => {
                    const image = new Image();
                    image.src = `/patterns/${pattern.img}`;
                    image.onload = () => resolve(image);
                    image.onerror = () => resolve(null);
                });

                if (pImg) {
                    const padding = 20; // Increased padding for a cleaner look

                    const maxWidth = panelWidth - (padding * 2);
                    const maxHeight = footerHeight - (padding * 2);

                    const ratio = Math.min(maxWidth / pImg.width, maxHeight / pImg.height);
                    const drawWidth = pImg.width * ratio;
                    const drawHeight = pImg.height * ratio;

                    // Start footer after the last photo and its spacing
                    const footerY = (panels * (panelHeight + spacing)) + spacing;

                    // Center the image within that footer block
                    const pX = (stripWidth / 2) - (drawWidth / 2);
                    const pY = footerY + (footerHeight / 2) - (drawHeight / 2);

                    ctx.drawImage(pImg, pX, pY, drawWidth, drawHeight);
                }
            }

            const finalDataUrl = canvas.toDataURL("image/jpeg", 0.95);
            setCapturedImage(finalDataUrl);
        } catch (err) {
            console.error("Failed to generate strip:", err);
        }
    };
    const renderStripPreview = () => {
        if (!design || !design.includes("x")) return null;
        const panels = Number(design.split("x")[0]);
        return (
            <div className="flex flex-col justify-center items-center space-y-1 p-4 rounded-lg shadow-lg" style={{ backgroundColor: color || "white" }}>
                {Array.from({ length: panels }).map((_, index) => (
                    <div key={index} className="relative w-24 h-16 bg-white border-2 border-black rounded-sm overflow-visible z-10">
                        {/* UI STICKER PREVIEW */}
                        {sticker && aestheticBorderStickers.map((pos, i) => (
                            <div
                                key={i}
                                className="absolute z-20 pointer-events-none text-[10px]"
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

                        {capturedImages[index] && (
                            <img
                                src={capturedImages[index]}
                                alt={`Captured ${index}`}
                                className="w-full h-full object-cover rounded-sm"
                                style={{ filter: filter === "bnw" ? "grayscale(100%)" : filter === "smoothing" ? "contrast(0.9) brightness(1.1)" : "none" }}
                            />
                        )}
                    </div>
                ))}
                {pattern?.img ? (
                    <div className="mt-2"><img src={`../patterns/${pattern.img}`} alt={pattern.name} className="w-16 h-16 object-contain" /></div>
                ) : (
                    <div className="mt-2 text-center text-xs font-semibold text-gray-700">{pattern?.name}</div>
                )}
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

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
            {!isCapturing && capturedImages.length === 0 && <h1 className="text-3xl font-bold mb-10">Ready??? Take a Picture....</h1>}
            {!isCapturing && capturedImages.length > 0 && <h1 className="text-3xl font-bold mb-10">Done !! Click next to continue</h1>}

            <div className="flex items-start justify-center space-x-10">
                <div className="flex flex-col items-center">
                    {isCapturing && countdown > 0 && (
                        <div className="text-6xl font-bold text-red-500 mb-4 animate-ping">
                            {countdown}
                        </div>
                    )}

                    {/* Wrap Webcam in a relative container */}
                    <div className="relative overflow-visible">
                        {/* --- LIVE STICKER OVERLAY --- */}
                        {sticker && aestheticBorderStickers.map((pos, i) => (
                            <div
                                key={i}
                                className="absolute z-50 pointer-events-none text-4xl opacity-80"
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

                        <Webcam
                            ref={webcamRef}
                            screenshotFormat="image/jpeg"
                            className="rounded-3xl border-4 border-white shadow-2xl w-[500px] aspect-[4/3]"
                            style={{
                                boxShadow: `0px 20px 50px ${shadowColor}`,
                                // Live Filter Preview
                                filter: filter === "bnw" ? "grayscale(100%)" : filter === "smoothing" ? "contrast(0.9) brightness(1.1)" : "none"
                            }}
                            videoConstraints={{facingMode: "user", width: 640, height: 480}}
                        />
                    </div>
                </div>
                <div>{renderStripPreview()}</div>
            </div>

            <div className="mt-8 flex flex-col items-center space-y-4">
                <div className="flex items-center space-x-4">
                    <label className="font-bold text-gray-700">Filter:</label>
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="p-2 rounded border shadow-sm"
                    >
                        <option value="none">Normal</option>
                        <option value="bnw">B&W</option>
                        <option value="smoothing">Smoothing</option>
                    </select>
                </div>

                {!isCapturing && !isFinished && (
                    <button onClick={() => {
                        setCapturedImages([]);
                        setCurrentCaptureIndex(0);
                        setIsCapturing(true);
                        setCountdown(5);
                    }}
                            className="px-10 py-3 bg-purple-600 text-white font-bold rounded-full hover:bg-purple-700 transition-all shadow-lg">
                        Start Capturing
                    </button>
                )}

                {isFinished && (
                    <div className="flex space-x-4">
                        <button onClick={handleRedo}
                                className="px-8 py-2 bg-gray-500 text-white rounded-full hover:bg-gray-600">Redo
                        </button>
                        <button onClick={handleNext}
                                className="px-8 py-2 bg-green-500 text-white rounded-full hover:bg-green-600 shadow-lg">Next</button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default TakePicture;