import GObject from "gi://GObject";
import Gtk from "gi://Gtk";

import Template from "./SuggestionOverlay.blp" assert { type: "uri" };

class SuggestionOverlay extends Gtk.Box {
  constructor(params) {
    super(params);

    this.suggestions = new Map();
  }

  set_range([start, end]) {
    this.start = start;
    this.end = end;
  }

  set_title(text) {
    this._category.label = text;
  }

  set_description(text) {
    this._description.label = text;
  }

  add_suggestion({ value }) {
    const button = new Gtk.Button({
      label: value,
    });
    button.add_css_class("suggested-action");
    button.connect("clicked", this.#on_suggestion_activated);
    this._suggestions.append(button);

    const widget = button;
    this.suggestions.set(widget, { value });
  }

  #on_suggestion_activated = (widget) => {
    const suggetion = this.suggestions.get(widget);
    if (!suggetion) return;
    const { value } = suggetion;
    const { start, end } = this;

    this.buffer.begin_user_action();
    this.buffer.delete(start, end);
    this.buffer.insert(start, value, -1);
    this.buffer.end_user_action();
    this.text_view.grab_focus();
  };

  reset() {
    for (const widget of this.suggestions.keys()) {
      this._suggestions.remove(widget);
    }
    this.suggestions.clear();
  }
}

export default GObject.registerClass(
  {
    GTypeName: "SuggestionOverlay",
    Template,
    InternalChildren: ["suggestions", "category", "description"],
  },
  SuggestionOverlay,
);
