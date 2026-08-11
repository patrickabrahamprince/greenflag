export const metadata = {
  title: 'GreenFlag Admin — Waitlist Outreach',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Inter, Arial, sans-serif',
          background: '#FAF9F7',
          color: '#1A1A1A',
        }}
      >
        {children}
      </body>
    </html>
  );
}
