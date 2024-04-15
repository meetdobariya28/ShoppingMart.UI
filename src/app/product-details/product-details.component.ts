import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavigationService } from '../services/navigation.service';
import { UtilityService } from '../services/utility.service';
import { Product, Review } from '../models/models';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.css'],
})
export class ProductDetailsComponent implements OnInit {
  imageIndex: number = 1;
  product!: Product;
  reviewCotrol = new FormControl('');
  showError = false;
  reviewSaved = false;
  otherReview: Review[] = [];

  constructor(
    private route: ActivatedRoute,
    private navService: NavigationService,
    public utiService: UtilityService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params: any) => {
      let id = params.id;
      this.navService.getProduct(id).subscribe((res: any) => {
        this.product = res;
        this.fetchAllReviews(); //when we initialize this page
      });
    });
  }

  submitReview() {
    let review = this.reviewCotrol.value;

    if (review == '' || review == null) {
      this.showError = true;
      return;
    }

    let userid = this.utiService.getUser().id;
    let productid = this.product.id;

    this.navService
      .submitReview(userid, productid, review)
      .subscribe((res: any) => {
        //saved the review and make form value empty.
        this.reviewSaved = true;
        this.fetchAllReviews(); // When we give reviews then it will fatch the others review
        this.reviewCotrol.setValue('');
      });
  }
  fetchAllReviews() {
    this.otherReview = [];
    this.navService
      .getAllProductReviews(this.product.id)
      .subscribe((res: any) => {
        for (let review of res) {
          this.otherReview.push(review);
        }
      });
  }
}
