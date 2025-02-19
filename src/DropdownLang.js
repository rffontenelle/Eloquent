import GObject from "gi://GObject";
import Gtk from "gi://Gtk";
//import Pango from "gi://Pango";

import { gettext as _ } from "gettext";

export default function DropdownLang({ dropdown_langs }) {
  dropdown_langs.get_first_child().add_css_class("flat");

  // Enables search
  const expression = new Gtk.ClosureExpression(
    GObject.TYPE_STRING,
    (obj) => obj.string,
    null,
  );
  dropdown_langs.expression = expression;

  for (const lang of languages) {
    dropdown_langs.model.append(lang.name);
  }

  /*
  const language_default = Pango.Language.get_default();
  const lang_idx =
    languages.findIndex((lang) => {
      return language_default.matches(lang.code);
    }) || 0; // Auto
  dropdown_langs.selected = lang_idx;
  */

  let on_change;
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

// https://github.com/sonnyp/Eloquent/issues/5
const languages = [
  { code: "auto", name: _("Auto") },
  { code: "ar", name: _("Arabic") },
  { code: "ast-es", name: _("Asturian") },
  { code: "be-by", name: _("Belarusian") },
  { code: "br-fr", name: _("Breton") },
  { code: "ca-es", name: _("Catalan") },
  { code: "ca-es-valencia", name: _("Catalan (Valencian)") },
  { code: "zh-cn", name: _("Chinese") },
  { code: "da-dk", name: _("Danish") },
  { code: "nl", name: _("Dutch") },
  { code: "en-au", name: _("English (Australia)") },
  { code: "en-gb", name: _("English (British)") },
  { code: "en-ca", name: _("English (Canada)") },
  { code: "en-nz", name: _("English (New Zealand)") },
  { code: "en-za", name: _("English (South Africa)") },
  { code: "en-us", name: _("English (US)") },
  { code: "eo", name: _("Esperanto") },
  { code: "fr", name: _("French") },
  { code: "gl-es", name: _("Galician") },
  { code: "de-at", name: _("German (Austria)") },
  { code: "de-de", name: _("German (Germany)") },
  { code: "de-ch", name: _("German (Switzerland)") },
  { code: "el-gr", name: _("Greek") },
  { code: "ga-ie", name: _("Irish") },
  { code: "it", name: _("Italian") },
  { code: "ja-jp", name: _("Japanese") },
  { code: "km-kh", name: _("Khmer") },
  { code: "no", name: _("Norwegian") },
  { code: "fa", name: _("Persian") },
  { code: "pl-pl", name: _("Polish") },
  { code: "pt-ao", name: _("Portuguese (Angola)") },
  { code: "pt-br", name: _("Portuguese (Brazil)") },
  { code: "pt-mz", name: _("Portuguese (Mozambique)") },
  { code: "pt-pt", name: _("Portuguese (Portugal)") },
  { code: "ro-ro", name: _("Romanian") },
  { code: "ru-ru", name: _("Russian") },
  { code: "sk-sk", name: _("Slovak") },
  { code: "sl-si", name: _("Slovenian") },
  { code: "es", name: _("Spanish") },
  { code: "sv", name: _("Swedish") },
  { code: "tl-ph", name: _("Tagalog") },
  { code: "ta-in", name: _("Tamil") },
  { code: "uk-ua", name: _("Ukrainian") },
];
