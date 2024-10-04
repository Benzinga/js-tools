# Benzinga JS Tools

This Project is Made Possible thanks to

[![Benzinga Logo](https://import.cdn.thinkific.com/222214/D3r5EJy9SZaNsaY7dQsj_Benzinga-logo-navy.svg)](www.benzinga.com)

[![ZSoft Logo](https://raw.githubusercontent.com/ZNackasha/CDN/refs/heads/main/zsoft-no-size.svg)](https://github.com/znackasha)

This Repo is a mono repo containing many utility packages. please look at the readme.md of each package for more info.

## Requirements

Before starting we need to install some dependencies

- Node.js version 18

## Setup

1. Begin the long and arduous process of installing everything

 ```sh
 npm install
 ```

## Adding a new library

In this repo we use generators to add libraries. here are some examples.

1. A publishable typescript library

    ```sh
    yarn nx g @nx/js:lib --bundler=swc --unitTestRunner=jest library-name --directory=library-dir --importPath=@benzinga/lib-import-path --publishable
    ```

2. A non-publishable typescript library

    ```sh
    yarn nx g @nx/js:lib --bundler=none --unitTestRunner=jest library-name --directory=library-dir --importPath=@benzinga/lib-import-path
    ```

3. A publishable react Library

    ```sh
    yarn nx g @nx/react:lib library-name --directory=library-dir --importPath=@benzinga/lib-import-path --compiler=swc --bundler=vite --publishable
    ```

4. A non-publishable react Library

    ```sh
    yarn nx g @nx/react:lib library-name --directory=library-dir --importPath=@benzinga/lib-import-path --compiler=swc --bundler=none
    ```

5. if you use another command please add it here.
