"use client";

import { GuestGuard } from "src/auth/guard";
import AuthLayoutCompact from "src/layouts/auth/compact";

type Props = {
  children: React.ReactNode;
  split?: boolean;
};

const AuthLayout = ({ children, split = false }: Props) => {
  return (
    <GuestGuard>
      <AuthLayoutCompact split={split}>{children}</AuthLayoutCompact>
    </GuestGuard>
  );
};
export default AuthLayout;
