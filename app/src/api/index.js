/* eslint-disable import/no-anonymous-default-export */
import {
  makePayment,
  getPayment,
  makeElectricityPayment,
} from './paymentAPI';

import {
  getAllVouchersCategory,
  getCategory,
  postCategory,
  editCategory,
  deleteCategory,
  postCinemaTicketCategory,
  postStadiumTicketCategory,
} from './categoryAPI';
import { getVoucherByVoucherType } from './voucherAPI';
import { getBusByVoucherType } from './busAPI';
import { getCinema } from './cinemaAPI';

import {
  getAllMeters,
  getAllMetersById,
  getAllMetersByUserId,
  postMeter,
  putMeter,
  deleteMeter,
} from './meterAPI';
export default {
  //CATEGORY
  getAllVouchersCategory,
  getCategory,
  postCategory,
  editCategory,
  deleteCategory,

  //stadium
  postStadiumTicketCategory,
  //cinema
  postCinemaTicketCategory,
  getCinema,
  //Bus
  getBusByVoucherType,

  //VOUCHERS
  getVoucherByVoucherType,

  makePayment,
  getPayment,

  //electricity
  getAllMeters,
  getAllMetersById,
  getAllMetersByUserId,
  postMeter,
  putMeter,
  deleteMeter,


  makeElectricityPayment,

};
