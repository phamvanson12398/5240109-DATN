import { Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

import { selectCurrentUser } from "@/features/auth/authSelectors";
import DashboardLayout from "@/features/admin/layout/DashboardLayout";

function AdminLayout() {
  const user = useSelector(selectCurrentUser);

  return (
    <DashboardLayout user={user}>
      <Outlet />
    </DashboardLayout>
  );
}

export default AdminLayout;
