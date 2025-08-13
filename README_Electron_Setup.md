# Electron Setup for Metro Manila Hills Hardware Inventory

This guide explains how to package the React app as a Windows executable (.exe) using Electron.

## Steps

1. **Install dependencies**

Run the following command to install Electron and electron-builder:

```
npm install --save-dev electron electron-builder
```

2. **Electron main process**

The file `public/electron.js` is already created to launch the React app in an Electron window.

3. **Update package.json**

- Electron and electron-builder are added as dependencies.
- Scripts added:
  - `npm run electron` to start the app in Electron.
  - `npm run electron-build` to build the executable.
- Build configuration added for Windows NSIS installer.

4. **Build the React app**

Run:

```
npm run build
```

5. **Run the Electron app**

Run:

```
npm run electron
```

6. **Build the Windows executable**

Run:

```
npm run electron-build
```

The output executable and installer will be in the `dist` folder.

## Notes

- Make sure to test the app thoroughly after packaging.
- Customize the Electron main process and build config as needed.

If you want, I can help you with any of these steps in detail.
