/* prettier-ignore-start */

/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file is auto-generated by TanStack Router

import { createFileRoute } from "@tanstack/react-router";

// Import Routes

import { Route as rootRoute } from "./routes/__root";
import { Route as LayoutImport } from "./routes/_layout";
import { Route as LayoutIndexImport } from "./routes/_layout/index";
import { Route as DistributeSigninImport } from "./routes/distribute/signin";
import { Route as DistributeRegisterImport } from "./routes/distribute/register";
import { Route as DistributeLayoutImport } from "./routes/distribute/_layout";
import { Route as LayoutTermsServiceImport } from "./routes/_layout/termsService";
import { Route as LayoutSigninImport } from "./routes/_layout/signin";
import { Route as LayoutRegisterImport } from "./routes/_layout/register";
import { Route as LayoutPrivacyPolicyImport } from "./routes/_layout/privacyPolicy";
import { Route as LayoutCookiePolicyImport } from "./routes/_layout/cookiePolicy";
import { Route as LayoutCartImport } from "./routes/_layout/cart";
import { Route as LayoutBrowseImport } from "./routes/_layout/browse";
import { Route as LayoutAccountImport } from "./routes/_layout/account";
import { Route as DistributeLayoutIndexImport } from "./routes/distribute/_layout/index";
import { Route as DistributeLayoutAccountImport } from "./routes/distribute/_layout/account";
import { Route as LayoutGamesGameIdImport } from "./routes/_layout/games/$gameId";
import { Route as DistributeLayoutGamesIndexImport } from "./routes/distribute/_layout/games/index";
import { Route as DistributeLayoutGamesAddImport } from "./routes/distribute/_layout/games/add";
import { Route as DistributeLayoutGamesGameIdImport } from "./routes/distribute/_layout/games/$gameId";
import { Route as DistributeLayoutGamesGameIdEditImport } from "./routes/distribute/_layout/games_/$gameId/edit";

// Create Virtual Routes

const DistributeImport = createFileRoute("/distribute")();

// Create/Update Routes

const DistributeRoute = DistributeImport.update({
  path: "/distribute",
  getParentRoute: () => rootRoute,
} as any);

const LayoutRoute = LayoutImport.update({
  id: "/_layout",
  getParentRoute: () => rootRoute,
} as any);

const LayoutIndexRoute = LayoutIndexImport.update({
  path: "/",
  getParentRoute: () => LayoutRoute,
} as any);

const DistributeSigninRoute = DistributeSigninImport.update({
  path: "/signin",
  getParentRoute: () => DistributeRoute,
} as any);

const DistributeRegisterRoute = DistributeRegisterImport.update({
  path: "/register",
  getParentRoute: () => DistributeRoute,
} as any);

const DistributeLayoutRoute = DistributeLayoutImport.update({
  id: "/_layout",
  getParentRoute: () => DistributeRoute,
} as any);

const LayoutTermsServiceRoute = LayoutTermsServiceImport.update({
  path: "/termsService",
  getParentRoute: () => LayoutRoute,
} as any);

const LayoutSigninRoute = LayoutSigninImport.update({
  path: "/signin",
  getParentRoute: () => LayoutRoute,
} as any);

const LayoutRegisterRoute = LayoutRegisterImport.update({
  path: "/register",
  getParentRoute: () => LayoutRoute,
} as any);

const LayoutPrivacyPolicyRoute = LayoutPrivacyPolicyImport.update({
  path: "/privacyPolicy",
  getParentRoute: () => LayoutRoute,
} as any);

const LayoutCookiePolicyRoute = LayoutCookiePolicyImport.update({
  path: "/cookiePolicy",
  getParentRoute: () => LayoutRoute,
} as any);

const LayoutCartRoute = LayoutCartImport.update({
  path: "/cart",
  getParentRoute: () => LayoutRoute,
} as any);

const LayoutBrowseRoute = LayoutBrowseImport.update({
  path: "/browse",
  getParentRoute: () => LayoutRoute,
} as any);

const LayoutAccountRoute = LayoutAccountImport.update({
  path: "/account",
  getParentRoute: () => LayoutRoute,
} as any);

const DistributeLayoutIndexRoute = DistributeLayoutIndexImport.update({
  path: "/",
  getParentRoute: () => DistributeLayoutRoute,
} as any);

const DistributeLayoutAccountRoute = DistributeLayoutAccountImport.update({
  path: "/account",
  getParentRoute: () => DistributeLayoutRoute,
} as any);

const LayoutGamesGameIdRoute = LayoutGamesGameIdImport.update({
  path: "/games/$gameId",
  getParentRoute: () => LayoutRoute,
} as any);

const DistributeLayoutGamesIndexRoute = DistributeLayoutGamesIndexImport.update(
  {
    path: "/games/",
    getParentRoute: () => DistributeLayoutRoute,
  } as any,
);

const DistributeLayoutGamesAddRoute = DistributeLayoutGamesAddImport.update({
  path: "/games/add",
  getParentRoute: () => DistributeLayoutRoute,
} as any);

const DistributeLayoutGamesGameIdRoute =
  DistributeLayoutGamesGameIdImport.update({
    path: "/games/$gameId",
    getParentRoute: () => DistributeLayoutRoute,
  } as any);

const DistributeLayoutGamesGameIdEditRoute =
  DistributeLayoutGamesGameIdEditImport.update({
    path: "/games/$gameId/edit",
    getParentRoute: () => DistributeLayoutRoute,
  } as any);

// Populate the FileRoutesByPath interface

declare module "@tanstack/react-router" {
  interface FileRoutesByPath {
    "/_layout": {
      id: "/_layout";
      path: "";
      fullPath: "";
      preLoaderRoute: typeof LayoutImport;
      parentRoute: typeof rootRoute;
    };
    "/_layout/account": {
      id: "/_layout/account";
      path: "/account";
      fullPath: "/account";
      preLoaderRoute: typeof LayoutAccountImport;
      parentRoute: typeof LayoutImport;
    };
    "/_layout/browse": {
      id: "/_layout/browse";
      path: "/browse";
      fullPath: "/browse";
      preLoaderRoute: typeof LayoutBrowseImport;
      parentRoute: typeof LayoutImport;
    };
    "/_layout/cart": {
      id: "/_layout/cart";
      path: "/cart";
      fullPath: "/cart";
      preLoaderRoute: typeof LayoutCartImport;
      parentRoute: typeof LayoutImport;
    };
    "/_layout/cookiePolicy": {
      id: "/_layout/cookiePolicy";
      path: "/cookiePolicy";
      fullPath: "/cookiePolicy";
      preLoaderRoute: typeof LayoutCookiePolicyImport;
      parentRoute: typeof LayoutImport;
    };
    "/_layout/privacyPolicy": {
      id: "/_layout/privacyPolicy";
      path: "/privacyPolicy";
      fullPath: "/privacyPolicy";
      preLoaderRoute: typeof LayoutPrivacyPolicyImport;
      parentRoute: typeof LayoutImport;
    };
    "/_layout/register": {
      id: "/_layout/register";
      path: "/register";
      fullPath: "/register";
      preLoaderRoute: typeof LayoutRegisterImport;
      parentRoute: typeof LayoutImport;
    };
    "/_layout/signin": {
      id: "/_layout/signin";
      path: "/signin";
      fullPath: "/signin";
      preLoaderRoute: typeof LayoutSigninImport;
      parentRoute: typeof LayoutImport;
    };
    "/_layout/termsService": {
      id: "/_layout/termsService";
      path: "/termsService";
      fullPath: "/termsService";
      preLoaderRoute: typeof LayoutTermsServiceImport;
      parentRoute: typeof LayoutImport;
    };
    "/distribute": {
      id: "/distribute";
      path: "/distribute";
      fullPath: "/distribute";
      preLoaderRoute: typeof DistributeImport;
      parentRoute: typeof rootRoute;
    };
    "/distribute/_layout": {
      id: "/distribute/_layout";
      path: "/distribute";
      fullPath: "/distribute";
      preLoaderRoute: typeof DistributeLayoutImport;
      parentRoute: typeof DistributeRoute;
    };
    "/distribute/register": {
      id: "/distribute/register";
      path: "/register";
      fullPath: "/distribute/register";
      preLoaderRoute: typeof DistributeRegisterImport;
      parentRoute: typeof DistributeImport;
    };
    "/distribute/signin": {
      id: "/distribute/signin";
      path: "/signin";
      fullPath: "/distribute/signin";
      preLoaderRoute: typeof DistributeSigninImport;
      parentRoute: typeof DistributeImport;
    };
    "/_layout/": {
      id: "/_layout/";
      path: "/";
      fullPath: "/";
      preLoaderRoute: typeof LayoutIndexImport;
      parentRoute: typeof LayoutImport;
    };
    "/_layout/games/$gameId": {
      id: "/_layout/games/$gameId";
      path: "/games/$gameId";
      fullPath: "/games/$gameId";
      preLoaderRoute: typeof LayoutGamesGameIdImport;
      parentRoute: typeof LayoutImport;
    };
    "/distribute/_layout/account": {
      id: "/distribute/_layout/account";
      path: "/account";
      fullPath: "/distribute/account";
      preLoaderRoute: typeof DistributeLayoutAccountImport;
      parentRoute: typeof DistributeLayoutImport;
    };
    "/distribute/_layout/": {
      id: "/distribute/_layout/";
      path: "/";
      fullPath: "/distribute/";
      preLoaderRoute: typeof DistributeLayoutIndexImport;
      parentRoute: typeof DistributeLayoutImport;
    };
    "/distribute/_layout/games/$gameId": {
      id: "/distribute/_layout/games/$gameId";
      path: "/games/$gameId";
      fullPath: "/distribute/games/$gameId";
      preLoaderRoute: typeof DistributeLayoutGamesGameIdImport;
      parentRoute: typeof DistributeLayoutImport;
    };
    "/distribute/_layout/games/add": {
      id: "/distribute/_layout/games/add";
      path: "/games/add";
      fullPath: "/distribute/games/add";
      preLoaderRoute: typeof DistributeLayoutGamesAddImport;
      parentRoute: typeof DistributeLayoutImport;
    };
    "/distribute/_layout/games/": {
      id: "/distribute/_layout/games/";
      path: "/games";
      fullPath: "/distribute/games";
      preLoaderRoute: typeof DistributeLayoutGamesIndexImport;
      parentRoute: typeof DistributeLayoutImport;
    };
    "/distribute/_layout/games/$gameId/edit": {
      id: "/distribute/_layout/games/$gameId/edit";
      path: "/games/$gameId/edit";
      fullPath: "/distribute/games/$gameId/edit";
      preLoaderRoute: typeof DistributeLayoutGamesGameIdEditImport;
      parentRoute: typeof DistributeLayoutImport;
    };
  }
}

// Create and export the route tree

interface LayoutRouteChildren {
  LayoutAccountRoute: typeof LayoutAccountRoute;
  LayoutBrowseRoute: typeof LayoutBrowseRoute;
  LayoutCartRoute: typeof LayoutCartRoute;
  LayoutCookiePolicyRoute: typeof LayoutCookiePolicyRoute;
  LayoutPrivacyPolicyRoute: typeof LayoutPrivacyPolicyRoute;
  LayoutRegisterRoute: typeof LayoutRegisterRoute;
  LayoutSigninRoute: typeof LayoutSigninRoute;
  LayoutTermsServiceRoute: typeof LayoutTermsServiceRoute;
  LayoutIndexRoute: typeof LayoutIndexRoute;
  LayoutGamesGameIdRoute: typeof LayoutGamesGameIdRoute;
}

const LayoutRouteChildren: LayoutRouteChildren = {
  LayoutAccountRoute: LayoutAccountRoute,
  LayoutBrowseRoute: LayoutBrowseRoute,
  LayoutCartRoute: LayoutCartRoute,
  LayoutCookiePolicyRoute: LayoutCookiePolicyRoute,
  LayoutPrivacyPolicyRoute: LayoutPrivacyPolicyRoute,
  LayoutRegisterRoute: LayoutRegisterRoute,
  LayoutSigninRoute: LayoutSigninRoute,
  LayoutTermsServiceRoute: LayoutTermsServiceRoute,
  LayoutIndexRoute: LayoutIndexRoute,
  LayoutGamesGameIdRoute: LayoutGamesGameIdRoute,
};

const LayoutRouteWithChildren =
  LayoutRoute._addFileChildren(LayoutRouteChildren);

interface DistributeLayoutRouteChildren {
  DistributeLayoutAccountRoute: typeof DistributeLayoutAccountRoute;
  DistributeLayoutIndexRoute: typeof DistributeLayoutIndexRoute;
  DistributeLayoutGamesGameIdRoute: typeof DistributeLayoutGamesGameIdRoute;
  DistributeLayoutGamesAddRoute: typeof DistributeLayoutGamesAddRoute;
  DistributeLayoutGamesIndexRoute: typeof DistributeLayoutGamesIndexRoute;
  DistributeLayoutGamesGameIdEditRoute: typeof DistributeLayoutGamesGameIdEditRoute;
}

const DistributeLayoutRouteChildren: DistributeLayoutRouteChildren = {
  DistributeLayoutAccountRoute: DistributeLayoutAccountRoute,
  DistributeLayoutIndexRoute: DistributeLayoutIndexRoute,
  DistributeLayoutGamesGameIdRoute: DistributeLayoutGamesGameIdRoute,
  DistributeLayoutGamesAddRoute: DistributeLayoutGamesAddRoute,
  DistributeLayoutGamesIndexRoute: DistributeLayoutGamesIndexRoute,
  DistributeLayoutGamesGameIdEditRoute: DistributeLayoutGamesGameIdEditRoute,
};

const DistributeLayoutRouteWithChildren =
  DistributeLayoutRoute._addFileChildren(DistributeLayoutRouteChildren);

interface DistributeRouteChildren {
  DistributeLayoutRoute: typeof DistributeLayoutRouteWithChildren;
  DistributeRegisterRoute: typeof DistributeRegisterRoute;
  DistributeSigninRoute: typeof DistributeSigninRoute;
}

const DistributeRouteChildren: DistributeRouteChildren = {
  DistributeLayoutRoute: DistributeLayoutRouteWithChildren,
  DistributeRegisterRoute: DistributeRegisterRoute,
  DistributeSigninRoute: DistributeSigninRoute,
};

const DistributeRouteWithChildren = DistributeRoute._addFileChildren(
  DistributeRouteChildren,
);

export interface FileRoutesByFullPath {
  "": typeof LayoutRouteWithChildren;
  "/account": typeof LayoutAccountRoute;
  "/browse": typeof LayoutBrowseRoute;
  "/cart": typeof LayoutCartRoute;
  "/cookiePolicy": typeof LayoutCookiePolicyRoute;
  "/privacyPolicy": typeof LayoutPrivacyPolicyRoute;
  "/register": typeof LayoutRegisterRoute;
  "/signin": typeof LayoutSigninRoute;
  "/termsService": typeof LayoutTermsServiceRoute;
  "/distribute": typeof DistributeLayoutRouteWithChildren;
  "/distribute/register": typeof DistributeRegisterRoute;
  "/distribute/signin": typeof DistributeSigninRoute;
  "/": typeof LayoutIndexRoute;
  "/games/$gameId": typeof LayoutGamesGameIdRoute;
  "/distribute/account": typeof DistributeLayoutAccountRoute;
  "/distribute/": typeof DistributeLayoutIndexRoute;
  "/distribute/games/$gameId": typeof DistributeLayoutGamesGameIdRoute;
  "/distribute/games/add": typeof DistributeLayoutGamesAddRoute;
  "/distribute/games": typeof DistributeLayoutGamesIndexRoute;
  "/distribute/games/$gameId/edit": typeof DistributeLayoutGamesGameIdEditRoute;
}

export interface FileRoutesByTo {
  "/account": typeof LayoutAccountRoute;
  "/browse": typeof LayoutBrowseRoute;
  "/cart": typeof LayoutCartRoute;
  "/cookiePolicy": typeof LayoutCookiePolicyRoute;
  "/privacyPolicy": typeof LayoutPrivacyPolicyRoute;
  "/register": typeof LayoutRegisterRoute;
  "/signin": typeof LayoutSigninRoute;
  "/termsService": typeof LayoutTermsServiceRoute;
  "/distribute": typeof DistributeLayoutIndexRoute;
  "/distribute/register": typeof DistributeRegisterRoute;
  "/distribute/signin": typeof DistributeSigninRoute;
  "/": typeof LayoutIndexRoute;
  "/games/$gameId": typeof LayoutGamesGameIdRoute;
  "/distribute/account": typeof DistributeLayoutAccountRoute;
  "/distribute/games/$gameId": typeof DistributeLayoutGamesGameIdRoute;
  "/distribute/games/add": typeof DistributeLayoutGamesAddRoute;
  "/distribute/games": typeof DistributeLayoutGamesIndexRoute;
  "/distribute/games/$gameId/edit": typeof DistributeLayoutGamesGameIdEditRoute;
}

export interface FileRoutesById {
  __root__: typeof rootRoute;
  "/_layout": typeof LayoutRouteWithChildren;
  "/_layout/account": typeof LayoutAccountRoute;
  "/_layout/browse": typeof LayoutBrowseRoute;
  "/_layout/cart": typeof LayoutCartRoute;
  "/_layout/cookiePolicy": typeof LayoutCookiePolicyRoute;
  "/_layout/privacyPolicy": typeof LayoutPrivacyPolicyRoute;
  "/_layout/register": typeof LayoutRegisterRoute;
  "/_layout/signin": typeof LayoutSigninRoute;
  "/_layout/termsService": typeof LayoutTermsServiceRoute;
  "/distribute": typeof DistributeRouteWithChildren;
  "/distribute/_layout": typeof DistributeLayoutRouteWithChildren;
  "/distribute/register": typeof DistributeRegisterRoute;
  "/distribute/signin": typeof DistributeSigninRoute;
  "/_layout/": typeof LayoutIndexRoute;
  "/_layout/games/$gameId": typeof LayoutGamesGameIdRoute;
  "/distribute/_layout/account": typeof DistributeLayoutAccountRoute;
  "/distribute/_layout/": typeof DistributeLayoutIndexRoute;
  "/distribute/_layout/games/$gameId": typeof DistributeLayoutGamesGameIdRoute;
  "/distribute/_layout/games/add": typeof DistributeLayoutGamesAddRoute;
  "/distribute/_layout/games/": typeof DistributeLayoutGamesIndexRoute;
  "/distribute/_layout/games/$gameId/edit": typeof DistributeLayoutGamesGameIdEditRoute;
}

export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath;
  fullPaths:
    | ""
    | "/account"
    | "/browse"
    | "/cart"
    | "/cookiePolicy"
    | "/privacyPolicy"
    | "/register"
    | "/signin"
    | "/termsService"
    | "/distribute"
    | "/distribute/register"
    | "/distribute/signin"
    | "/"
    | "/games/$gameId"
    | "/distribute/account"
    | "/distribute/"
    | "/distribute/games/$gameId"
    | "/distribute/games/add"
    | "/distribute/games"
    | "/distribute/games/$gameId/edit";
  fileRoutesByTo: FileRoutesByTo;
  to:
    | "/account"
    | "/browse"
    | "/cart"
    | "/cookiePolicy"
    | "/privacyPolicy"
    | "/register"
    | "/signin"
    | "/termsService"
    | "/distribute"
    | "/distribute/register"
    | "/distribute/signin"
    | "/"
    | "/games/$gameId"
    | "/distribute/account"
    | "/distribute/games/$gameId"
    | "/distribute/games/add"
    | "/distribute/games"
    | "/distribute/games/$gameId/edit";
  id:
    | "__root__"
    | "/_layout"
    | "/_layout/account"
    | "/_layout/browse"
    | "/_layout/cart"
    | "/_layout/cookiePolicy"
    | "/_layout/privacyPolicy"
    | "/_layout/register"
    | "/_layout/signin"
    | "/_layout/termsService"
    | "/distribute"
    | "/distribute/_layout"
    | "/distribute/register"
    | "/distribute/signin"
    | "/_layout/"
    | "/_layout/games/$gameId"
    | "/distribute/_layout/account"
    | "/distribute/_layout/"
    | "/distribute/_layout/games/$gameId"
    | "/distribute/_layout/games/add"
    | "/distribute/_layout/games/"
    | "/distribute/_layout/games/$gameId/edit";
  fileRoutesById: FileRoutesById;
}

export interface RootRouteChildren {
  LayoutRoute: typeof LayoutRouteWithChildren;
  DistributeRoute: typeof DistributeRouteWithChildren;
}

const rootRouteChildren: RootRouteChildren = {
  LayoutRoute: LayoutRouteWithChildren,
  DistributeRoute: DistributeRouteWithChildren,
};

export const routeTree = rootRoute
  ._addFileChildren(rootRouteChildren)
  ._addFileTypes<FileRouteTypes>();

/* prettier-ignore-end */

/* ROUTE_MANIFEST_START
{
  "routes": {
    "__root__": {
      "filePath": "__root.tsx",
      "children": [
        "/_layout",
        "/distribute"
      ]
    },
    "/_layout": {
      "filePath": "_layout.tsx",
      "children": [
        "/_layout/account",
        "/_layout/browse",
        "/_layout/cart",
        "/_layout/cookiePolicy",
        "/_layout/privacyPolicy",
        "/_layout/register",
        "/_layout/signin",
        "/_layout/termsService",
        "/_layout/",
        "/_layout/games/$gameId"
      ]
    },
    "/_layout/account": {
      "filePath": "_layout/account.tsx",
      "parent": "/_layout"
    },
    "/_layout/browse": {
      "filePath": "_layout/browse.tsx",
      "parent": "/_layout"
    },
    "/_layout/cart": {
      "filePath": "_layout/cart.tsx",
      "parent": "/_layout"
    },
    "/_layout/cookiePolicy": {
      "filePath": "_layout/cookiePolicy.tsx",
      "parent": "/_layout"
    },
    "/_layout/privacyPolicy": {
      "filePath": "_layout/privacyPolicy.tsx",
      "parent": "/_layout"
    },
    "/_layout/register": {
      "filePath": "_layout/register.tsx",
      "parent": "/_layout"
    },
    "/_layout/signin": {
      "filePath": "_layout/signin.tsx",
      "parent": "/_layout"
    },
    "/_layout/termsService": {
      "filePath": "_layout/termsService.tsx",
      "parent": "/_layout"
    },
    "/distribute": {
      "filePath": "distribute",
      "children": [
        "/distribute/_layout",
        "/distribute/register",
        "/distribute/signin"
      ]
    },
    "/distribute/_layout": {
      "filePath": "distribute/_layout.tsx",
      "parent": "/distribute",
      "children": [
        "/distribute/_layout/account",
        "/distribute/_layout/",
        "/distribute/_layout/games/$gameId",
        "/distribute/_layout/games/add",
        "/distribute/_layout/games/",
        "/distribute/_layout/games/$gameId/edit"
      ]
    },
    "/distribute/register": {
      "filePath": "distribute/register.tsx",
      "parent": "/distribute"
    },
    "/distribute/signin": {
      "filePath": "distribute/signin.tsx",
      "parent": "/distribute"
    },
    "/_layout/": {
      "filePath": "_layout/index.tsx",
      "parent": "/_layout"
    },
    "/_layout/games/$gameId": {
      "filePath": "_layout/games/$gameId.tsx",
      "parent": "/_layout"
    },
    "/distribute/_layout/account": {
      "filePath": "distribute/_layout/account.tsx",
      "parent": "/distribute/_layout"
    },
    "/distribute/_layout/": {
      "filePath": "distribute/_layout/index.tsx",
      "parent": "/distribute/_layout"
    },
    "/distribute/_layout/games/$gameId": {
      "filePath": "distribute/_layout/games/$gameId.tsx",
      "parent": "/distribute/_layout"
    },
    "/distribute/_layout/games/add": {
      "filePath": "distribute/_layout/games/add.tsx",
      "parent": "/distribute/_layout"
    },
    "/distribute/_layout/games/": {
      "filePath": "distribute/_layout/games/index.tsx",
      "parent": "/distribute/_layout"
    },
    "/distribute/_layout/games/$gameId/edit": {
      "filePath": "distribute/_layout/games_/$gameId/edit.tsx",
      "parent": "/distribute/_layout"
    }
  }
}
ROUTE_MANIFEST_END */
