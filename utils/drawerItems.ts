
import { USER_ROLE } from "@/constants/role";
import { DrawerItems, UserRole } from "@/types";
import {
  Home,
  ArrowLeftRight,
  FileSearch,
  Coins,
  Network,
  Newspaper,
  Users,
  UserCheck,
  Grip,
  BadgeDollarSign,
  DollarSign
} from "lucide-react";
import React, { ReactNode } from "react";



export const drawerItems = (role: UserRole): DrawerItems[] => {
  const roleMenus: DrawerItems[] = [];

  const defaultMenus = [
    {
      name: "Home",
      path: "/dashboard",
      icon: React.createElement(Home, { className: "w-6 h-6" }),
    },
    {
      name: 'Profile',
      path: `/${role}/profile`,
      icon: React.createElement(ArrowLeftRight, { className: "w-6 h-6" }),
    },
    {
      name: 'Change Password',
      path: `change-password`,
      icon: React.createElement(ArrowLeftRight, { className: "w-6 h-6" }),
    },
  ];
  // Role-based filtering
  switch (role) {
    case USER_ROLE.SUPER_ADMIN:
      roleMenus.push(
        {
          name: "Dashboard",
          path: `/dashboard/${role}`,
          icon: React.createElement(Grip, { className: "w-6 h-6" }),
        },
        {
          name: "Create Admin",
          path: `/dashboard/${role}/create-admin`,
          icon: React.createElement(ArrowLeftRight, { className: "w-6 h-6" }),
        },
        {
          name: "Manage Admin",
          path: `/dashboard/${role}/manage-admin`,
          icon: React.createElement(ArrowLeftRight, { className: "w-6 h-6" }),
        },
        {
          name: "NSU",
          path: `/dashboard/${role}/manage-users`,
          icon: React.createElement(ArrowLeftRight, { className: "w-6 h-6" }),
        },

        {
          name: "Manage Transaction",
          path: `/dashboard/${role}/manage-transaction`,
          icon: React.createElement(ArrowLeftRight, { className: "w-6 h-6" }),
        },
        {
          name: "User Bet Summary",
          path: `/dashboard/${role}/bet-summary`,
          icon: React.createElement(ArrowLeftRight, { className: "w-6 h-6" }),
        },
        {
          name: "High Balance",
          path: `/dashboard/${role}/high-balance`,
          icon: React.createElement(ArrowLeftRight, { className: "w-6 h-6" }),
        },
        {
          name: "My Customers",
          path: `/dashboard/${role}/my-customers`,
          icon: React.createElement(ArrowLeftRight, { className: "w-6 h-6" }),
        },
        {
          name: "TaleSales Leads",
          path: `/dashboard/${role}/sales-leads`,
          icon: React.createElement(ArrowLeftRight, { className: "w-6 h-6" }),
        },
        {
          name: "Assign Customer",
          path: `/dashboard/${role}/assign-customer`,
          icon: React.createElement(ArrowLeftRight, { className: "w-6 h-6" }),
        },

      );
      break;
    case USER_ROLE.ADMIN:
      roleMenus.push(
        {
          name: "Back to Home",
          path: `/`,
          icon: React.createElement(Grip, { className: "w-6 h-6" }),
        },
        {
          name: "Dashboard",
          path: `/dashboard/${role}`,
          icon: React.createElement(Grip, { className: "w-6 h-6" }),
        },
        {
          name: "NSU",
          path: `/dashboard/${role}/manage-users`,
          icon: React.createElement(ArrowLeftRight, { className: "w-6 h-6" }),
        },
        {
          name: "My Personal Customers",
          path: `/dashboard/${role}/my-personal-customers`,
          icon: React.createElement(ArrowLeftRight, { className: "w-6 h-6" }),
        },
        // {
        //   name: "My Customers",
        //   path: `/dashboard/${role}/my-customers`,
        //   icon: React.createElement(ArrowLeftRight, { className: "w-6 h-6" }),
        // },
        {
          name: "TaleSales Leads",
          path: `/dashboard/${role}/sales-leads`,
          icon: React.createElement(ArrowLeftRight, { className: "w-6 h-6" }),
        },
        {
          name: "Leads My Customer",
          path: `/dashboard/${role}/lead-my-customer`,
          icon: React.createElement(ArrowLeftRight, { className: "w-6 h-6" }),
        },
        {
          name: "Depositer/Withdrawer List",
          path: `/dashboard/${role}/dpwt-list`,
          icon: React.createElement(ArrowLeftRight, { className: "w-6 h-6" }),
        },
        {
          name: "User Bet Summary",
          path: `/dashboard/${role}/bet-summary`,
          icon: React.createElement(ArrowLeftRight, { className: "w-6 h-6" }),
        },
        {
          name: "High Balance",
          path: `/dashboard/${role}/high-balance`,
          icon: React.createElement(ArrowLeftRight, { className: "w-6 h-6" }),
        },
        {
          name: "Retantaion",
          path: `/dashboard/${role}/retention`,
          icon: React.createElement(ArrowLeftRight, { className: "w-6 h-6" }),
        },
        {
          name: "Retantaion List",
          path: `/dashboard/${role}/retention-list`,
          icon: React.createElement(ArrowLeftRight, { className: "w-6 h-6" }),
        },
        {
          name: "Non Depositer",
          path: `/dashboard/${role}/no-deposit-balance`,
          icon: React.createElement(ArrowLeftRight, { className: "w-6 h-6" }),
        },
        {
          name: "Non Depositer List",
          path: `/dashboard/${role}/no-deposit-list`,
          icon: React.createElement(ArrowLeftRight, { className: "w-6 h-6" }),
        },

      );
      break;
    case USER_ROLE.DOCTOR:
      roleMenus.push(
        {
          name: "Relayers",
          path: "/dashboard/relayers",
          icon: React.createElement(Users, { className: "w-6 h-6" }),
        }
      );
      break;
    case USER_ROLE.USER:
      roleMenus.push(
        {
          name: "Dashboard",
          path: `/dashboard/${role}`,
          icon: React.createElement(Grip, { className: "w-6 h-6" }),
        },
        {
          name: "Deposit",
          path: `/dashboard/${role}/deposit`,
          icon: React.createElement(BadgeDollarSign, { className: "w-6 h-6" }),
        },
        {
          name: "Withdraw",
          path: `/dashboard/${role}/withdraw`,
          icon: React.createElement(DollarSign, { className: "w-6 h-6" }),
        },
        {
          name: "Transaction History",
          path: `/dashboard/${role}/transaction-history`,
          icon: React.createElement(FileSearch, { className: "w-6 h-6" }),
        },
        {
          name: "All Plans",
          path: `/dashboard/${role}/all-plans`,
          icon: React.createElement(FileSearch, { className: "w-6 h-6" }),
        },
        {
          name: "PTC",
          icon: React.createElement(Coins, { className: "w-6 h-6" }),
          children: [
            {
              name: "Ads",
              path: `/dashboard/${role}/ads`,
              icon: null,
            },
            {
              name: "Clicks",
              path: `/dashboard/${role}/clicks`,
              icon: null,
            },
          ],
        },
        {
          name: "Refferal",
          path: `/dashboard/${role}/referral`,
          icon: React.createElement(Users, { className: "w-6 h-6" }),
        },
        {
          name: "Support",
          path: `/dashboard/${role}/support`,
          icon: React.createElement(ArrowLeftRight, { className: "w-6 h-6" }),
        },

      );
      break;
    default:
      break;
  }

  return [...roleMenus];
};
