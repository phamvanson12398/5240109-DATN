import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

function useProductDrawer() {
  const location = useLocation();
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  useEffect(() => {
    setIsMobileDrawerOpen(false);
  }, [location]);

  useEffect(() => {
    if (isMobileDrawerOpen) {
      document.body.classList.add("no-scroll");
    } else {
      document.body.classList.remove("no-scroll");
    }

    return () => document.body.classList.remove("no-scroll");
  }, [isMobileDrawerOpen]);

  return {
    isMobileDrawerOpen,
    setIsMobileDrawerOpen,
  };
}

export default useProductDrawer;
