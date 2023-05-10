import Gio from "gi://Gio";

export const settings = new Gio.Settings({
  schema_id: "re.sonny.Eloquent",
  path: "/re/sonny/Eloquent/",
});
