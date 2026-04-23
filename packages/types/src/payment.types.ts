export interface Address {
  street: string;
  city: string;
  state?: string;
  zip: string;
  country: string;
}

export interface CheckoutFormData {
  customerName: string;
  customerEmail: string;
  phone?: string;
  billingAddress: Address;
  shippingAddress?: Address;
  notes?: string;
  couponCode?: string;
  paymentProvider: string;
}
