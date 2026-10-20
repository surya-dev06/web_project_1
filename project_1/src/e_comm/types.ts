export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  price: number;
  compare_at_price: number | null;
  image_avif: string | null;
  image_svg: string | null;
  image_jpg: string | null;
  stock: number;
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
};

export type CartItem = Product & { quantity: number };
export type OrderSummary = {
  id: string;
  order_number: string;
  customer_name: string;
  total: number;
  status: string;
  created_at: string;
};
