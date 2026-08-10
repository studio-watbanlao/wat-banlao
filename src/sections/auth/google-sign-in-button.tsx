import { useEffect, useRef } from 'react';
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
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  const renderGoogleButton = () => {
    if (!clientId || !window.google || !buttonRef.current) return;

    buttonRef.current.innerHTML = '';
    window.google.accounts.id.initialize({
      client_id: clientId,
      ux_mode: 'popup',
      callback: (response) => onCredential(response.credential),
    });
    window.google.accounts.id.renderButton(buttonRef.current, {
      type: 'standard',
      theme: 'outline',
      size: 'large',
      text: 'continue_with',
      shape: 'rectangular',
      logo_alignment: 'left',
      width: 320,
    });
  };

  useEffect(() => {
    renderGoogleButton();
    // The callback is intentionally refreshed only when the client ID changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId]);

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
      <Box ref={buttonRef} sx={{ display: 'flex', justifyContent: 'center', minHeight: 44 }} />
    </>
  );
}
