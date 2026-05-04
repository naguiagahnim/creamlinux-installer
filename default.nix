{
  pkgs ?
    import
      (fetchTarball "https://github.com/NixOS/nixpkgs/archive/c6d65881c5624c9cae5ea6cedef24699b0c0a4c0.tar.gz")
      { },
}:
pkgs.callPackage ./package.nix { }
