import { lazy, Suspense, useContext, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { CustomContext } from "../../context/providers/CustomProvider";

import Layout from "./Layout";
import PayLoading from "../../components/PayLoading";
import GlobalAlert from "../../components/alert/GlobalAlert";
import EmailSent from "../EmailSent";
import User from "./User";

import Login from "../Login";
import Register from "../Register";
const Profile = lazy(() => import("../profile"));
const Personal = lazy(() => import("../profile/Personal"));
const Notification = lazy(() => import("../notification"));
const Updates = lazy(() => import("../profile/Updates"));
const Transaction = lazy(() => import("../transactions"));
const VerifyTicket = lazy(() => import("../VerifyTicket"));
import Home from "../home/Home";
import Privacy from "../Privacy";
import Terms from "../Terms";
import Hosting from "../hosting";
import Downloads from "../downloads";

import EVoucher from "../evoucher/EVoucher";
import Shop from "../evoucher/Shop";
const Wallet = lazy(() => import("../wallet"));
const Electricity = lazy(() => import("../electricity"));
const Airtime = lazy(() => import("../airtime"));
import WAECChecker from "../evoucher/WAECChecker";
const SecurityService = lazy(() => import("../evoucher/SecurityService"));
const UniversityForms = lazy(() => import("../evoucher/UniversityForms"));
const CinemaTickets = lazy(() => import("../cinema/CinemaTickets"));
const StadiaTickets = lazy(() => import("../stadium/StadiaTickets"));
const Checkout = lazy(() => import("../Checkout"));
const NotFound = lazy(() => import("../NotFound"));
const BusTickets = lazy(() => import("../bus/BusTickets"));
const Bus = lazy(() => import("../bus"));
const BusPreview = lazy(() => import("../bus/BusPreview"));
const BusTicketCheckout = lazy(() => import("../bus/BusTicketCheckout"));
const Cinema = lazy(() => import("../cinema"));
const Movie = lazy(() => import("../cinema/Movie"));
const CinemaTicketCheckout = lazy(() =>
  import("../cinema/CinemaTicketCheckout")
);
const Stadium = lazy(() => import("../stadium"));
const MatchTicket = lazy(() => import("../stadium/MatchTicket"));
const MatchTicketCheckout = lazy(() =>
  import("../stadium/MatchTicketCheckout")
);

const Prepaid = lazy(() => import("../electricity/Prepaid"));
const Meters = lazy(() => import("../electricity/individual/Meters"));
const BuyPrepaid = lazy(() => import("../electricity/BuyPrepaid"));
const PaymentSuccess = lazy(() => import("../payment/PaymentSuccess"));
import Organisation from "../organisation";
import LostVoucher from "../evoucher/LostVoucher";
import Pending from "../Pending";
import { globalAlertType } from "../../components/alert/alertType";
import AirtimeHome from "../airtime/AirtimeHome";
import AirtimeBuy from "../airtime/AirtimeBuy";
import BulkAirtimeBuy from "../airtime/BulkAirtimeBuy";
import GetStarted from "../GetStarted";
import Error from "../Error";

function Shell() {
  const { customDispatch } = useContext(CustomContext);

  const {
    customState: { alertData },
  } = useContext(CustomContext);

  useEffect(() => {
    const handleOnline = () => {
      customDispatch(globalAlertType("info", "Connection Restored"));
    };

    const handleOffline = () => {
      customDispatch(
        globalAlertType("error", "Internet Connection Lost! Try reconnecting.")
      );
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [customDispatch]);

  return (
    <>
      <Routes>
        <Route
          path="/"
          element={
            <Suspense fallback={<PayLoading />}>
              <Layout />
            </Suspense>
          }
        >
          <Route index element={<Home />} />

          {/* electricity */}
          <Route
            path="/electricity"
            element={
              <Suspense fallback={<PayLoading />}>
                <Electricity />
              </Suspense>
            }
          >
            <Route
              index
              element={
                <Suspense fallback={<PayLoading />}>
                  <Prepaid />
                </Suspense>
              }
            />
            <Route
              path="meters"
              element={
                <Suspense fallback={<PayLoading />}>
                  <Meters />
                </Suspense>
              }
            />
            <Route
              path="verify/:meterNo/:meterName"
              element={
                <Suspense fallback={<PayLoading />}>
                  <BuyPrepaid />
                </Suspense>
              }
            />
          </Route>
          <Route
            path="/airtime"
            element={
              <Suspense fallback={<PayLoading />}>
                <Airtime />
              </Suspense>
            }
          >
            <Route index element={<AirtimeHome />} />
            <Route path="buy" element={<AirtimeBuy />} />
            <Route path="bulk_airtime/buy" element={<BulkAirtimeBuy />} />
          </Route>

          {/* Evoucher */}
          <Route path="evoucher" element={<EVoucher />}>
            <Route index element={<Shop />} />

            <Route path="waec-checker" element={<WAECChecker />} />
            <Route
              path="security-service"
              element={
                <Suspense fallback={<PayLoading />}>
                  <SecurityService />
                </Suspense>
              }
            />
            <Route
              path="university-form"
              element={
                <Suspense fallback={<PayLoading />}>
                  <UniversityForms />
                </Suspense>
              }
            />
            {/* cinema  */}
            <Route
              path="cinema-ticket"
              element={
                <Suspense fallback={<PayLoading />}>
                  <Cinema />
                </Suspense>
              }
            >
              <Route
                index
                element={
                  <Suspense fallback={<PayLoading />}>
                    <CinemaTickets />
                  </Suspense>
                }
              />
              <Route
                path="movie/:id"
                element={
                  <Suspense fallback={<PayLoading />}>
                    <Movie />
                  </Suspense>
                }
              />
              <Route
                path="movie/:id/buy"
                element={
                  <Suspense fallback={<PayLoading />}>
                    <CinemaTicketCheckout />
                  </Suspense>
                }
              />
            </Route>
            {/* bus */}
            <Route
              path="bus-ticket"
              element={
                <Suspense fallback={<PayLoading />}>
                  <Bus />
                </Suspense>
              }
            >
              <Route
                index
                element={
                  <Suspense fallback={<PayLoading />}>
                    <BusTickets />
                  </Suspense>
                }
              />

              <Route
                path="preview"
                element={
                  <Suspense fallback={<PayLoading />}>
                    <BusPreview />
                  </Suspense>
                }
              />
              <Route
                path="preview/buy/:id"
                element={
                  <Suspense fallback={<PayLoading />}>
                    <BusTicketCheckout />
                  </Suspense>
                }
              />
            </Route>

            <Route
              path="stadia-ticket"
              element={
                <Suspense fallback={<PayLoading />}>
                  <Stadium />
                </Suspense>
              }
            >
              <Route
                index
                element={
                  <Suspense fallback={<PayLoading />}>
                    <StadiaTickets />
                  </Suspense>
                }
              />
              <Route
                path="match/:id"
                element={
                  <Suspense fallback={<PayLoading />}>
                    <MatchTicket />
                  </Suspense>
                }
              />
              <Route
                path="match/:id/buy"
                element={
                  <Suspense fallback={<PayLoading />}>
                    <MatchTicketCheckout />
                  </Suspense>
                }
              />
            </Route>

            <Route
              path="retrieve"
              element={
                <Suspense fallback={<PayLoading />}>
                  <LostVoucher />
                </Suspense>
              }
            />
          </Route>

          {/* Download */}
          <Route path="downloads" element={<Downloads />} />
          {/* hosting */}
          <Route path="hosting" element={<Hosting />} />

          {/* hosting */}
          <Route path="business" element={<Organisation />} />

          <Route
            path="transactions"
            element={
              <Suspense fallback={<PayLoading />}>
                <Transaction />
              </Suspense>
            }
          />

          <Route
            path="profile"
            element={
              <Suspense fallback={<PayLoading />}>
                <Profile />
              </Suspense>
            }
          >
            <Route
              index
              element={
                <Suspense fallback={<PayLoading />}>
                  <Personal />
                </Suspense>
              }
            />

            <Route
              path="updates/:field"
              element={
                <Suspense fallback={<PayLoading />}>
                  <Updates />
                </Suspense>
              }
            />
          </Route>
          <Route
            path="notifications"
            element={
              <Suspense fallback={<PayLoading />}>
                <Notification />
              </Suspense>
            }
          />
          <Route
            path="wallet"
            element={
              <Suspense fallback={<PayLoading />}>
                <Wallet />
              </Suspense>
            }
          />
          <Route
            path="verify"
            element={
              <Suspense fallback={<PayLoading />}>
                <VerifyTicket />
              </Suspense>
            }
          />
        </Route>

        <Route path="privacy-policy" element={<Privacy />} />
        <Route path="terms-and-conditions" element={<Terms />} />

        <Route path="/user" element={<User />}>
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="verify" element={<EmailSent />} />
          <Route path="started" element={<GetStarted />} />
        </Route>

        <Route path="offline" element={<Error />} />
        <Route
          path="checkout"
          element={
            <Suspense fallback={<PayLoading />}>
              <Checkout />
            </Suspense>
          }
        />
        <Route
          path="confirm"
          element={
            <Suspense fallback={<PayLoading />}>
              <Pending />
            </Suspense>
          }
        />

        <Route
          path="payment/success"
          element={
            <Suspense fallback={<PayLoading />}>
              <PaymentSuccess />
            </Suspense>
          }
        />

        <Route
          path="*"
          element={
            <Suspense fallback={<PayLoading />}>
              <NotFound />
            </Suspense>
          }
        />
      </Routes>

      {alertData.message && <GlobalAlert />}
    </>
  );
}

export default Shell;
