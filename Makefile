.PHONY: dev build run-host flatpak flatpak-local-remote bundle test clean

dev:
	@ # mkdir -p ~/.local/share/fonts
	@ # fc-cache ~/.local/share/fonts/
	@ # mkdir -p /tmp/Eloquent
	@ glib-compile-schemas --strict ./data
	@ ./src/local.js

build:
	# meson --reconfigure --prefix ${PWD}/install build
	meson --prefix ${PWD}/install build
	ninja -C build install

run-host:
	make clean
	make build
	GSETTINGS_SCHEMA_DIR=./data ./install/bin/re.sonny.Eloquent

flatpak:
	flatpak-builder --user --force-clean --sandbox --install-deps-from=flathub --install flatpak re.sonny.Eloquent.json
	# flatpak run re.sonny.Eloquent https://gnome.org

# Useful for previewing in GNOME Software
# https://gitlab.gnome.org/bertob/app-ideas/-/issues/116#note_1290065
flatpak-local-remote:
	flatpak-builder --user  --force-clean --repo=repo --install-deps-from=flathub flatpak re.sonny.Eloquent.json
	flatpak --user remote-add --no-gpg-verify --if-not-exists Eloquent repo
	flatpak --user install --reinstall --assumeyes Eloquent re.sonny.Eloquent
	# flatpak run re.sonny.Eloquent

bundle:
	flatpak-builder --user  --force-clean --repo=repo --install-deps-from=flathub flatpak re.sonny.Eloquent.json
	flatpak build-bundle repo Eloquent.flatpak re.sonny.Eloquent --runtime-repo=https://flathub.org/repo/flathub.flatpakrepo

test:
# ./node_modules/.bin/eslint --cache .
# ./troll/tst/bin.js test/*.test.js
# flatpak run org.freedesktop.appstream-glib validate data/re.sonny.Eloquent.metainfo.xml
	flatpak run --command="desktop-file-validate" --file-forwarding org.gnome.Sdk//43 --no-hints @@ data/re.sonny.Eloquent.desktop @@
# gtk4-builder-tool validate src/*.ui
	flatpak-builder --show-manifest re.sonny.Eloquent.json > /dev/null
# find po/ -type f -name "*.po" -print0 | xargs -0 -n1 msgfmt -o /dev/null --check

clean:
	rm -rf build builddir install .eslintcache
	rm -f ~/.local/share/applications/re.sonny.Eloquent.desktop
	rm -f ~/.local/share/dbus-1/services/re.sonny.Eloquent.service
	rm -f ~/.local/share/icons/hicolor/symbolic/apps/re.sonny.Eloquent-symbolic.svg
	rm -f ~/.local/share/icons/hicolor/scalable/apps/re.sonny.Eloquent.svg
	update-desktop-database ~/.local/share/applications

# dev:
# 	# service file
# 	mkdir -p ~/.local/share/dbus-1/services
# 	cp data/re.sonny.Eloquent.service ~/.local/share/dbus-1/services/
# 	sed -i "/^Exec=/s#=.*#=${PWD}\/re\.sonny\.Eloquent --gapplication-service#" ~/.local/share/dbus-1/services/re.sonny.Eloquent.service
# 	# icons
# 	cp data/icons/re.sonny.Eloquent-symbolic.svg ~/.local/share/icons/hicolor/symbolic/apps/
# 	cp data/icons/re.sonny.Eloquent.svg ~/.local/share/icons/hicolor/scalable/apps/
# 	gtk4-update-icon-cache -qtf ~/.local/share/icons/hicolor/
# 	# desktop file
# 	cp data/re.sonny.Eloquent.desktop ~/.local/share/applications/
# 	desktop-file-edit --set-key=Exec --set-value="${PWD}/re.sonny.Eloquent %u" ~/.local/share/applications/re.sonny.Eloquent.desktop
# 	desktop-file-edit --set-key=Icon --set-value="${PWD}/data/icons/re.sonny.Eloquent.svg" ~/.local/share/applications/re.sonny.Eloquent.desktop
# 	update-desktop-database ~/.local/share/applications

