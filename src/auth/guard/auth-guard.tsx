import { useState, useEffect, useCallback } from 'react';

import { useAuthContext } from '../hooks';
import { getPostLoginPath } from '../post-login-path';

import { paths } from 'src/routes/paths';
import { usePathname, useRouter } from 'src/routes/hooks';
import { SplashScreen } from 'src/components/loading-screen';


// ----------------------------------------------------------------------

const loginPaths: Record<string, string> = {
  jwt: paths.auth.jwt.login,
  auth0: paths.auth.auth0.login,
  amplify: paths.auth.amplify.login,
  firebase: paths.auth.firebase.login,
};

// ----------------------------------------------------------------------

type Props = {
  children: React.ReactNode;
};

export default function AuthGuard({ children }: Props) {
  const { loading } = useAuthContext();

  return <>{loading ? <SplashScreen /> : <Container>{children}</Container>}</>;
}

// ----------------------------------------------------------------------

function Container({ children }: Props) {
  const router = useRouter();
  const pathname = usePathname();

  const { authenticated, method, user } = useAuthContext();

  const [checked, setChecked] = useState(false);

  const check = useCallback(() => {
    setChecked(false);

    if (!authenticated) {
      const searchParams = new URLSearchParams({
        returnTo: window.location.pathname,
      }).toString();

      const loginPath = loginPaths[method] || '/auth/login';

      const href = `${loginPath}?${searchParams}`;

      router.replace(href);
      return;
    }

    const hasTempleAccess = Boolean(user?.templeAccesses?.length);

    if (!['admin', 'super_admin'].includes(user?.role) && !hasTempleAccess) {
      router.replace(paths.page403);
      return;
    }

    const allowedPath = getPostLoginPath(user, pathname);
    if (allowedPath !== pathname) {
      router.replace(allowedPath);
      return;
    }

    setChecked(true);
  }, [authenticated, method, pathname, router, user]);

  useEffect(() => {
    check();
  }, [check]);

  if (!checked) {
    return null;
  }

  return <>{children}</>;
}
