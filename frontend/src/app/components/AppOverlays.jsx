import { useSelector } from "react-redux";

import {
  selectCurrentUser,
  selectIsAuthenticated,
} from "@/features/auth/authSelectors";
import AIChatBubble from "@/features/chat/components/AIChatBubble";
import UserDashboard from "@/features/user/UserDashboardView";

function AppOverlays() {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectCurrentUser);

  return (
    <>
      {/* UserDashboard moved to Navbar to prevent overlap issues */}
      <AIChatBubble />
    </>
  );
}

export default AppOverlays;
