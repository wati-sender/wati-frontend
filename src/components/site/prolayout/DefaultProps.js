// import {
//   ChromeFilled,
//   CrownFilled,
//   SmileFilled,
//   TabletFilled,
// } from "@ant-design/icons";

const menu = {
  route: {
    path: "/",
    routes: [
      {
        path: "/accounts",
        name: "Accounts",
      },
      {
        path: "/templates",
        name: "Templates",
      },
      // {
      //   path: "/contacts",
      //   name: "Contacts",
      // },
      {
        path: "/campaign",
        name: "Campaigns",
      },
      {
        path: "/reports",
        name: "Reports",
        routes: [
          {
            path: "accounts",
            name: "Accounts",
          },
          {
            path: "templates",
            name: "Templates",
          },
        ]
      },

    ],
  },
  location: {
    pathname: "/",
  },
};
export default menu;
