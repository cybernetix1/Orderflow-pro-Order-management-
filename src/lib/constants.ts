export const CAKE_PRICES: Record<number, Record<number, { 'Buttercream': number; 'Whipped Cream': number }>> = {
  7: {
    1: { 'Buttercream': 16000, 'Whipped Cream': 20000 },
    2: { 'Buttercream': 30000, 'Whipped Cream': 38000 },
    3: { 'Buttercream': 44000, 'Whipped Cream': 56000 },
  },
  8: {
    1: { 'Buttercream': 20000, 'Whipped Cream': 25000 },
    2: { 'Buttercream': 38000, 'Whipped Cream': 48000 },
    3: { 'Buttercream': 56000, 'Whipped Cream': 71000 },
  },
  9: {
    1: { 'Buttercream': 24000, 'Whipped Cream': 30000 },
    2: { 'Buttercream': 46000, 'Whipped Cream': 58000 },
    3: { 'Buttercream': 68000, 'Whipped Cream': 87000 },
  },
  10: {
    1: { 'Buttercream': 30000, 'Whipped Cream': 37000 },
    2: { 'Buttercream': 58000, 'Whipped Cream': 72000 },
    3: { 'Buttercream': 86000, 'Whipped Cream': 107000 },
  },
  11: {
    1: { 'Buttercream': 38000, 'Whipped Cream': 42000 },
    2: { 'Buttercream': 72000, 'Whipped Cream': 82000 },
    3: { 'Buttercream': 102000, 'Whipped Cream': 122000 },
  },
  12: {
    1: { 'Buttercream': 47000, 'Whipped Cream': 52000 },
    2: { 'Buttercream': 92000, 'Whipped Cream': 102000 },
    3: { 'Buttercream': 132000, 'Whipped Cream': 152000 },
  },
};

export const CAKE_SIZES = [7, 8, 9, 10, 11, 12];
export const CAKE_LAYERS = [1, 2, 3];
export const FROSTING_TYPES = ['Buttercream', 'Whipped Cream'] as const;
export const DELIVERY_TYPES = ['Room Delivery', 'Pickup'] as const;
export const PAYMENT_STATUSES = ['Pending', 'Partial', 'Paid'] as const;
export const ORDER_STATUSES = ['Pending', 'Processing', 'Ready', 'Out for Delivery', 'Completed'] as const;
