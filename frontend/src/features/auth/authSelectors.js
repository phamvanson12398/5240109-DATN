export const selectAuthState = (state) => state.user;

export const selectCurrentUser = (state) => selectAuthState(state).user;

export const selectIsAuthenticated = (state) =>
  selectAuthState(state).isAuthenticated;

export const selectAuthLoading = (state) => selectAuthState(state).loading;

export const selectUserRole = (state) => {
  const user = selectCurrentUser(state);

  return user?.role_id?.name || user?.role || null;
};

export const selectCanAccessAdmin = (state) =>
  selectIsAuthenticated(state) && selectUserRole(state) === "admin";
