'use client';

import Script from 'next/script';

interface KofiWidgetOverlay {
  draw: (username: string, options: { [key: string]: string }) => void;
}
declare const kofiWidgetOverlay: KofiWidgetOverlay;

export default function KoFiWidget() {
  return (
    <Script
      src="https://storage.ko-fi.com/cdn/scripts/overlay-widget.js"
      strategy="afterInteractive"
      onLoad={() => {
        if (window.innerWidth > 768) {
          kofiWidgetOverlay.draw('williamlwalkermontgomerie', {
            type: 'floating-chat',
            'floating-chat.donateButton.text': 'Support me',
            'floating-chat.donateButton.background-color': '#795548',
            'floating-chat.donateButton.text-color': '#fff',
          });
        }
      }}
    />
  );
}
