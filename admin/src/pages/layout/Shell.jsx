import { lazy, Suspense, useEffect } from "react";
import { Routes, Route, Outlet } from "react-router-dom";
import { useCustomData } from "../../context/providers/CustomProvider";
import { useAuth } from "../../context/providers/AuthProvider";
import { globalAlertType } from "../../components/alert/alertType";

import Layout from "./Layout";
import PayLoading from "../../components/PayLoading";
import GlobalAlert from "../../components/alert/GlobalAlert";
import Worker from "../workers";
import EmailSent from "../EmailSent";
import User from "./User";

import Login from "../Login";
import MessageHome from "../messages/MessageHome";
import VerifyEmployee from "../workers/VerifyEmployee";

const Electricity = lazy(() => import("../electricity"));
const ProcessPrepaidTransaction = lazy(() =>
  import("../electricity/ProcessPrepaidTransaction")
);
const ViewECGTransactionNotifications = lazy(() =>
  import("../electricity/ViewECGTransactionNotifications")
);

const Summary = lazy(() => import("../summary"));
const Profile = lazy(() => import("../profile"));
const Personal = lazy(() => import("../profile/Personal"));
const Updates = lazy(() => import("../profile/Updates"));
const Transaction = lazy(() => import("../transactions"));

const ViewEmployees = lazy(() => import("../workers/ViewEmployees"));
const EmployeeRoles = lazy(() => import("../workers/EmployeeRoles"));
const VerifyTicket = lazy(() => import("../VerifyTicket"));

import EmployeePassword from "../workers/EmployeePassword";
import BulkAirtimeTransaction from "../airtime/BulkAirtimeTransaction";
import Airtime from "../airtime";
import ViewEmployee from "../workers/ViewEmployee";
import ForgotPassword from "../ForgotPassword";
import ForgotPasswordLink from "../ForgotPasswordLink";
import Products from "../summary/Products";
import Electric from "../summary/Electric";
import Bundle from "../summary/Bundle";
import Transactions from "../summary/Transactions";
import Report from "../summary/Report";
import AgentTransaction from "../summary/agentSummary";

//Refund
const Refund = lazy(() => import("../refund"));
const RefundDetails = lazy(() => import("../refund/RefundDetails"));

const SummaryAirtime = lazy(() => import("../summary/Airtime"));
const Notification = lazy(() => import("../notifications"));
const Settings = lazy(() => import("../settings"));
const Logs = lazy(() => import("../logs"));

//Wallet
const Wallet = lazy(() => import("../wallet"));
const UsersWallet = lazy(() => import("../wallet/UsersWallet"));
const AgentsWallet = lazy(() => import("../wallet/AgentsWallet"));
const UsersWalletTransactions = lazy(() =>
  import("../wallet/UsersWalletTransactions")
);
const AgentsWalletTransactions = lazy(() =>
  import("../wallet/AgentsWalletTransactions")
);

const UserHome = lazy(() => import("../users"));
const UserDetails = lazy(() => import("../users/UserDetails"));
const ViewUser = lazy(() => import("../users/ViewUser"));

const AgentDetails = lazy(() => import("../airtime/agent/AgentDetails"));
const Agent = lazy(() => import("../airtime/agent"));
const Overall = lazy(() => import("../summary/Overall"));

const EVoucher = lazy(() => import("../evoucher/EVoucher"));
const CategoryDetails = lazy(() =>
  import("../../components/tabs/CategoryDetails")
);
const Voucher = lazy(() => import("../evoucher/add/Voucher"));
const NotFound = lazy(() => import("../NotFound"));
const PinsGenerator = lazy(() => import("../evoucher/PinsGenerator"));

//Prepaid Meter
const ECGTransactions = lazy(() => import("../electricity/ECGTransactions"));
const Meters = lazy(() => import("../electricity/Meters"));

// const Client = lazy(() => import("../clients"));
const AddWAECCategory = lazy(() => import("../waec/AddWAECCategory"));
const EditWAECCategory = lazy(() => import("../waec/EditWAECCategory"));
const AddUniversityCategory = lazy(() =>
  import("../university/AddUniversityCategory")
);
const EditUniversityCategory = lazy(() =>
  import("../university/EditUniversityCategory")
);
const AddCinemaCategory = lazy(() => import("../cinema/AddCinemaCategory"));
const EditCinemaCategory = lazy(() => import("../cinema/EditCinemaCategory"));
const AddStadiumCategory = lazy(() => import("../stadium/AddStadiumCategory"));
const EditStadiumCategory = lazy(() =>
  import("../stadium/EditStadiumCategory")
);
const AddBusCategory = lazy(() => import("../bus/AddBusCategory"));
const EditBusCategory = lazy(() => import("../bus/EditBusCategory"));
const AddSecurityCategory = lazy(() =>
  import("../security/AddSecurityCategory")
);
const EditSecurityCategory = lazy(() =>
  import("../security/EditSecurityCategory")
);

function Shell() {
  const { user } = useAuth();
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
        <Route path="/" element={<Layout />}>
          <Route
            index
            element={
              <Suspense fallback={<PayLoading />}>
                <Overall />
              </Suspense>
            }
          />
          {/* Evoucher */}
          {user?.permissions?.includes("Vouchers & Tickets") && (
            <Route
              path="evoucher"
              element={
                <Suspense fallback={<PayLoading />}>
                  <EVoucher />
                </Suspense>
              }
            >
              {user?.permissions?.includes("Generate Pins & Serials") && (
                <Route
                  path="generate"
                  element={
                    <Suspense fallback={<PayLoading />}>
                      <PinsGenerator />
                    </Suspense>
                  }
                />
              )}

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
          )}

          {/* electricity */}
          {user?.permissions?.includes("Prepaid Units") && (
            <Route
              path="/electricity"
              element={
                <Suspense fallback={<PayLoading />}>
                  <Electricity />
                </Suspense>
              }
            >
              {user?.permissions?.includes("View Meters") && (
                <Route
                  path="meters"
                  element={
                    <Suspense fallback={<PayLoading />}>
                      <Meters />
                    </Suspense>
                  }
                />
              )}

              {user?.permissions?.includes("View Prepaid Transaction") && (
                <>
                  <Route
                    path="transactions"
                    element={
                      <Suspense fallback={<PayLoading />}>
                        <ECGTransactions />
                      </Suspense>
                    }
                  />

                  <Route
                    path="process"
                    element={
                      <Suspense fallback={<PayLoading />}>
                        <ProcessPrepaidTransaction />
                      </Suspense>
                    }
                  />
                  <Route
                    path="notifications"
                    element={
                      <Suspense fallback={<PayLoading />}>
                        <ViewECGTransactionNotifications />
                      </Suspense>
                    }
                  />
                </>
              )}
            </Route>
          )}

          {/* airtime */}
          {user?.permissions?.includes("Airtime") && (
            <Route
              path="/airtime"
              element={
                <Suspense fallback={<PayLoading />}>
                  <Airtime />
                </Suspense>
              }
            >
              {user?.permissions?.includes("View Bulk Airtime Transaction") && (
                <Route
                  path="transactions"
                  element={
                    <Suspense fallback={<PayLoading />}>
                      <BulkAirtimeTransaction />
                    </Suspense>
                  }
                />
              )}

              {user?.permissions?.includes("Agents") && (
                <>
                  <Route
                    path="agent"
                    element={
                      <Suspense fallback={<PayLoading />}>
                        <Agent />
                      </Suspense>
                    }
                  />
                  <Route
                    path="agent/details/:id"
                    element={
                      <Suspense fallback={<PayLoading />}>
                        <AgentDetails />
                      </Suspense>
                    }
                  />
                </>
              )}
            </Route>
          )}

          {/* Employees */}
          {user?.permissions?.includes("Employees") && (
            <Route
              path="employees"
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
                path=":id"
                element={
                  <Suspense fallback={<PayLoading />}>
                    <ViewEmployee />
                  </Suspense>
                }
              />
              {user?.permissions?.includes("Manage Roles & Permissions") && (
                <Route
                  path="roles/:id"
                  element={
                    <Suspense fallback={<PayLoading />}>
                      <EmployeeRoles />
                    </Suspense>
                  }
                />
              )}
            </Route>
          )}
          {/* Users */}
          {user?.permissions?.includes("Users") && (
            <Route
              path="users"
              element={
                <Suspense fallback={<PayLoading />}>
                  <UserHome />
                </Suspense>
              }
            >
              <Route
                index
                element={
                  <Suspense fallback={<PayLoading />}>
                    <ViewUser />
                  </Suspense>
                }
              />
              <Route
                path="details/:id"
                element={
                  <Suspense fallback={<PayLoading />}>
                    <UserDetails />
                  </Suspense>
                }
              />
            </Route>
          )}
          {/* Wallet Details */}
          {(user?.permissions?.includes("User Wallets") ||
            user?.permissions?.includes("Agent Wallets")) && (
            <Route
              path="wallets"
              element={
                <Suspense fallback={<PayLoading />}>
                  <Wallet />
                </Suspense>
              }
            >
              {user?.permissions?.includes("User Wallets") && (
                <>
                  <Route
                    index
                    element={
                      <Suspense fallback={<PayLoading />}>
                        <UsersWallet />
                      </Suspense>
                    }
                  />
                  <Route
                    path="users/transactions"
                    element={
                      <Suspense fallback={<PayLoading />}>
                        <UsersWalletTransactions />
                      </Suspense>
                    }
                  />
                </>
              )}
              {user?.permissions?.includes("Agent Wallets") && (
                <>
                  <Route
                    path="agent"
                    element={
                      <Suspense fallback={<PayLoading />}>
                        <AgentsWallet />
                      </Suspense>
                    }
                  />
                  <Route
                    path="agents/transactions"
                    element={
                      <Suspense fallback={<PayLoading />}>
                        <AgentsWalletTransactions />
                      </Suspense>
                    }
                  />
                </>
              )}
            </Route>
          )}
          {/* Messages */}
          {user?.permissions?.includes("Messages") && (
            <Route
              path="messages"
              element={
                <Suspense fallback={<PayLoading />}>
                  <MessageHome />
                </Suspense>
              }
            />
          )}
          {/* Summary  */}
          {user?.permissions?.includes("Summary") && (
            <Route
              path="summary"
              element={
                <Suspense fallback={<PayLoading />}>
                  <Summary />
                </Suspense>
              }
            >
              <Route
                path="vouchers-tickets"
                element={
                  <Suspense fallback={<PayLoading />}>
                    <Products />
                  </Suspense>
                }
              />
              <Route
                path="prepaid-units"
                element={
                  <Suspense fallback={<PayLoading />}>
                    <Electric />
                  </Suspense>
                }
              />
              <Route
                path="airtime"
                element={
                  <Suspense fallback={<PayLoading />}>
                    <SummaryAirtime />
                  </Suspense>
                }
              />
              <Route
                path="data-bundle"
                element={
                  <Suspense fallback={<PayLoading />}>
                    <Bundle />
                  </Suspense>
                }
              />
              <Route
                path="agent-transactions"
                element={
                  <Suspense fallback={<PayLoading />}>
                    <AgentTransaction />
                  </Suspense>
                }
              />
              <Route
                path="transactions"
                element={
                  <Suspense fallback={<PayLoading />}>
                    <Transactions />
                  </Suspense>
                }
              />
              <Route
                path="report"
                element={
                  <Suspense fallback={<PayLoading />}>
                    <Report />
                  </Suspense>
                }
              />
            </Route>
          )}

          <Route
            path="transactions"
            element={
              <Suspense fallback={<PayLoading />}>
                <Transaction />
              </Suspense>
            }
          />
          {/* refund  */}
          <Route
            path="refund"
            element={
              <Suspense fallback={<PayLoading />}>
                <>
                  <Outlet />
                </>
              </Suspense>
            }
          >
            <Route
              index
              element={
                <Suspense fallback={<PayLoading />}>
                  <Refund />
                </Suspense>
              }
            />

            <Route
              path="details"
              element={
                <Suspense fallback={<PayLoading />}>
                  <RefundDetails />
                </Suspense>
              }
            />
          </Route>

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

          {user?.permissions?.includes("Settings") && (
            <Route
              path="settings"
              element={
                <Suspense fallback={<PayLoading />}>
                  <Settings />
                </Suspense>
              }
            />
          )}

          <Route
            path="verify"
            element={
              <Suspense fallback={<PayLoading />}>
                <VerifyTicket />
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
          <Route path="verify" element={<VerifyEmployee />} />
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

      <>
        {user?.permissions?.includes("Create new checkers") && (
          <Suspense fallback={<PayLoading />}>
            <AddWAECCategory />
          </Suspense>
        )}
        {user?.permissions?.includes("Edit checkers") && (
          <Suspense fallback={<PayLoading />}>
            <EditWAECCategory />
          </Suspense>
        )}

        {/* security */}

        {/* university  */}
        {user?.permissions?.includes("Create new forms") && (
          <Suspense fallback={<PayLoading />}>
            <AddUniversityCategory />
          </Suspense>
        )}
        {user?.permissions?.includes("Edit forms") && (
          <Suspense fallback={<PayLoading />}>
            <EditUniversityCategory />
          </Suspense>
        )}

        {user?.permissions?.includes("Create security service forms") && (
          <Suspense fallback={<PayLoading />}>
            <AddSecurityCategory />
          </Suspense>
        )}
        {user?.permissions?.includes("Edit security service forms") && (
          <Suspense fallback={<PayLoading />}>
            <EditSecurityCategory />
          </Suspense>
        )}
        {/* cinema  */}
        {user?.permissions?.includes("Create cinema tickets") && (
          <Suspense fallback={<PayLoading />}>
            <AddCinemaCategory />
          </Suspense>
        )}
        {user?.permissions?.includes("Edit cinema tickets") && (
          <Suspense fallback={<PayLoading />}>
            <EditCinemaCategory />
          </Suspense>
        )}
        {/* stadium  */}
        {user?.permissions?.includes("Create stadium tickets") && (
          <Suspense fallback={<PayLoading />}>
            <AddStadiumCategory />
          </Suspense>
        )}
        {user?.permissions?.includes("Edit stadium tickets") && (
          <Suspense fallback={<PayLoading />}>
            <EditStadiumCategory />
          </Suspense>
        )}
        {/* bus  */}
        {user?.permissions?.includes("Create bus tickets") && (
          <Suspense fallback={<PayLoading />}>
            <AddBusCategory />
          </Suspense>
        )}
        {user?.permissions?.includes("Edit bus tickets") && (
          <Suspense fallback={<PayLoading />}>
            <EditBusCategory />
          </Suspense>
        )}
      </>
    </>
  );
}

export default Shell;
