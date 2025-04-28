import { BrowserRouter, Routes, Route } from "react-router-dom";
import SendEmail from "./pages/SendEmail";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SendEmail />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
