import "@/styles/globals.css";
import { CartProvider } from "@/context/CartContext";
import { CartDrawer } from "@/components/CartDrawer";

export default function App({ Component, pageProps }) {
  return (
    <CartProvider>
      <main
        style={{
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Helvetica, Arial, sans-serif",
        }}
      >
        <Component {...pageProps} />
        <CartDrawer />
      </main>
    </CartProvider>
  );
}
