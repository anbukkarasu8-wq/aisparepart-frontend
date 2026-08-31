import { Injectable } from '@angular/core';

import {
  BehaviorSubject,
  Observable
} from 'rxjs';

import {
  SpareProduct
} from '../../models/spare-product';


export interface CartItem {

  product: SpareProduct;

  quantity: number;

}


@Injectable({
  providedIn: 'root'
})
export class CartService {


  private cartItemsSubject =
    new BehaviorSubject<CartItem[]>([]);


  cartItems$:
    Observable<CartItem[]> =
    this.cartItemsSubject.asObservable();


  constructor() {

    this.loadCart();

  }


  // =====================================================
  // GET CART
  // =====================================================

  getCart(): CartItem[] {

    return this.cartItemsSubject.value;

  }


  // =====================================================
  // GET ITEMS
  // =====================================================

  getItems(): CartItem[] {

    return this.cartItemsSubject.value;

  }


  // =====================================================
  // ADD TO CART
  // =====================================================

  addToCart(
    product: SpareProduct
  ): void {

    const currentItems =
      this.cartItemsSubject.value;


    const existingItem =
      currentItems.find(
        item =>
          item.product.id === product.id
      );


    if (existingItem) {

      existingItem.quantity++;

      this.cartItemsSubject.next([
        ...currentItems
      ]);

    } else {

      const newItem: CartItem = {

        product: product,

        quantity: 1

      };


      this.cartItemsSubject.next([
        ...currentItems,
        newItem
      ]);

    }


    this.saveCart();

  }


  // =====================================================
  // REMOVE FROM CART
  // =====================================================

  removeFromCart(
    productId: number
  ): void {

    const updatedItems =
      this.cartItemsSubject.value.filter(
        item =>
          item.product.id !== productId
      );


    this.cartItemsSubject.next(
      updatedItems
    );


    this.saveCart();

  }


  // =====================================================
  // INCREASE
  // =====================================================

  increaseQuantity(
    productId: number
  ): void {

    const items =
      this.cartItemsSubject.value;


    const item =
      items.find(
        cartItem =>
          cartItem.product.id === productId
      );


    if (!item) {

      return;

    }


    item.quantity++;


    this.cartItemsSubject.next([
      ...items
    ]);


    this.saveCart();

  }


  // =====================================================
  // DECREASE
  // =====================================================

  decreaseQuantity(
    productId: number
  ): void {

    const items =
      this.cartItemsSubject.value;


    const item =
      items.find(
        cartItem =>
          cartItem.product.id === productId
      );


    if (!item) {

      return;

    }


    if (item.quantity > 1) {

      item.quantity--;

    } else {

      this.removeFromCart(productId);

      return;

    }


    this.cartItemsSubject.next([
      ...items
    ]);


    this.saveCart();

  }


  // =====================================================
  // CLEAR CART
  // =====================================================

  clearCart(): void {

    this.cartItemsSubject.next([]);

    this.saveCart();

  }


  // =====================================================
  // CART COUNT
  // =====================================================

  getCartCount(): number {

    return this.cartItemsSubject.value
      .reduce(
        (
          total: number,
          item: CartItem
        ) => {

          return total + item.quantity;

        },
        0
      );

  }


  // =====================================================
  // CART TOTAL
  // =====================================================

  getCartTotal(): number {

    return this.cartItemsSubject.value
      .reduce(
        (
          total: number,
          item: CartItem
        ) => {

          const price =
            Number(
              item.product.selling_price ?? 0
            );


          return (
            total +
            price * item.quantity
          );

        },
        0
      );

  }


  // =====================================================
  // SAVE CART
  // =====================================================

  private saveCart(): void {

    try {

      localStorage.setItem(
        'ai-spare-parts-cart',
        JSON.stringify(
          this.cartItemsSubject.value
        )
      );

    } catch (error) {

      console.error(
        'Unable to save cart:',
        error
      );

    }

  }


  // =====================================================
  // LOAD CART
  // =====================================================

  private loadCart(): void {

    try {

      const savedCart =
        localStorage.getItem(
          'ai-spare-parts-cart'
        );


      if (!savedCart) {

        return;

      }


      const items:
        CartItem[] =
        JSON.parse(savedCart);


      if (
        Array.isArray(items)
      ) {

        this.cartItemsSubject.next(
          items
        );

      }

    } catch (error) {

      console.error(
        'Unable to load cart:',
        error
      );

    }

  }

}