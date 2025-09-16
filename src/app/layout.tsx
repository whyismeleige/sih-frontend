import "./globals.css";
export const metadata = {
  title: "Farma Mitra",
  description: "Farmers Best Friend",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html >
      <head>
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
