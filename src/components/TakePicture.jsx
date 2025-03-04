import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Webcam from "react-webcam";

function TakePicture({ color, design, pattern, setCapturedImage }) {
    const webcamRef = useRef(null);
    const navigate = useNavigate();

    const [countdown, setCountdown] = useState(5);
    const [capturedImages, setCapturedImages] = useState([]);
    const [isCapturing, setIsCapturing] = useState(false);
    const [currentCaptureIndex, setCurrentCaptureIndex] = useState(0);
    const [isFinished, setIsFinished] = useState(false); // Wait for Next button
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
            // const imageSrc = 'patterns/picture.jpg'
            setCapturedImages((prev) => [...prev, imageSrc]);
            setCurrentCaptureIndex((prev) => prev + 1);
            setCountdown(5);
        }

        if (currentCaptureIndex >= totalCaptures - 1) {
            setIsCapturing(false);
            setIsFinished(true); // Show Next button
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

    const generatePhotoStrip = async () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        const panels = Number(design.split("x")[0]);
        const panelWidth = 640; // Width of the panel, adjusted for clarity
        const panelHeight = (panelWidth * 3) / 4; // Height adjusted to maintain 4:3 ratio
        const spacing = 10; // Increased spacing for better visibility
        const borderSize = 2; // Thicker black border
        const cornerRadius = 10; // Smoother rounded corners
        const horizontalPadding = 20; // Extra horizontal padding
        const patternHeight = pattern?.img ? panelHeight : 100; // Space for pattern if exists
        const stripHeight = panels * (panelHeight + spacing) + patternHeight; // Total height with spacing


        // High-resolution canvas for better quality
        const scaleFactor = 2; // Render at 2x for better sharpness
        canvas.width = (panelWidth + horizontalPadding * 2) * scaleFactor;
        canvas.height = (stripHeight + borderSize * 2) * scaleFactor;
        ctx.scale(scaleFactor, scaleFactor);

        try {
            // White Background
            ctx.fillStyle = color || "#FFFFFF";

            ctx.fillRect(0, 0, canvas.width / scaleFactor, canvas.height / scaleFactor);

            // Load captured images
            const loadedImages = await Promise.all(
                capturedImages.map((imageSrc) =>
                    new Promise((resolve) => {
                        const img = new Image();
                        img.src = imageSrc;
                        img.onload = () => resolve(img);
                    })
                )
            );

            // Draw images with a black border, white background, and rounded corners
            loadedImages.forEach((img, index) => {
                const yPosition = index * (panelHeight + spacing) + borderSize;
                const xPosition = horizontalPadding;

                // Draw white background inside border
                ctx.fillStyle = color || "#FFFFFF";
                ctx.beginPath();
                ctx.roundRect(xPosition + 2, yPosition + 2, panelWidth - 4, panelHeight - 4, cornerRadius);
                ctx.fill();

                // Calculate aspect ratio
                const imgAspectRatio = img.width / img.height;
                const panelAspectRatio = (panelWidth - 4) / (panelHeight - 4);

                let drawWidth, drawHeight, offsetX, offsetY;

                if (imgAspectRatio > panelAspectRatio) {
                    drawWidth = panelWidth - 4;
                    drawHeight = drawWidth / imgAspectRatio;
                    offsetX = xPosition + 2;
                    offsetY = yPosition + 2 + (panelHeight - 4 - drawHeight) / 2;
                } else {
                    drawHeight = panelHeight - 4;
                    drawWidth = drawHeight * imgAspectRatio;
                    offsetX = xPosition + 2 + (panelWidth - 4 - drawWidth) / 2;
                    offsetY = yPosition + 2;
                }

                // Draw image inside border (centered & proportional)
                ctx.save();
                ctx.beginPath();
                ctx.roundRect(xPosition + 2, yPosition + 2, panelWidth - 4, panelHeight - 4, cornerRadius);
                ctx.clip();
                ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
                ctx.restore();
            });

            // Draw pattern at the bottom if it exists
            if (pattern?.img) {
                const patternImg = new Image();
                patternImg.src = `../patterns/${pattern.img}`;
                await new Promise((resolve) => {
                    patternImg.onload = () => {
                        const yPosition = panels * (panelHeight + spacing) + borderSize;
                        const xPosition = horizontalPadding;

                        // Draw pattern image before clipping
                        ctx.beginPath();
                        ctx.roundRect(xPosition + 2, yPosition + 2, panelWidth - 4, panelHeight - 4, cornerRadius);
                        ctx.fill();

                        // Scale pattern proportionally
                        const imgAspectRatio = patternImg.width / patternImg.height;
                        const targetAspectRatio = panelWidth / panelHeight;
                        let drawWidth, drawHeight, offsetX, offsetY;

                        if (imgAspectRatio > targetAspectRatio) {
                            drawWidth = panelWidth - 4;
                            drawHeight = drawWidth / imgAspectRatio;
                            offsetX = xPosition + 2;
                            offsetY = yPosition + 2 + (panelHeight - drawHeight) / 2;
                        } else {
                            drawHeight = panelHeight - 4;
                            drawWidth = drawHeight * imgAspectRatio;
                            offsetX = xPosition + 2 + (panelWidth - drawWidth) / 2;
                            offsetY = yPosition + 2;
                        }

                        // Clip and draw the pattern image
                        ctx.save();
                        ctx.beginPath();
                        ctx.roundRect(xPosition + 2, yPosition + 2, panelWidth - 4, panelHeight - 4, cornerRadius);
                        ctx.clip();
                        ctx.drawImage(patternImg, offsetX, offsetY, drawWidth, drawHeight);
                        ctx.restore();

                        resolve();
                    };
                });
            } else {
                await new Promise((resolve) => {
                    const yPosition = panels * (panelHeight + spacing) + borderSize;
                    const xPosition = horizontalPadding;
                    const text = pattern?.name || "No pattern available";
                    const availableWidth = panelWidth - 4; // Panel width minus padding (left + right)
                    const textWidth = ctx.measureText(text).width; // Measure text width

                    // Calculate the horizontal position to center the text
                    const textX = xPosition + (availableWidth - textWidth) / 2;
                    // Draw text before clipping
                    ctx.fillStyle = "#000000"; // Black color for text
                    ctx.font = "bold 40px Arial";
                    ctx.textAlign = "center";
                    ctx.textBaseline = "middle";
                    ctx.fillText(text,textX, yPosition + 30);
                    resolve();
                });

        }


            // Convert canvas to high-quality image
            const photoStripImage = canvas.toDataURL("image/jpeg", 1.0); // Max quality
            setCapturedImage(photoStripImage);
        } catch (error) {
            console.error("Error generating photo strip:", error);
        }
    };

    const renderStripPreview = () => {
        if (!design || !design.includes("x")) {
            return <div className="text-red-500">Invalid design format</div>;
        }

        const panels = Number(design.split("x")[0]);

        return (
            <div className="flex flex-col justify-center items-center space-y-1 p-2 border-2 border-gray-300 rounded-lg shadow-lg bg-gray-50"  style={{ backgroundColor: color || "white" }}>
                {Array.from({ length: panels }).map((_, index) => (
                    <div
                        key={index}
                        className="w-20 h-20 bg-white border-2 border-black rounded-lg transform hover:scale-110 transition duration-300 ease-in-out "
                    >
                        {capturedImages[index] && (
                            <img
                                src={capturedImages[index]}
                                alt={`Captured ${index}`}
                                className="w-full h-full object-cover border-2 rounded-lg"
                            />
                        )}
                    </div>
                ))}

                {/* Show pattern image or pattern name */}
                {pattern?.img ? (
                    <div className="mt-2">
                        <img
                            src={`../patterns/${pattern.img}`}
                            alt={pattern.name}
                            className="w-20 h-20 object-contain"
                        />
                    </div>
                ) : (
                    <div className="mt-2 text-center text-lg font-semibold text-gray-700">
                        {pattern?.name}
                    </div>
                )}
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
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
            {!isCapturing && capturedImages.length===0 && (
                <h1 className="text-3xl font-bold mb-24">Ready??? Take a Picture....</h1>

            )}
            {!isCapturing && capturedImages.length>0 && (
                <h1 className="text-3xl font-bold mb-24">Done !! You can click next to download the image</h1>

            )}
            <div className="flex flex-row items-center justify-center space-x-10 bg-gray-100">

                <div className="flex flex-col mb-6">

                    {isCapturing && countdown > 0 && (
                        <div className="text-4xl text-center font-bold items-center justify-center text-red-500 mb-4">
                            {countdown}
                        </div>
                    )}

                    <div className="mb-6 flex justify-center">
                        <Webcam
                            ref={webcamRef}
                            screenshotFormat="image/jpeg"
                            className="rounded-3xl border-2 border-black shadow w-full max-w-sm aspect-[4/3]"
                            style={{
                                boxShadow: `46px 46px 92px ${shadowColor}, -46px -46px 92px ${shadowColor}`
                            }}
                            videoConstraints={{
                                facingMode: { exact: "user" },
                                width: 640,
                                height: 480,
                            }}
                        />
                    </div>
                </div>
                <div className="mb-6">
                    {renderStripPreview()}
                </div>
            </div>

            {/* Action buttons */}
            {!isCapturing && !isFinished && (
                <button
                    onClick={() => {
                        setCapturedImages([]);
                        setCurrentCaptureIndex(0);
                        setIsCapturing(true);
                        setCountdown(5);
                    }}
                    className="px-6 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
                >
                    Start Capturing
                </button>
            )}

            {isCapturing && countdown === 0 && currentCaptureIndex < totalCaptures && (
                <button
                    onClick={capture}
                    className="px-6 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
                >
                    Capture
                </button>
            )}

            {isFinished && (
                <div className="flex space-x-4 mt-6">
                    <button
                        onClick={handleRedo}
                        className="px-6 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                    >
                        Redo
                    </button>
                    <button
                        onClick={handleNext}
                        className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
}

export default TakePicture;
