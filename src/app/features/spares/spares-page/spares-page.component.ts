import {
  Component,
  OnInit,
  inject
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  FormControl,
  ReactiveFormsModule
} from '@angular/forms';

import {
  RouterLink
} from '@angular/router';

import {
  SpareProduct
} from '../../../models/spare-product';

import {
  SpareService
} from '../../../core/services/spare.service';

import {
  CartService
} from '../../../core/services/cart.service';


@Component({
  selector: 'app-spares-page',

  standalone: true,

  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink
  ],

  templateUrl:
    './spares-page.component.html',

  styleUrl:
    './spares-page.component.scss'
})


export class SparesPageComponent
  implements OnInit {


  private spareService =
    inject(SpareService);


  private cartService =
    inject(CartService);


  products: SpareProduct[] = [];


  searchControl =
    new FormControl('', {
      nonNullable: true
    });


  ngOnInit(): void {

    this.loadProducts();


    this.searchControl.valueChanges
      .subscribe(
        (search: string) => {

          this.searchProducts(search);

        }
      );

  }


  // =====================================================
  // LOAD PRODUCTS
  // =====================================================

  loadProducts(): void {

    this.spareService
      .getProducts()
      .subscribe({

        next: (
          products: SpareProduct[]
        ) => {

          this.products =
            products;

        },

        error: (error) => {

          console.error(
            'Failed to load products:',
            error
          );

        }

      });

  }


  // =====================================================
  // SEARCH PRODUCTS
  // =====================================================

  searchProducts(
    search: string
  ): void {

    if (!search.trim()) {

      this.loadProducts();

      return;

    }


    this.spareService
      .searchProducts(search)
      .subscribe({

        next: (
          products: SpareProduct[]
        ) => {

          this.products =
            products;

        },

        error: (error) => {

          console.error(
            'Search error:',
            error
          );

        }

      });

  }


  // =====================================================
  // ADD TO QUOTE
  // =====================================================

  addToQuote(
    product: SpareProduct
  ): void {

    this.cartService.addToCart(
      product
    );

  }


  // =====================================================
  // CART COUNT
  // =====================================================

  getCartCount(): number {

    return this.cartService
      .getItems()
      .reduce(
        (
          total: number,
          item
        ) => {

          return total + item.quantity;

        },
        0
      );

  }

}