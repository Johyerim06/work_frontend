import { BrowserRouter, Routes, Route } from "react-router-dom";
import Contract from './pages/contract';
import Home from "./pages/Home"; // Home 컴포넌트 import 하기

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} /> {/* Home을 보여주자 */}
        <Route path="/contract" element={<Contract />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
