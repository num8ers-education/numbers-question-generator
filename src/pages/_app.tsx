import React from 'react';
import { AppProps } from 'next/app';
import { Router } from 'next/router';
import '@/styles/globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { AIProvider } from '@/context/AIContext';

// Loading indicator state
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';

// Configure loading indicator
NProgress.configure({ showSpinner: false });

// Handle loading indicator
Router.events.on('routeChangeStart', () => NProgress.start());
Router.events.on('routeChangeComplete', () => NProgress.done());
Router.events.on('routeChangeError', () => NProgress.done());

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <AIProvider>
        <Component {...pageProps} />
      </AIProvider>
    </AuthProvider>
  );
}

export default MyApp;