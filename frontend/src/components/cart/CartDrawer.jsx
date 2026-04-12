import { Link } from "react-router-dom";
import { useCart } from "../../hooks/useCart";
import { Drawer } from "../ui/Drawer";
import { CartItem } from "./CartItem";

export function CartDrawer({ open, onClose }) {
  const { cart, updateItem, removeItem } = useCart();

  return (
    <Drawer open={open} onClose={onClose} title="Your Cart">
      <div className="space-y-4">
        {cart.items?.length ? (
          cart.items.map((item) => (
            <CartItem
              key={item.id}
              item={item}
              onUpdate={(quantity) => updateItem(item.id, quantity)}
              onRemove={() => removeItem(item.id)}
            />
          ))
        ) : (
          <p className="text-sm text-copy/70">Your cart is empty.</p>
        )}
        <Link
          to="/cart"
          className="block rounded-full bg-ink px-5 py-3 text-center text-sm font-semibold text-white"
        >
          Open Cart
        </Link>
      </div>
    </Drawer>
  );
}
