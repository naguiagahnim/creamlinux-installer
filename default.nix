{pkgs ? import <nixpkgs> {}}: let
  cargoRoot = "src-tauri";
  src = ./.;

  patchSassEmbedded = pkgs.writeShellScriptBin "patch-sass-embedded" ''
    NIX_LD="$(cat ${pkgs.stdenv.cc}/nix-support/dynamic-linker)"
    for dart_bin in node_modules/sass-embedded-linux-*/dart-sass/src/dart; do
      if [ -f "$dart_bin" ]; then
        ${pkgs.patchelf}/bin/patchelf --set-interpreter "$NIX_LD" "$dart_bin"
      fi
    done
  '';
in
  pkgs.rustPlatform.buildRustPackage {
    pname = "creamlinux-installer";
    version = "1.5.0-unstable-2026-04-23";
    inherit src;

    cargoLock.lockFile = ./src-tauri/Cargo.lock;

    npmDeps = pkgs.fetchNpmDeps {
      inherit src;
      hash = "sha256-anYTERlnfOGDsGW0joy+h7wECJNDy6q+0a2to6t36pg=";
    };

    nativeBuildInputs =
      [
        pkgs.cargo-tauri.hook
        pkgs.nodejs
        pkgs.npmHooks.npmConfigHook
        pkgs.pkg-config
      ]
      ++ pkgs.lib.optionals pkgs.stdenv.isLinux [
        pkgs.wrapGAppsHook4
      ];

    buildInputs = pkgs.lib.optionals pkgs.stdenv.isLinux [
      pkgs.glib-networking
      pkgs.openssl
      pkgs.webkitgtk_4_1
    ];

    inherit cargoRoot;

    buildAndTestSubdir = cargoRoot;

    postPatch = ''
      substituteInPlace src-tauri/tauri.conf.json \
        --replace-fail '"createUpdaterArtifacts": true' '"createUpdaterArtifacts": false'
    '';

    preBuild = ''
      ${patchSassEmbedded}/bin/patch-sass-embedded
    '';

    env.NO_STRIP = true;
  }
