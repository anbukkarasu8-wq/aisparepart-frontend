import { Injectable } from '@angular/core';

import {
  HttpClient
} from '@angular/common/http';

import {
  Observable
} from 'rxjs';

import {
  map
} from 'rxjs/operators';

import {
  SpareProduct
} from '../../models/spare-product';


@Injectable({
  providedIn: 'root'
})
export class SpareService {

  private apiUrl =
    'http://localhost:3000';


  constructor(
    private http: HttpClient
  ) {}


  // =====================================================
  // GET ALL SPARES
  // =====================================================

  getProducts():
    Observable<SpareProduct[]> {

    return this.http.get<any>(

      `${this.apiUrl}/spares`

    ).pipe(

      map(
        (response: any) => {

          if (
            Array.isArray(response)
          ) {

            return response;

          }


          if (
            response?.results &&
            Array.isArray(response.results)
          ) {

            return response.results;

          }


          return [];

        }
      )

    );

  }


  // =====================================================
  // SEARCH SPARES
  // =====================================================

  searchProducts(

    make: string,

    model: string = ''

  ): Observable<SpareProduct[]> {

    return this.http.post<any>(

      `${this.apiUrl}/spares/search`,

      {

        make: make,

        model: model

      }

    ).pipe(

      map(
        (response: any) => {

          if (
            Array.isArray(response)
          ) {

            return response;

          }


          if (
            response?.results &&
            Array.isArray(response.results)
          ) {

            return response.results;

          }


          return [];

        }
      )

    );

  }

}