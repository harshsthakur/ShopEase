import React, { createContext, useState, useEffect, useContext } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    const localData = localStorage.getItem('shopease_cart');
    return localData ? JSON.parse(localData) : [];
  });

  useEffect(() => {
    localStorage.setItem('shopease_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // Add item to cart
  const addToCart = (product, qty = 1) => {
    setCartItems(prevItems => {
      const existItem = prevItems.find(item => item.product === product._id);
      
      const requestedQty = existItem ? existItem.qty + qty : qty;
      
      // Stock safety check
      if (requestedQty > product.stock) {
        alert(`Cannot add more items. Only ${product.stock} items left in stock.`);
        return prevItems;
      }

      if (existItem) {
        return prevItems.map(item =>
          item.product === product._id ? { ...item, qty: requestedQty } : item
        );
      } else {
        return [
          ...prevItems,
          {
            product: product._id,
            name: product.name,
            price: product.price,
            image: product.image,
            stock: product.stock,
            qty,
            isSubscription: product.isSubscription || false,
            planId: product.planId || null,
            products: product.products || null
          }
        ];
      }
    });
  };

  // Remove item from cart
  const removeFromCart = (productId) => {
    setCartItems(prevItems => prevItems.filter(item => item.product !== productId));
  };

  // Adjust item quantity
  const changeQuantity = (productId, qty) => {
    if (qty <= 0) {
      removeFromCart(productId);
      return;
    }

    setCartItems(prevItems =>
      prevItems.map(item => {
        if (item.product === productId) {
          if (qty > item.stock) {
            alert(`Only ${item.stock} items available in stock.`);
            return item;
          }
          return { ...item, qty };
        }
        return item;
      })
    );
  };

  // Empty cart
  const clearCart = () => {
    setCartItems([]);
  };

  // Calculate pricing summaries
  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);
  const tax = subtotal * 0.08; // 8% sales tax
  const shipping = subtotal > 100 || subtotal === 0 ? 0 : 10; // Free shipping over ₹100
  const total = subtotal + tax + shipping;

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        changeQuantity,
        clearCart,
        subtotal: parseFloat(subtotal.toFixed(2)),
        tax: parseFloat(tax.toFixed(2)),
        shipping: parseFloat(shipping.toFixed(2)),
        total: parseFloat(total.toFixed(2))
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
