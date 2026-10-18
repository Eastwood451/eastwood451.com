# Portefølje- og tradingsimulator

React source supplied by the site owner. Static assets in `/portefolje-simulator/`
are committed for the existing Cloudflare Pages and GitHub Pages deployments.

To rebuild from this directory:

```sh
npm ci
npm run build
```

The app uses the site's existing login gate. Its market prices and parameters
are simulations from the supplied source. Gemini is unconfigured in that source;
AI requests show a clear message immediately and require a separate server-side
integration before they can run. Never embed an API key in the browser bundle.
