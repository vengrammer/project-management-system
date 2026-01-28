
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPageRoute from "./Router/LandingPageRoute";
import NotFound from "./components/NotFound";
import HomeRoute from "./Router/HomeRoute";
function App() {
  return (
    <BrowserRouter>
      <Routes>  
        <Route path="/*" element={<LandingPageRoute />} />
        <Route path="workspace/*" element={<HomeRoute />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}
export default App