import Gtk from "gi://Gtk";
import Gio from "gi://Gio";
import Gdk from "gi://Gdk";
import Pango from "gi://Pango";

import { build } from "troll";

import { retry, unstack } from "./util.js";
import { check } from "./languagetool.js";
import DropdownLang from "./DropdownLang.js";

import Interface from "./window.blp" assert { type: "uri" };
import "./widgets/SuggestionOverlay.js";
import "./icons/check-round-outline-symbolic.svg" assert { type: "icon" };

let diagnostics = [];

export default function Window({ application, file }) {
  const {
    window,
    text_view,
    overlay_suggestion,
    overlay,
    label_words,
    label_characters,
    label_status,
    spinner,
    image_ok,
    bar_status,
    dropdown_langs,
  } = build(Interface);

  if (__DEV__) window.add_css_class("devel");
  window.set_application(application);

  const buffer = text_view.buffer;

  overlay.connect("get-child-position", (self, child, rectangle) => {
    const { cursor_position } = buffer;
    const iter = buffer.get_iter_at_offset(cursor_position);

    // Get iterator at the start of the tag or display line
    // to cover the case where the tag is wrapped
    // eslint-disable-next-line no-constant-condition
    while (true) {
      if (iter.starts_tag(null)) break;
      if (text_view.starts_display_line(iter)) break;
      if (!iter.backward_char()) break;
    }

    const iter_location = text_view.get_iter_location(iter);
    // FIXME: magic numbers
    rectangle.y = iter_location.y + 48;
    rectangle.x = iter_location.x + 22;

    console.log(iter_location.x, iter_location.y);

    const text_view_width = text_view.get_width();
    const [natural_width] = child.measure(Gtk.Orientation.HORIZONTAL, -1);

    const overflow = natural_width + rectangle.x - text_view_width;
    if (overflow > 0) {
      rectangle.x -= overflow;
    }

    return true;
  });

  let position;

  buffer.connect("notify::cursor-position", () => {
    const { cursor_position } = buffer;
    if (position === cursor_position) return;
    position = cursor_position;

    overlay_suggestion.reset();

    const iter = buffer.get_iter_at_offset(cursor_position);
    const { tag, start, end } = getTag(iter);
    if (!tag) {
      overlay_suggestion.set_visible(false);
      return;
    }

    const match = getDiagnostic(start, end);
    if (!match) {
      overlay_suggestion.set_visible(false);
      return;
    }

    overlay_suggestion.text_view = text_view;
    overlay_suggestion.set_title(match.shortMessage || "Grammar");
    overlay_suggestion.set_description(match.message);
    overlay_suggestion.set_range([start, end]);
    overlay_suggestion.buffer = buffer;

    console.debug(JSON.stringify(match, null, 2));

    overlay_suggestion.set_visible(true);

    match.replacements?.slice(0, 3).forEach((replacement) => {
      overlay_suggestion.add_suggestion({ value: replacement.value });
    });
  });

  const tag_table = buffer.get_tag_table();

  // Error tag
  const color_error = new Gdk.RGBA();
  color_error.parse("#e01b24");
  const tag_error = new Gtk.TextTag({
    name: "error",
    underline: Pango.Underline.SINGLE,
    underline_rgba: color_error,
  });
  tag_table.add(tag_error);

  const color_warning = new Gdk.RGBA();
  color_warning.parse("#f5c211");
  const tag_warning = new Gtk.TextTag({
    name: "warning",
    underline: Pango.Underline.SINGLE,
    underline_rgba: color_warning,
  });
  tag_table.add(tag_warning);

  const color_hint = new Gdk.RGBA();
  color_hint.parse("#62a0ea");
  const tag_style = new Gtk.TextTag({
    name: "hint",
    underline: Pango.Underline.SINGLE,
    underline_rgba: color_hint,
  });
  tag_table.add(tag_style);

  function updateStatus(count) {
    if (count === null) {
      spinner.visible = false;
      label_status.visible = false;
      image_ok.visible = false;
      return;
    }

    spinner.visible = false;

    if (count === 0) {
      label_status.visible = false;
      image_ok.visible = true;
      return;
    }

    label_status.visible = true;
    label_status.label = count?.toString() || "";
    image_ok.visible = false;
  }

  function onReject(err) {
    updateStatus(null);
    if (err.code !== Gio.IOErrorEnum.CONNECTION_REFUSED) {
      logError(err);
    }
  }

  function onResolve(res) {
    // console.log(JSON.stringify(result, null, 2));

    const { matches } = res;
    updateStatus(matches.length);
    handleMatches(buffer, matches);
  }

  const dropown_lang = DropdownLang({ dropdown_langs });

  const scheduleCheck = unstack(
    () =>
      retry(
        () => check(buffer.text, dropown_lang.getLanguage()),
        2000,
        onReject,
      ),
    onResolve,
  );

  // This isn't perfect but until we have Intl.Segmenter in GJS it will do
  // see https://cestoliv.com/blog/how-to-count-emojis-with-javascript/#4-the-best-solution-to-use-in-production
  // https://bugzilla.mozilla.org/show_bug.cgi?id=1423593
  // Int.Segmenter is also better at counting words
  function updateCounters() {
    let words_count = 0;
    let characters_count = 0;

    if (buffer.text.length === 0) {
      bar_status.revealed = false;
    } else {
      bar_status.revealed = true;
      const words = buffer.text
        .replace(/[.,?!;()"'-]/g, " ")
        .replace(/\s+/g, " ")
        .split(" ");
      words_count = words.length;
      const characters = words.join("");
      characters_count = [...characters].length;
    }

    label_words.label = ` ${words_count}`;
    label_characters.label = ` ${characters_count}`;
  }

  function checkGrammar() {
    overlay_suggestion.reset();
    overlay_suggestion.set_visible(false);
    scheduleCheck();
  }

  dropown_lang.onChange(checkGrammar);

  buffer.connect("changed", () => {
    checkGrammar();
    updateCounters();
  });

  // if (__DEV__) {
  buffer.text = `Write or paste your text here too have it checked continuously. Errors will be underlined in different colours: we will mark seplling errors with red underilnes. Furthermore grammar error's are highlighted in yellow. LanguageTool also marks style issues in a reliable manner by underlining them in blue. did you know that you can sea synonyms by double clicking a word? Its a impressively versatile tool especially if youd like to tell a colleague from over sea's about what happened at 5 PM in the afternoon on Monday, 27 May 2007.`;
  // }

  text_view.grab_focus();

  window.present();

  return { window };
}

function getTag(iter) {
  const tags = iter.get_tags();

  // Match the tag at cursor position after "a" in
  // to love a elephant
  const ended_tags = iter.get_toggled_tags(false);
  const tag = tags[0] || ended_tags[0];
  if (!tag) return {};

  const start = iter.copy();
  if (!start.starts_tag(tag)) {
    start.backward_to_tag_toggle(tag);
  }
  const end = iter.copy();
  if (!end.ends_tag(tag)) {
    end.forward_to_tag_toggle(tag);
  }

  return { tag, start, end };
}

function getDiagnostic(start, end) {
  const offset = start.get_offset();
  const length = end.get_offset() - offset;

  return diagnostics.find((diagnostic) => {
    return diagnostic.offset === offset && diagnostic.length === length;
  });
}

function clearDiagnostics(buffer) {
  diagnostics = [];
  buffer.remove_tag_by_name(
    "error",
    buffer.get_start_iter(),
    buffer.get_end_iter(),
  );
  buffer.remove_tag_by_name(
    "warning",
    buffer.get_start_iter(),
    buffer.get_end_iter(),
  );
  buffer.remove_tag_by_name(
    "hint",
    buffer.get_start_iter(),
    buffer.get_end_iter(),
  );
}

function handleMatches(buffer, matches) {
  clearDiagnostics(buffer);

  diagnostics = matches;

  for (const match of matches) {
    buffer.apply_tag_by_name(...getTagParams(buffer, match));
  }
}

function getTagParams(buffer, match) {
  const start_iter = buffer.get_iter_at_offset(match.offset);
  const end_iter = buffer.get_iter_at_offset(match.offset + match.length);

  let type = "error";

  if (match.type?.typeName === "Hint") {
    type = "hint";
  } else if (match.rule.issueType === "style") {
    type = "hint";
  } else if (match.type?.typeName === "Other") {
    type = "warning";
  } else if (match.rule.issueType === "inconsistency") {
    type = "warning";
  }

  return [type, start_iter, end_iter];
}
