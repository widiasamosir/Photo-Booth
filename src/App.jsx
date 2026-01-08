import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import { useState } from "react";
import ChooseDesign from "./components/ChooseDesign";
import ChoosePattern from "./components/ChoosePattern";
import TakePicture from "./components/TakePicture";
import DownloadPage from "./components/DownloadPage";

function App() {
    const [design, setDesign] = useState("");
    const [pattern, setPattern] = useState("");
    const [capturedImage, setCapturedImage] = useState(null);
    const [color, setColor] = useState(null);
    const [filter, setFilter] = useState(null);
    const [sticker, setSticker] = useState(null);
    return (
        <Router>
            <Routes>
                <Route
                    path="/"
                    element={<ChooseDesign setDesign={setDesign} />}
                />
                <Route
                    path="/choose-pattern"
                    element={
                        <ChoosePattern
                            color={color}
                            setColor={setColor}
                            sticker={sticker}
                            setSticker={setSticker}
                            setPattern={setPattern}
                            design={design} // Pass the selected design as a prop
                            pattern={pattern}
                        />
                    }
                />
                <Route path="/take-picture" element={<TakePicture color={color} design={design} sticker={sticker} pattern={pattern} setCapturedImage={setCapturedImage} filter={filter} setFilter={setFilter} />} />
                <Route
                    path="/download"
                    element={
                        <DownloadPage
                            capturedImage={capturedImage}
                            design={design}
                            pattern={pattern}
                            sticker={sticker}
                            filter={filter}
                        />
                    }
                />
            </Routes>
        </Router>
    );
}

export default App;
