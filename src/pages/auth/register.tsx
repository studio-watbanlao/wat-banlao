import RegisterView from "src/sections/auth/register";
import AuthLayout from "./layout";

export const metadata = {
  title: "Register",
};

const RegisterPage = () => {
  return (
    <AuthLayout>
      <RegisterView />
    </AuthLayout>
  );
};

export default RegisterPage;
