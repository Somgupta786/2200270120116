import { BrowserRouter, Routes, Route } from "react-router-dom";
import UrlShortener from "./pages/UrlShortener";
import Analytics from "./pages/Analytics";
import Logs from "./pages/Logs";
import RedirectHandler from "./pages/RedirectHandler";
import NotFound from "./pages/NotFound";

const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<UrlShortener />} />
      <Route path="/analytics" element={<Analytics />} />
      <Route path="/logs" element={<Logs />} />
      <Route path="/:shortCode" element={<RedirectHandler />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  </BrowserRouter>
);

export default App;
