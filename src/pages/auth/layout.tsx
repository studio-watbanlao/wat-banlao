"use client";

import { GuestGuard } from "src/auth/guard";
import AuthLayoutCompact from "src/layouts/auth/compact";

type Props = {
  children: React.ReactNode;
};

const AuthLayout = ({ children }: Props) => {
  return (
    <GuestGuard>
      <AuthLayoutCompact>{children}</AuthLayoutCompact>
    </GuestGuard>
  );
};
export default AuthLayout;
