export interface CartVariant {
  _id: string;
  color: {
    _id: string;
    name: string;
    code: string;
    type: string;
  };
  price: number;
  priceFinal: number;
  percentDiscount?: number;
  product?: {
    _id: string;
    name?: string;
  };
}

export interface CartSize {
  _id: string;
  value: string | number;
  description?: string;
}

export interface CartItem {
  _id: string;
  productName: string;
  image: string;
  variant: CartVariant;
  size: CartSize;
  quantity: number;
  price: number;
  isSelected: boolean;
  isAvailable: boolean;
  unavailableReason?: string;
}

export interface CartData {
  _id: string;
  user: string;
  cartItems: CartItem[];
  // Làm totalQuantity optional vì backend có thể không trả về
  totalQuantity?: number;
  subTotal?: number;
  createdAt: string;
  updatedAt: string;
}
