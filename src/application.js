import Gio from "gi://Gio";
import Adw from "gi://Adw";
import GLib from "gi://GLib";

import Window from "./window.js";
import About from "./about.js";
import ShortcutsWindow from "./ShortcutsWindow.js";
import { startLanguageTool, stopLanguageTool } from "./languagetool.js";

import "./style.css";

export default function Application() {
  const application = new Adw.Application({
    application_id: "re.sonny.Eloquent",
    // flags: Gio.ApplicationFlags.HANDLES_OPEN,
  });

  // application.connect("open", (self, files, hint) => {
  //   // log(["open", files.length, hint]);

  //   files.forEach((file) => {
  //     Window({
  //       application,
  //       file,
  //     });
  //   });
  // });

  application.connect("activate", () => {
    Window({
      application,
    });
  });

  if (GLib.getenv("FLATPAK_ID")) {
    application.connect_after("startup", () => {
      startLanguageTool().catch(logError);
    });

    application.connect("shutdown", () => {
      stopLanguageTool().catch(logError);
    });
  }

  const quit = new Gio.SimpleAction({
    name: "quit",
    parameter_type: null,
  });
  quit.connect("activate", () => {
    application.quit();
  });
  application.add_action(quit);
  application.set_accels_for_action("app.quit", ["<Primary>Q"]);
  application.set_accels_for_action("window.close", ["<Primary>W"]);

  const showAboutDialog = new Gio.SimpleAction({
    name: "about",
    parameter_type: null,
  });
  showAboutDialog.connect("activate", () => {
    About({ application });
  });
  application.add_action(showAboutDialog);

  const showShortCutsWindow = new Gio.SimpleAction({
    name: "shortcuts",
    parameter_type: null,
  });
  showShortCutsWindow.connect("activate", () => {
    ShortcutsWindow({ application });
  });
  application.add_action(showShortCutsWindow);
  application.set_accels_for_action("app.shortcuts", ["<Primary>question"]);

  return application;
}
