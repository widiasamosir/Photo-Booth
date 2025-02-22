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
                            setPattern={setPattern}
                            design={design} // Pass the selected design as a prop
                            pattern={pattern}
                        />
                    }
                />
                <Route path="/take-picture" element={<TakePicture design={design} pattern={pattern} setCapturedImage={setCapturedImage} />} />
                <Route
                    path="/download"
                    element={
                        <DownloadPage
                            capturedImage={capturedImage}
                            design={design}
                            pattern={pattern}
                        />
                    }
                />
            </Routes>
        </Router>
    );
}

export default App;
