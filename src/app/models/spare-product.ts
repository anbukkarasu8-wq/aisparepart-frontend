export interface SpareProduct {

  id: number;

  part_number: string;

  name: string;

  brand: string;

  category: string;

  mrp: number;

  selling_price: number;

  stock: number;

  compatibility?: string;

}