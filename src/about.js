import Gtk from "gi://Gtk";
import Adw from "gi://Adw";
import { gettext as _ } from "gettext";

import { getGIRepositoryVersion, getGjsVersion, getGLibVersion } from "troll";

export default function About({ application }) {
  const debug_info = `
Eloquent ${pkg.version}
LanguageTool 6.5

Powered by:
GJS ${getGjsVersion()}
libadwaita ${getGIRepositoryVersion(Adw)}
GTK ${getGIRepositoryVersion(Gtk)}
GLib ${getGLibVersion()}
  `.trim();

  const dialog = new Adw.AboutDialog({
    application_name: "Eloquent",
    developer_name: "Sonny Piers",
    copyright: "© 2025 Sonny Piers",
    license_type: Gtk.License.GPL_3_0_ONLY,
    version: pkg.version,
    website: "https://eloquent.sonny.re",
    application_icon: "re.sonny.Eloquent",
    issue_url: "https://eloquent.sonny.re/feedback",
    // TRANSLATORS: eg. 'Translator Name <your.email@domain.com>' or 'Translator Name https://website.example'
    translator_credits: _("translator-credits"),
    debug_info,
    developers: ["Sonny Piers https://sonny.re"],
    designers: ["Sonny Piers https://sonny.re"],
    artists: ["Tobias Bernard <tbernard@gnome.org>"],
  });
  // dialog.add_credit_section("Contributors", [
  //   // Add yourself as
  //   // "John Doe",
  //   // or
  //   // "John Doe <john@example.com>",
  //   // or
  //   // "John Doe https://john.com",
  // ]);
  dialog.present(application.get_active_window());

  return { dialog };
}
