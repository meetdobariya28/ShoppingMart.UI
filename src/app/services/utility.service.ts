import { Injectable } from '@angular/core';
import { Subject, window } from 'rxjs';
import { NavigationService } from './navigation.service';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Cart, Payment, Product, User } from '../models/models';

@Injectable({
  providedIn: 'root',
})
export class UtilityService {
  changeCart = new Subject(); //Observable

  constructor(
    private navigationService: NavigationService,
    private jwt: JwtHelperService
  ) {}

  applyDiscount(price: number, discount: number): number {
    let finalPrice: number = price - price * (discount / 100);
    return finalPrice;
  }

  // step 1: Helps to store in JWT in local Storage..
  //step 2: JWT Helper Service : npm install @auth0/angular-jwt step 1
  //step 3: add jwtModule same code "JwtModule.forRoot({..." in app.module.ts file and if it show error then restart VS Code.
  //step 4: use the below three service where needed like in login.ts file
  //step 5: add jwt helperService in this constructor.

  setUser(token: string) {
    //set user in local storage from login.ts file
    localStorage.setItem('user', token);
  }
  isLoggedIn() {
    return localStorage.getItem('user') ? true : false;
  }
  logoutUser() {
    localStorage.removeItem('user');
  }

  getUser(): User {
    //return login data from the return
    let token = this.jwt.decodeToken();
    let user: User = {
      id: token.id,
      firstName: token.firstName,
      lastName: token.lastName,
      address: token.address,
      mobile: token.mobile,
      email: token.email,
      password: '',
      createdAt: token.createdAt,
      modifiedAt: token.modifiedAt,
    };
    return user;
  }
  addToCart(product: Product) {
    let productid = product.id;
    let userid = this.getUser().id;

    this.navigationService
      .addTOCart(userid, productid)
      .subscribe((res: any) => {
        if (res.toString() == 'Inserted') this.changeCart.next(1);
      });
  }

  totalPayment(cart: Cart, payment: Payment) {
    payment.totalAmount, payment.amountPaid, payment.amountReduced == 0;

    for (let item of cart.cartItems) {
      payment.totalAmount += item.product.price;

      payment.amountReduced +=
        item.product.price -
        this.applyDiscount(item.product.price, item.product.offer.discount);

      payment.amountPaid += this.applyDiscount(
        item.product.price,
        item.product.offer.discount
      );
    }
    //Shiping Charges
    if (payment.amountPaid > 500000) payment.shipingCharges = 2000;
    else if (payment.amountPaid > 300000) payment.shipingCharges = 1000;
    else if (payment.amountPaid > 100000) payment.shipingCharges = 500;
    else if (payment.amountPaid < 100000 && payment.amountPaid > 1)
      payment.shipingCharges = 200;
  }

  prevPricePaid(cart: Cart) {
    let pricepaid = 0;
    for (let item of cart.cartItems) {
      pricepaid += this.applyDiscount(
        item.product.price,
        item.product.offer.discount
      );
    }
    return pricepaid;
  }
}
