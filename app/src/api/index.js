/* eslint-disable import/no-anonymous-default-export */
import {
  makePayment,
  getPayment,
  getAllElectricityPaymentById,
  getAllElectricityPaymentByUserId,
  getAllElectricityPayment,
  makeElectricityPayment,
  updateElectricityPayment,
} from './paymentAPI';
import { sendVoucherMail } from './transactionAPI';
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
import { addBeceCard } from './cardApi';
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

  //bece
  addBeceCard,
  //transaction
  sendVoucherMail,

  //electricity
  getAllMeters,
  getAllMetersById,
  getAllMetersByUserId,
  postMeter,
  putMeter,
  deleteMeter,

  getAllElectricityPaymentById,
  getAllElectricityPaymentByUserId,
  getAllElectricityPayment,
  makeElectricityPayment,
  updateElectricityPayment,
};
