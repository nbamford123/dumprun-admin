# DumpRun Admin Portal

Administrative dashboard for the DumpRun platform - manage operations, monitor pickups, and oversee platform activity.

## Tech Stack
- **Frontend Framework**: Lit (web components)
- **UI Components**: Shoelace Design System
- **Data Grid**: AG Grid for tabular data management
- **Routing**: Vaadin Router
- **Authentication**: AWS Cognito via Amplify
- **Build Tool**: Vite
- **Development Proxy**: Custom Deno proxy server
- **Code Quality**: Biome (linting), TypeScript
- **Deploy**: Netflify, via github actions

## Development

### Prerequisites
- Node.js
- Deno (for development proxy)

### Getting Started
```bash
npm install
npm run dev:proxy  # Start development proxy server
npm run dev        # Start Vite dev server
```
