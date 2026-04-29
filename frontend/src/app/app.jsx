import { BrowserRouter } from "react-router-dom";

import AppBootstrap from "@/app/bootstrap/AppBootstrap";
import AppOverlays from "@/app/components/AppOverlays";
import AppRoutes from "@/app/routes";

function App() {
  return (
    <BrowserRouter>
      <AppBootstrap>
        <AppRoutes />
        <AppOverlays />
      </AppBootstrap>
    </BrowserRouter>
  );
}

export default App;
