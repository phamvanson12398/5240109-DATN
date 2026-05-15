import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  selectCurrentUser,
  selectIsAuthenticated,
} from "@/features/auth/authSelectors";
import { fetchCart, syncCartWithUser } from "@/features/cart/cartSlice";
import { loaderUser } from "@/features/user/userSlice";

function AppBootstrap({ children }) {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectCurrentUser);
  const [authResolved, setAuthResolved] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setAuthResolved(true);
      return;
    }

    let isMounted = true;

    dispatch(loaderUser()).finally(() => {
      if (isMounted) {
        setAuthResolved(true);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [dispatch]);

  useEffect(() => {
    if (!authResolved) return;

    const userId = user?._id ?? null;

    dispatch(syncCartWithUser(userId));

    if (isAuthenticated && userId) {
      dispatch(fetchCart());
    }
  }, [authResolved, dispatch, isAuthenticated, user]);

  return children;
}

export default AppBootstrap;
