"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type CartLine = {
  productId: string;
  variantId: string;
  quantity: number;
};

function isCartLine(value: unknown): value is CartLine {
  if (!value || typeof value !== "object") return false;
  const line = value as Record<string, unknown>;
  return (
    typeof line.productId === "string" &&
    typeof line.variantId === "string" &&
    typeof line.quantity === "number" &&
    Number.isInteger(line.quantity) &&
    line.quantity > 0
  );
}

type CartContextValue = {
  lines: CartLine[];
  count: number;
  hydrated: boolean;
  addItem: (productId: string, variantId: string, stock: number) => void;
  setQuantity: (variantId: string, quantity: number) => void;
  removeItem: (variantId: string) => void;
};

const storageKey = "mimo-cart";
const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let restoredLines: CartLine[] = [];
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed: unknown = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const validLines = parsed.filter(isCartLine);
          if (validLines.length === parsed.length) {
            restoredLines = validLines;
          } else {
            console.error("В сохранённой корзине обнаружены некорректные данные.");
            localStorage.removeItem(storageKey);
          }
        }
      }
    } catch (error) {
      console.error("Не удалось восстановить сохранённую корзину.", error);
    }

    const timer = window.setTimeout(() => {
      setLines(restoredLines);
      setHydrated(true);
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (hydrated) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(lines));
      } catch (error) {
        console.error("Не удалось сохранить корзину в этом браузере.", error);
      }
    }
  }, [hydrated, lines]);

  const value = useMemo<CartContextValue>(
    () => ({
      lines,
      count: lines.reduce((sum, line) => sum + line.quantity, 0),
      hydrated,
      addItem(productId, variantId, stock) {
        setLines((current) => {
          const existing = current.find((line) => line.variantId === variantId);
          if (existing) {
            return current.map((line) =>
              line.variantId === variantId
                ? { ...line, quantity: Math.min(line.quantity + 1, stock) }
                : line,
            );
          }
          if (stock <= 0) return current;
          return [...current, { productId, variantId, quantity: 1 }];
        });
      },
      setQuantity(variantId, quantity) {
        setLines((current) =>
          current
            .map((line) =>
              line.variantId === variantId ? { ...line, quantity } : line,
            )
            .filter((line) => line.quantity > 0),
        );
      },
      removeItem(variantId) {
        setLines((current) =>
          current.filter((line) => line.variantId !== variantId),
        );
      },
    }),
    [hydrated, lines],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const value = useContext(CartContext);
  if (!value) {
    throw new Error("useCart должен использоваться внутри CartProvider");
  }
  return value;
}
