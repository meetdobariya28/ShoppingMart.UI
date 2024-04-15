import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { NavigationService } from '../services/navigation.service';
import { UtilityService } from '../services/utility.service';
import { Cart, Order, Payment, PaymentMethod } from '../models/models';
import { timer } from 'rxjs';
import { Router, RouterEvent } from '@angular/router';

@Component({
  selector: 'app-order',
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.css'],
})
export class OrderComponent implements OnInit {
  selectedPaymentMethodName = '';
  address = '';
  mobileNumber = '';
  displaySpinner = false;
  message = '';
  selectedPaymentMethod = new FormControl('0');
  paymentMethods: PaymentMethod[] = [];
  classname = '';

  userCart: Cart = {
    id: 0,
    user: this.utiService.getUser(),
    cartItems: [],
    ordered: false,
    orderedOn: '',
  };
  userPaymentInfo: Payment = {
    id: 0,
    user: this.utiService.getUser(),
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

  constructor(
    private navService: NavigationService,
    public utiService: UtilityService,
    private router: Router
  ) {}

  ngOnInit(): void {
    //Get payment Mehhod
    this.navService.getPaymentMethods().subscribe((res: any) => {
      this.paymentMethods = res;
    });

    this.selectedPaymentMethod.valueChanges.subscribe((res: any) => {
      if (res == '0') this.selectedPaymentMethodName = '';
      else this.selectedPaymentMethodName = res.toString();
    });
    //Get Cart
    this.navService
      .GetActiveCartOfUser(this.utiService.getUser().id)
      .subscribe((res: any) => {
        this.userCart = res;
        //Calculate Cart
        this.utiService.totalPayment(res, this.userPaymentInfo);
      });
    //set address and phone number
    this.address = this.utiService.getUser().address;
    this.mobileNumber = this.utiService.getUser().mobile;
  }
  getpaymentMethod(id: string) {
    //payment method for proceed section to get same value
    let x = this.paymentMethods.find((v) => v.id == parseInt(id)); //find the which we passed
    return x?.type + ' - ' + x?.provider; //return  its type and provider if exist "?" we used ? to ignore nullable value.
  }

  placeOrder() {
    //Place order to pay
    this.displaySpinner = true;
    let isPaySucc = this.payMoney();

    if (!isPaySucc) {
      this.displaySpinner = false;
      this.message = '*Something went Wrong! Please try again!';
      this.classname = 'text-danger';
      return;
    }
    let step = 0;
    let count = timer(0, 3000).subscribe((res: any) => {
      ++step;
      if (step == 1) {
        this.message = 'Processing Payment... Please wait!';
        this.classname = 'text-success';
      }
      if (step == 2) {
        this.message = 'Payment Successfull';
        this.storeOrder();
      }
      if (step == 3) {
        this.displaySpinner = false;
        this.message = 'Your Ordered has been placed, Thank you';
      }
      if (step == 4) {
        this.router.navigateByUrl('/home');
        count.unsubscribe();
      }
    });
  }
  payMoney() {
    //here we haven't make
    //use to check is paid or not from the backend
    return true;
  }
  storeOrder() {
    //do it ordered and unactive in backend
    let payment: Payment;
    let pmId = 0; //Payment id
    if (this.selectedPaymentMethod.value)
      // If there is value then select it
      pmId = parseInt(this.selectedPaymentMethod.value);

    payment = {
      id: 0,
      paymentMethod: {
        id: pmId,
        type: '',
        provider: '',
        available: false,
        reason: '',
      },
      user: this.utiService.getUser(),
      totalAmount: this.userPaymentInfo.totalAmount,
      shipingCharges: this.userPaymentInfo.shipingCharges,
      amountReduced: this.userPaymentInfo.amountReduced,
      amountPaid: this.userPaymentInfo.amountPaid,
      createdAt: '',
    };
    this.navService.insertPayment(payment).subscribe((res: any) => {
      payment.id = parseInt(res);
      let order: Order = {
        id: 0,
        user: this.utiService.getUser(),
        cart: this.userCart,
        payment: payment,
        createdAt: '',
      };

      this.navService.insertOrder(order).subscribe((res: any) => {
        this.utiService.changeCart.next(0); //if it is ordered and inserted in DB then change the value of Cart to 0
      });
    });
  }
}
