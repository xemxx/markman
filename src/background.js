"use strict";

import App from "./main/app";

import { app, protocol } from "electron";
import Accessor from "./main/app/accessor";
import setupEnvironment from "./main/app/env";
import { isDevelopment, isWindows } from "./main/config";
import installExtension, { VUEJS_DEVTOOLS } from "electron-devtools-installer";

protocol.registerSchemesAsPrivileged([
  {
    scheme: "app",
    privileges: {
      secure: true,
      standard: true
    }
  }
]);

if (isDevelopment && !process.env.IS_TEST) {
  app.on("ready", () => {
    installExtension(VUEJS_DEVTOOLS)
      .then(name => console.log(`Added Extension:  ${name}`))
      .catch(err => console.log("An error occurred: ", err));
  });
}

const appEnvironment = setupEnvironment();

let accessor = new Accessor(appEnvironment);
const markman = new App(accessor);
markman.init();

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (isWindows) {
    process.on("message", data => {
      if (data === "graceful-exit") {
        app.quit();
      }
    });
  } else {
    process.on("SIGTERM", () => {
      app.quit();
    });
  }
}
