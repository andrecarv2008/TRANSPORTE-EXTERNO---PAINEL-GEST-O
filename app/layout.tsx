import type {Metadata} from 'next';
import { Hanken_Grotesk } from 'next/font/google';
import './globals.css'; // Global styles

const hankenGrotesk = Hanken_Grotesk({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-hanken',
});

export const metadata: Metadata = {
  title: 'Grupo Mateus - Transp. Externo',
  description: 'Painel de Gestão de Frota, Produtividade, Monitoramento de Viagens e Performance de Motoristas',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="pt-BR" className={`${hankenGrotesk.variable}`}>
      <body className="font-sans antialiased bg-[#f8f9ff] text-[#0b1c30]" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
