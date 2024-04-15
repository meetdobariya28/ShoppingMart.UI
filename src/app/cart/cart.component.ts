import { Component, OnInit } from '@angular/core';
import { NavigationService } from '../services/navigation.service';
import { UtilityService } from '../services/utility.service';
import { Cart, Payment } from '../models/models';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css'],
})
export class CartComponent implements OnInit {
  userCart: Cart = {
    id: 0,
    user: this.UtiService.getUser(),
    cartItems: [],
    ordered: false,
    orderedOn: '',
  };
  userPaymentInfo: Payment = {
    id: 0,
    user: this.UtiService.getUser(),
    paymentMethod: {
      id: 0,
      type: '',
      provider: '',
      available: false,
      reason: '',
    },
    totalAmount: 0,
    shipingCharges: 0,
    amountReduced: 0,
    amountPaid: 0,
    createdAt: '',
  };
  prevCart: Cart[] = [];

  constructor(
    private navService: NavigationService,
    public UtiService: UtilityService
  ) {}

  ngOnInit(): void {
    //Get Cart from Backend
    this.navService
      .GetActiveCartOfUser(this.UtiService.getUser().id) //Send user Id
      .subscribe((res: any) => {
        //added res
        this.userCart = res;

        //Calculate Cart
        this.UtiService.totalPayment(this.userCart, this.userPaymentInfo);
      });

    //Get previous cart
    this.navService
      .getAllPreviousCartsOfUser(this.UtiService.getUser().id)
      .subscribe((res: any) => {
        this.prevCart = res;
      });
  }
}
