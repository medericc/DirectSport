// app/layout.tsx
"use client";
import React from 'react';
import { Provider } from 'react-redux';
import store from './redux/store';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <html lang="fr">
        <body>{children}</body>
      </html>
    </Provider>
  );
}
