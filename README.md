# Assignment 7 Vue SPA

Standalone Vue 3 + TypeScript SPA for the property operations backend API described by `backend-swagger.json`.

## Requirements

- Node.js `^20.19.0` or `>=22.12.0`
- npm

## Configuration

Set `VITE_API_BASE_URL` when the API is served from a different origin:

```sh
VITE_API_BASE_URL=https://localhost:5001
```

When `VITE_API_BASE_URL` is not set, the SPA uses same-origin API requests such as `/api/v1/auth/login`.

## Local Startup

Install dependencies:

```sh
npm install
```

Run the development server:

```sh
npm run dev
```

Build for production:

```sh
npm run build
```

Preview the production build:

```sh
npm run preview
```

## Verification Notes

`npm run lint` and `npm run format` are configured to modify files (`--fix` / `--write`). Run them only when auto-formatting changes are approved.
