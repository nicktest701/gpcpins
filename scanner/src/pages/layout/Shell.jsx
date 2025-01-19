import { lazy, Suspense, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { useCustomData } from "../../context/providers/CustomProvider";
import { globalAlertType } from "../../components/alert/alertType";

import PayLoading from "../../components/PayLoading";
import GlobalAlert from "../../components/alert/GlobalAlert";
import Worker from "../workers";
import Login from "../Login";
import EmailSent from "../EmailSent";
import User from "./User";
import ForgotPassword from "../ForgotPassword";
import ForgotPasswordLink from "../ForgotPasswordLink";
import EmployeePassword from "../workers/EmployeePassword";
import ManageTickets from "../tickets/ManageTickets";

const Layout = lazy(() => import("./Layout"));
const EVoucher = lazy(() => import("../evoucher/EVoucher"));
const CategoryDetails = lazy(() =>
  import("../../components/tabs/CategoryDetails")
);
const VerifierAssignedTickets = lazy(() => import("../verifiers"));
const Voucher = lazy(() => import("../evoucher/add/Voucher"));
const Settings = lazy(() => import("../settings"));
const Summary = lazy(() => import("../summary"));
const Profile = lazy(() => import("../profile"));
const Personal = lazy(() => import("../profile/Personal"));
const Updates = lazy(() => import("../profile/Updates"));
const ViewEmployees = lazy(() => import("../workers/ViewEmployees"));
const ViewEmployee = lazy(() => import("../workers/ViewEmployee"));
const NewEmployee = lazy(() => import("../workers/NewEmployee"));
const UpdateVerifier = lazy(() => import("../workers/UpdateVerifier"));
const Tickets = lazy(() => import("../tickets"));
const AssignTicket = lazy(() => import("../tickets/AssignTicket"));
const AssignedTicketDetails = lazy(() =>
  import("../tickets/AssignedTicketDetails")
);
const TicketAssignmentPage = lazy(() =>
  import("../tickets/TicketAssignmentPage")
);

const Notification = lazy(() => import("../notifications"));
const Message = lazy(() => import("../messages"));
const Logs = lazy(() => import("../logs"));

const Overall = lazy(() => import("../summary/Overall"));
const NotFound = lazy(() => import("../NotFound"));

function Shell() {
  const { customState, customDispatch } = useCustomData();

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
          <Route
            index
            element={
              <Suspense fallback={<PayLoading />}>
                <Overall />
              </Suspense>
            }
          />
          {/* Evoucher */}

          <Route
            path="evoucher"
            element={
              <Suspense fallback={<PayLoading />}>
                <EVoucher />
              </Suspense>
            }
          >
            <Route
              path=":category"
              element={
                <Suspense fallback={<PayLoading />}>
                  <Voucher />
                </Suspense>
              }
            />
            <Route
              path=":category/:id"
              element={
                <Suspense fallback={<PayLoading />}>
                  <CategoryDetails />
                </Suspense>
              }
            />
          </Route>
          {/* Assigned Tickets  */}
          <Route
            path="assigned-tickets"
            element={
              <Suspense fallback={<PayLoading />}>
                <VerifierAssignedTickets />
              </Suspense>
            }
          />

          {/* Tickets */}

          <Route
            path="tickets"
            element={
              <Suspense fallback={<PayLoading />}>
                <Tickets />
              </Suspense>
            }
          >
            <Route
              index
              element={
                <Suspense fallback={<PayLoading />}>
                  <ManageTickets />
                </Suspense>
              }
            />
            <Route
              path=":category/:id"
              element={
                <Suspense fallback={<PayLoading />}>
                  <AssignTicket />
                </Suspense>
              }
            />
            <Route
              path="assign"
              element={
                <Suspense fallback={<PayLoading />}>
                  <TicketAssignmentPage />
                </Suspense>
              }
            />
          </Route>

          {/* Employees */}

          <Route
            path="verifiers"
            element={
              <Suspense fallback={<PayLoading />}>
                <Worker />
              </Suspense>
            }
          >
            <Route
              index
              element={
                <Suspense fallback={<PayLoading />}>
                  <ViewEmployees />
                </Suspense>
              }
            />

            <Route
              path="new"
              element={
                <Suspense fallback={<PayLoading />}>
                  <NewEmployee />
                </Suspense>
              }
            />
            <Route
              path=":id"
              element={
                <Suspense fallback={<PayLoading />}>
                  <ViewEmployee />
                </Suspense>
              }
            />
            <Route
              path=":id/ticket-details/:ticketId"
              element={
                <Suspense fallback={<PayLoading />}>
                  <AssignedTicketDetails />
                </Suspense>
              }
            />
            <Route
              path=":id/edit"
              element={
                <Suspense fallback={<PayLoading />}>
                  <UpdateVerifier />
                </Suspense>
              }
            />
     
          </Route>

          {/* Summary  */}

          <Route
            path="summary"
            element={
              <Suspense fallback={<PayLoading />}>
                <Summary />
              </Suspense>
            }
          />
          {/* Messages  */}

          <Route
            path="messages"
            element={
              <Suspense fallback={<PayLoading />}>
                <Message />
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
            path="settings"
            element={
              <Suspense fallback={<PayLoading />}>
                <Settings />
              </Suspense>
            }
          />
          <Route
            path="notifications"
            element={
              <Suspense fallback={<PayLoading />}>
                <Notification />
              </Suspense>
            }
          />

          <Route
            path="logs"
            element={
              <Suspense fallback={<PayLoading />}>
                <Logs />
              </Suspense>
            }
          />
        </Route>

        <Route path="auth" element={<User />}>
          <Route path="login" element={<Login />} />
          <Route path="code" element={<EmailSent />} />
          <Route path="confirm" element={<EmployeePassword />} />
          <Route path="forgot" element={<ForgotPassword />} />
          <Route path="link" element={<ForgotPasswordLink />} />
        </Route>

        <Route
          path="*"
          element={
            <Suspense fallback={<PayLoading />}>
              <NotFound />
            </Suspense>
          }
        />
      </Routes>

      {customState?.alertData.message && <GlobalAlert />}
    </>
  );
}

export default Shell;
