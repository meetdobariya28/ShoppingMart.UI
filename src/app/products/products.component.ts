import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavigationService } from '../services/navigation.service';
import { UtilityService } from '../services/utility.service';
import { Product } from '../models/models';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css'],
})
export class ProductsComponent implements OnInit {
  view: 'grid' | 'list' = 'grid';
  sortby: 'default' | 'htl' | 'lth' = 'default';
  products: Product[] = []; //take an array

  constructor(
    private route: ActivatedRoute,
    private navService: NavigationService,
    private utiService: UtilityService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params: any) => {
      // take two params from url router
      let category = params.category;
      let subcategory = params.subcategory;

      if (category && subcategory)
        //if both exit in url
        this.navService //from backent navigation service GetProducts take the value from DB
          .getProducts(category, subcategory, 10)
          .subscribe((res: any) => {
            this.products = res;
          });
    });
  }

  sortByPrice(value: string) {
    this.products.sort((a, b) => {
      if (value == 'default') {
        return a.id > b.id ? 1 : -1; // here 1 is to sort a after b (b,a) & -1 is to sort b after a (a,b)
      }
      if (value == 'htl') {
        return this.utiService.applyDiscount(a.price, a.offer.discount) >
          this.utiService.applyDiscount(b.price, b.offer.discount)
          ? -1
          : 1;
      }
      if (value == 'lth') {
        return this.utiService.applyDiscount(a.price, a.offer.discount) >
          this.utiService.applyDiscount(b.price, b.offer.discount)
          ? 1
          : -1;
      }
      return 0;
    });
  }
}
