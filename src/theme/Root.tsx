import React, { ReactNode } from 'react';
import CookieConsent from '@site/src/components/CookieConsent';
import PlatformAuthSync from '@site/src/components/PlatformAuthSync';

interface RootProps {
  children: ReactNode;
}

export default function Root({ children }: RootProps): React.ReactElement {
  return (
    <>
      {children}
      <PlatformAuthSync />
      <CookieConsent />
    </>
  );
}
