import { useState, useRef } from "react";
import Webcam from "react-webcam";
import html2canvas from "html2canvas";

export default function PhotoBooth() {
    const webcamRef = useRef(null);
    const [images, setImages] = useState([]);

    const capture = () => {
        const imageSrc = webcamRef.current.getScreenshot();
        setImages([...images, imageSrc]);
    };

    const downloadPhoto = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = 400;
        canvas.height = 1200;

        images.forEach((img, index) => {
            const imgElement = new Image();
            imgElement.src = img;
            imgElement.onload = () => {
                ctx.drawImage(imgElement, 0, index * 300, 400, 300);
                if (index === images.length - 1) {
                    const link = document.createElement("a");
                    link.href = canvas.toDataURL("image/jpeg");
                    link.download = "photo_strip.jpg";
                    link.click();
                }
            };
        });
    };

    return (
        <div className="flex flex-col items-center p-6 bg-white shadow-lg rounded-lg">
            <h1 className="text-3xl font-bold mb-4">Photo Booth</h1>
            <Webcam
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                className="w-96 h-72 border-2 border-gray-300 rounded-md"
            />
            <div className="mt-4 flex gap-4">
                <button
                    onClick={capture}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition"
                >
                    Capture Photo
                </button>
                <button
                    onClick={downloadPhoto}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg shadow-md hover:bg-green-600 transition"
                >
                    Download Photo Strip
                </button>
            </div>
            <div id="photo-strip" className="mt-6 flex flex-col gap-2 border p-2">
                {images.map((img, index) => (
                    <img key={index} src={img} alt={`Captured ${index}`} className="w-32 h-32 border rounded-md" />
                ))}
            </div>
        </div>
    );
}
