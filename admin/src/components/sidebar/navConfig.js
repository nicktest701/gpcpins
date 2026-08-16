import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ElectricMeterIcon from "@mui/icons-material/ElectricMeter";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import ElectricBoltIcon from "@mui/icons-material/ElectricBolt";
import SignalCellularAlt2BarIcon from "@mui/icons-material/SignalCellularAlt2Bar";
import WifiTetheringIcon from "@mui/icons-material/WifiTethering";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import FileCopyIcon from "@mui/icons-material/FileCopy";
import {
  DashboardRounded,
  CarRentalRounded,
  KeySharp,
  NoteRounded,
  ParkRounded,
  SchoolRounded,
  SecurityRounded,
  TheatersRounded,
  AirplaneTicket,
  CardMembership,
  VerifiedUser,
  Person,
  Message,
  BarChartRounded,
  Person2,
  WalletOutlined,
  Refresh,
  StackedBarChartRounded,
  Info,
  ShieldOutlined,
  Group,
} from "@mui/icons-material";

/**
 * Single source of truth for the sidebar.
 * type: "link"  -> { to, title, icon, permission?, adminOnly? }
 * type: "group" -> { title, icon, permission?, adminOnly?, children: link[] }
 *
 * `permission` can be a string or an array of strings (any-of match).
 * A group is shown only if the group itself is visible AND it has at
 * least one visible child, so you never end up with an empty flyout.
 */
export const mainNav = [
  { type: "link", to: "/", title: "Dashboard", icon: DashboardRounded },

  {
    type: "group",
    title: "Vouchers & Tickets",
    icon: AirplaneTicket,
    permission: "Vouchers & Tickets",
    children: [
      {
        to: "evoucher/generate",
        title: "Pins & Serials Generator",
        icon: KeySharp,
        permission: "Generate Pins & Serials",
      },
      {
        to: "evoucher/waec",
        title: "WAEC Checker",
        icon: NoteRounded,
        permission: "WAEC Checkers",
      },
      {
        to: "evoucher/university",
        title: "University Forms",
        icon: SchoolRounded,
        permission: "University & Polytechnic Forms",
      },
      {
        to: "evoucher/security",
        title: "Security Service",
        icon: SecurityRounded,
        permission: "Security Service Forms",
      },
      {
        to: "evoucher/cinema",
        title: "Cinema & Event Tickets",
        icon: TheatersRounded,
        permission: "Cinema Tickets",
      },
      {
        to: "evoucher/stadium",
        title: "Stadium Tickets",
        icon: ParkRounded,
        permission: "Stadium Tickets",
      },
      {
        to: "evoucher/bus",
        title: "Bus Tickets",
        icon: CarRentalRounded,
        permission: "Bus Tickets",
      },
    ],
  },

  {
    type: "group",
    title: "Prepaid Units",
    icon: ElectricBoltIcon,
    permission: "Prepaid Units",
    children: [
      {
        to: "electricity/meters",
        title: "Meters",
        icon: ElectricMeterIcon,
        permission: "View Meters",
      },
      {
        to: "electricity/transactions",
        title: "Transactions",
        icon: CardMembership,
        permission: "View Prepaid Transaction",
      },
    ],
  },

  {
    type: "group",
    title: "Airtime",
    icon: WalletOutlined,
    permission: "Airtime",
    children: [
      {
        to: "airtime/transactions",
        title: "Bulk Sales",
        icon: CardMembership,
        permission: "View Bulk Airtime Transaction",
      },
    ],
  },

  {
    type: "group",
    title: "Wallets Details",
    icon: WalletOutlined,
    permission: ["User Wallets", "Agent Wallets"],
    children: [
      {
        to: "wallets",
        title: "Users",
        icon: CardMembership,
        permission: "User Wallets",
      },
      {
        to: "wallets/agent",
        title: "Agent",
        icon: Person,
        permission: "Agent Wallets",
      },
    ],
  },

  {
    type: "link",
    to: "messages",
    title: "Messages",
    icon: Message,
    permission: "Messages",
  },

  {
    type: "group",
    title: "Summary & Reports",
    icon: BarChartRounded,
    permission: "Summary",
    children: [
      {
        to: "summary/vouchers-tickets",
        title: "Vouchers & Tickets",
        icon: ConfirmationNumberIcon,
        permission: "View All Tickets & Voucher Transactions",
      },
      {
        to: "summary/prepaid-units",
        title: "Prepaid Units",
        icon: ElectricBoltIcon,
        permission: "View All Prepaid Units Transactions",
      },
      {
        to: "summary/airtime",
        title: "Airtime Transfers",
        icon: WifiTetheringIcon,
        permission: "View All Airtime Transactions",
      },
      {
        to: "summary/data-bundle",
        title: "Data Bundle",
        icon: SignalCellularAlt2BarIcon,
        permission: "View All Data Bundle Transactions",
      },
      {
        to: "summary/agent-transactions",
        title: "Agent Transactions",
        icon: StackedBarChartRounded,
      },
      {
        to: "summary/transactions",
        title: "All Transactions",
        icon: ReceiptLongIcon,
        permission: "View All Transactions",
      },
      {
        to: "summary/report",
        title: "Reports",
        icon: FileCopyIcon,
        permission: "View All Transactions Report",
      },
    ],
  },

  {
    type: "group",
    title: "Refund Transactions",
    icon: Refresh,
    adminOnly: true,
    children: [
      { to: "refund", title: "All Refunds", icon: FileCopyIcon },
      { to: "refund/money", title: "Refund Money", icon: FileCopyIcon },
    ],
  },

  {
    type: "group",
    title: "Users Account",
    icon: Group,
    permission: ["Manage Roles & Permissions", "Employees","Users", "Agents"],
    children: [
      // Always visible — matches the source of truth in the previous desktop sidebar.
      {
        to: "roles",
        title: "Roles & Permissions",
        icon: ShieldOutlined,
        permission: "Manage Roles & Permissions",
      },

      {
        to: "employees",
        title: "Employees",
        icon: VerifiedUser,
        permission: "Employees",
      },
      {
        to: "users",
        title: "Users",
        icon: Person2,
        permission: "Users",
      },
      {
        to: "agents",
        title: "Agents",
        icon: Person,
        permission: "Agents",
      },
    ],
  },

  {
    type: "link",
    to: "help-and-support",
    title: "Help & Support",
    icon: Info,
    permission: ["View Complaints"],
  },
  { type: "link", to: "logs", title: "Activity Logs", icon: AccessTimeIcon },
];

export function canView(item, user) {
  if (item.adminOnly) return !!user?.isAdmin;
  if (!item.permission) return true;
  const perms = Array.isArray(item.permission)
    ? item.permission
    : [item.permission];
  return perms.some((p) => user?.permissions?.includes(p));
}
