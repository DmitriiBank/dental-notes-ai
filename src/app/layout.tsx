import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = { title:"Dental Notes AI", description:"Демонстрационный помощник стоматологической документации" };
export default function RootLayout({children}:{children:React.ReactNode}) { return <html lang="ru"><body>{children}</body></html>; }
