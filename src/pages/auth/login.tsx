import LoginView from "src/sections/auth/login";
import AuthLayout from "./layout";

export const metadata = {
  title: "Login",
};

const LoginPage = () => {
  return (
    <AuthLayout>
      <LoginView />
    </AuthLayout>
  );
};

export default LoginPage;
