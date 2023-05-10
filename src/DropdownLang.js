import GObject from "gi://GObject";
import Gtk from "gi://Gtk";
import Pango from "gi://Pango";

import { getLanguages } from "./languagetool.js";

import { gettext as _ } from "gettext";

const languages = [
  { code: "auto", name: _("Auto") },
];

export default function DropdownLang({ dropdown_langs }) {
  dropdown_langs.get_first_child().add_css_class("flat");

  // Enables search
  const expression = new Gtk.ClosureExpression(
    GObject.TYPE_STRING,
    (obj) => obj.string,
    null,
  );
  dropdown_langs.expression = expression;

  getLanguages().then((langs) => {
    languages.push(...langs)
    for (const lang of langs) {
      dropdown_langs.model.append(lang.name);
    }
  }).catch(console.error)

  const language_default = Pango.Language.get_default();
  const lang_idx =
    languages.findIndex((lang) => {
      return language_default.matches(lang.code);
    }) || 0; // auto

  let on_change;
  dropdown_langs.selected = lang_idx;
  dropdown_langs.connect("notify::selected", () => {
    on_change?.();
  });

  return {
    getLanguage() {
      const idx = dropdown_langs.selected;
      return languages[idx]?.code;
    },
    onChange(fn) {
      on_change = fn;
    },
  };
}

