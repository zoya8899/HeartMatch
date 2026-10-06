import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { ProductItem } from '../types';
import { DEFAULT_PRODUCTS } from '../services/seedData';
import { stripeService } from '../services/stripeService';

interface ProductsContextType {
  products: ProductItem[];
  plans: ProductItem[];
  consumables: ProductItem[];
  loading: boolean;
  getProduct: (id: string) => ProductItem | undefined;
  updateProduct: (id: string, updates: Partial<ProductItem>) => Promise<void>;
  refreshProducts: () => Promise<void>;
}

const ProductsContext = createContext<ProductsContextType | undefined>(undefined);

export const ProductsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<ProductItem[]>(DEFAULT_PRODUCTS);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchCatalogue = useCallback(async () => {
    try {
      // 1. Try server backend endpoint
      const serverProducts = await stripeService.fetchProducts();
      if (serverProducts && serverProducts.length > 0) {
        setProducts(serverProducts);
        setLoading(false);
        return;
      }

      // 2. Try Firestore 'products' collection
      const snap = await getDocs(collection(db, 'products'));
      if (!snap.empty) {
        const firestoreList = snap.docs.map((d) => ({ id: d.id, ...d.data() } as ProductItem));
        setProducts(firestoreList);
      } else {
        setProducts(DEFAULT_PRODUCTS);
      }
    } catch (err) {
      console.warn('Using default seed products catalogue:', err);
      setProducts(DEFAULT_PRODUCTS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCatalogue();
  }, [fetchCatalogue]);

  const getProduct = useCallback(
    (id: string): ProductItem | undefined => {
      return products.find((p) => p.id === id) || DEFAULT_PRODUCTS.find((p) => p.id === id);
    },
    [products]
  );

  const updateProduct = async (id: string, updates: Partial<ProductItem>) => {
    // Optimistic UI update
    setProducts((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );

    try {
      // Update backend server state
      await stripeService.updateProduct(id, updates);

      // Also persist to Firestore if possible
      await setDoc(doc(db, 'products', id), updates, { merge: true });
    } catch (err) {
      console.error('Failed to persist product update:', err);
    }
  };

  const plans = products.filter((p) => p.category === 'subscription');
  const consumables = products.filter((p) => p.category === 'consumable');

  return (
    <ProductsContext.Provider
      value={{
        products,
        plans,
        consumables,
        loading,
        getProduct,
        updateProduct,
        refreshProducts: fetchCatalogue,
      }}
    >
      {children}
    </ProductsContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductsContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductsProvider');
  }
  return context;
};
