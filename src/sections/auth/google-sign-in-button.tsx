import { useCallback, useEffect, useRef } from 'react';
import Script from 'next/script';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';

type GoogleCredentialResponse = {
  credential: string;
};

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (options: {
            client_id: string;
            callback: (response: GoogleCredentialResponse) => void;
            ux_mode?: 'popup' | 'redirect';
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: Record<string, string | number | boolean>
          ) => void;
        };
      };
    };
  }
}

type Props = {
  onCredential: (credential: string) => void;
};

export default function GoogleSignInButton({ onCredential }: Props) {
  const buttonRef = useRef<HTMLDivElement>(null);
  const onCredentialRef = useRef(onCredential);
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  useEffect(() => {
    onCredentialRef.current = onCredential;
  }, [onCredential]);

  const renderGoogleButton = useCallback(() => {
    if (!clientId || !window.google || !buttonRef.current) return;

    const availableWidth = Math.floor(buttonRef.current.getBoundingClientRect().width);
    const buttonWidth = Math.min(400, Math.max(200, availableWidth));

    buttonRef.current.innerHTML = '';
    window.google.accounts.id.initialize({
      client_id: clientId,
      ux_mode: 'popup',
      callback: (response) => onCredentialRef.current(response.credential),
    });
    window.google.accounts.id.renderButton(buttonRef.current, {
      type: 'standard',
      theme: 'outline',
      size: 'large',
      text: 'continue_with',
      shape: 'rectangular',
      logo_alignment: 'left',
      width: buttonWidth,
    });
  }, [clientId]);

  useEffect(() => {
    renderGoogleButton();

    if (!buttonRef.current || typeof ResizeObserver === 'undefined') return undefined;

    const resizeObserver = new ResizeObserver(renderGoogleButton);
    resizeObserver.observe(buttonRef.current);

    return () => resizeObserver.disconnect();
  }, [renderGoogleButton]);

  if (!clientId) {
    return <Alert severity="warning">Missing NEXT_PUBLIC_GOOGLE_CLIENT_ID</Alert>;
  }

  return (
    <>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={renderGoogleButton}
      />
      <Box
        ref={buttonRef}
        sx={{ width: 1, minWidth: 0, minHeight: 44, display: 'flex', justifyContent: 'center' }}
      />
    </>
  );
}
