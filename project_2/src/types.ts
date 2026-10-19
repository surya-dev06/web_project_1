export type MenuItem = {
  id: string; name: string; description: string; category: string; price: number;
  image_url: string; is_available: boolean; is_vegetarian: boolean; is_featured: boolean;
};
export type CartItem = MenuItem & { quantity: number };
export type Order = {
  id: string; order_number: string; customer_name: string; table_number: number | null;
  items: { id: string; name: string; price: number; quantity: number }[];
  total: number; status: "new" | "preparing" | "ready" | "served" | "cancelled";
  created_at: string;
};
