import AuthLayout from "./layout";

import LoginView from "src/sections/auth/login";

export const metadata = {
  title: "Login",
};

const LoginPage = () => {
  return (
    <AuthLayout split>
      <LoginView />
    </AuthLayout>
  );
};

export default LoginPage;
