/**
 * features/auth — Public barrel exports
 * Consumers import from "@/features/auth" instead of deep paths.
 */

// Views (route-level components)
export { default as LoginView } from "./LoginView";
export { default as RegisterView } from "./RegisterView";
export { default as ForgotPasswordView } from "./ForgotPasswordView";
export { default as ResetPasswordView } from "./ResetPasswordView";
export { default as LoginSuccessView } from "./LoginSuccessView";

// Shared components
export { AuthCard } from "./components/AuthCard";
export { SocialLogin } from "./components/SocialLogin";

// Hooks
export { useLogin } from "./hooks/useLogin";
export { useRegister } from "./hooks/useRegister";
export { useForgotPassword } from "./hooks/useForgotPassword";
export { useResetPassword } from "./hooks/useResetPassword";

// Selectors (existing)
export * from "./authSelectors";
