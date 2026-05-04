<p align="center">
<a href="https://www.salesforce.com/products/data/"><img src="./client/src/assets/data_cloud_logo.png" alt="Salesforce Data 360" width="150" height="150" hspace="50"/></a>
<a href="https://react.dev"><img src="./client/src/assets/react.svg" alt="React" width="150" height="150" hspace="50"/></a>
<a href="https://www.heroku.com"><img src="./client/src/assets/heroku.webp" alt="Heroku" width="150" height="150" hspace="50"/></a>
<p/>

# Salesforce Data 360 Segment Membership

A full-stack explorer for Salesforce Data 360 (formerly Data Cloud) segments, their unified individuals, and related DMO records — built with React, Express, and native Node.js TypeScript.

> **Note:** This is a demo / reference implementation. It reads segments, segment members, and related Data Model Objects via the Data 360 REST APIs. It is not hardened for production multi-tenant use.

## Table of Contents

- [Salesforce Data 360 Segment Membership](#salesforce-data-360-segment-membership)
  - [Table of Contents](#table-of-contents)
  - [What does it do?](#what-does-it-do)
  - [How does it work?](#how-does-it-work)
  - [Demo](#demo)
    - [Architecture Diagram](#architecture-diagram)
    - [Segment Browsing](#segment-browsing)
    - [Individual Detail \& Related Data Explorer](#individual-detail--related-data-explorer)
  - [API Specification](#api-specification)
    - [Authentication](#authentication)
    - [Middleware](#middleware)
    - [Health](#health)
    - [Segments](#segments)
  - [Tech Stack](#tech-stack)
  - [Configuration](#configuration)
  - [Prerequisites](#prerequisites)
  - [Local Development](#local-development)
  - [Environment Variables](#environment-variables)
  - [Salesforce Data 360 Configuration](#salesforce-data-360-configuration)
    - [External Client App with client_credentials](#external-client-app-with-client_credentials)
    - [Unified Individual DMO names](#unified-individual-dmo-names)
  - [Deployment](#deployment)
    - [1. Set Configuration](#1-set-configuration)
    - [2. Deploy](#2-deploy)
- [License](#license)
- [Disclaimer](#disclaimer)

## What does it do?

This application exposes Salesforce Data 360 segment membership through a modern browsable UI. It connects to a Data 360 org via OAuth 2.0 client credentials, lists all segments, resolves each segment's unified individuals, and joins related DMO records (page views, email addresses, etc.) into a single detail view.

The demo showcases two operational modes:

**Segment Browsing Mode** — High-level catalog of every segment in a Data 360 org:

- Lists all segments via the Data 360 `ssot/segments` REST endpoint
- Displays segment status, last published date, member count, and publish interval at a glance
- Supports client-side search across display name, API name, and description
- Parses and surfaces the HTML-encoded `includeCriteria` JSON so downstream code can understand the segment definition

**Individual Resolution Mode** — Drills into a single segment and materializes unified profiles:

- Calls `ssot/segments/{apiName}/members` to fetch the member set
- Joins `UnifiedssotIndividualInd__dlm` and `UnifiedLinkssotIndividualInd__dlm` with the source `ssot__Individual__dlm` via the Query API
- Inspects `includeCriteria` to discover related DMOs used by aggregation filters, then queries each one in parallel
- Groups related records under the unified individual and exposes them in a sortable, searchable, column-configurable table

## How does it work?

**Segment Browsing Flow:**

1. **Client boots**: React mounts inside `<BrowserRouter>` and routes the default path to `SegmentsPage`
2. **Fetch request**: the client calls `GET /api/v1/segments` with the `x-api-key` header
3. **API key check**: `apiKeyMiddleware` compares the header against the server's `API_KEY` env var and rejects with `401` on mismatch
4. **Token resolution**: `salesforceAuth` service returns a cached token or requests a new one via `grant_type=client_credentials`
5. **Data 360 call**: `segmentsService` hits `/services/data/{API_VERSION}/ssot/segments` with the bearer token
6. **Criteria decoding**: the server decodes `&quot;`-escaped HTML entities in `includeCriteria` and `JSON.parse`s the result
7. **Response**: segments are returned as JSON, cached in the client for the session
8. **Render**: `SegmentsPage` renders `SegmentCard` components with status pills, member counts, and click-through navigation

**Individual Resolution Flow:**

1. **Navigation**: user clicks a segment card, routing to `/segments/:segmentApiName`
2. **Parallel fetch**: server kicks off three calls concurrently — token, segment members, full segment (to inspect criteria)
3. **Base query**: server runs a Data 360 SQL query joining `UnifiedssotIndividualInd__dlm` → `UnifiedLinkssotIndividualInd__dlm` → `ssot__Individual__dlm`, scoped by the unified IDs returned from the member endpoint
4. **Related DMO discovery**: `extractRelatedFilters` walks `includeCriteria.filters` and collects unique `containerObjectApiName`s from `NumberAggregation`/`DateAggregation` filters
5. **Join key inference**: `getJoinKey` inspects the last step of each filter's `path` — if the left subject is the unified DMO, it joins on unified ID, otherwise it joins on source record ID
6. **Parallel related queries**: each related DMO is queried in parallel with `Promise.allSettled` so one failing DMO doesn't poison the whole response
7. **Client-side grouping**: the server builds a `Map<unifiedId, Record<DMO, rows[]>>` and attaches it to each individual as `relatedData`
8. **Detail page**: the user drills into a single individual via `IndividualDetailPage`, which renders a `RelatedDataExplorer` for sortable, searchable, column-configurable tables over every related DMO

## Demo

### Architecture Diagram

![Architecture Diagram](./screenshots/architecture-diagram.png)

### Segment Browsing

![Segment browsing demo](./screenshots/segments-demo.gif)

### Individual Detail & Related Data Explorer

![Individual detail](./screenshots/individual-detail.png)

> **Note:** All the information in here is from a demo org and all the individuals are fictional.

## API Specification

### Authentication

All non-health endpoints are gated by an API key passed in the `x-api-key` request header. The key is validated by `apiKeyMiddleware` against the `API_KEY` env var on the server.

- **Header**: `x-api-key: <value>`
- **Obtaining it**: generate a random 32-byte hex string (see the Configuration section) and share it between the server and the client build
- **Failure response**: `401 Unauthorized` with body `{ "error": "Unauthorized" }`

### Middleware

| Middleware                | Applies To                                | Purpose                                                                              |
| ------------------------- | ----------------------------------------- | ------------------------------------------------------------------------------------ |
| `cors`                    | all routes                                | Restricts cross-origin requests to the `CORS_ORIGIN` env value                       |
| `express.json`            | all routes                                | Parses JSON request bodies                                                           |
| `requestLoggerMiddleware` | all routes                                | Emits a structured log on every response with method, URL, status, and duration      |
| `apiKeyMiddleware`        | `/api/v1/segments/*` routes only (inline) | Validates the `x-api-key` header; `401` on mismatch. Never applied to static assets. |

### Health

**`GET /api/v1/health`**

- **Auth required**: no
- **Description**: Liveness probe for uptime checks
- **Response**: `200 OK`
  ```json
  { "status": "ok", "timestamp": "2026-01-01T00:00:00.000Z" }
  ```

### Segments

**`GET /api/v1/segments`**

- **Auth required**: yes
- **Description**: Returns every segment in the connected Data 360 org with decoded `includeCriteria`
- **Request headers**: `x-api-key: <value>`
- **Response**: `200 OK`
  ```json
  {
    "batchSize": 50,
    "offset": 0,
    "totalSize": 1,
    "segments": [
      {
        "apiName": "Example_Segment__c",
        "displayName": "Example Segment",
        "description": "Example description",
        "publishStatus": "SUCCESS",
        "segmentStatus": "ACTIVE",
        "lastPublishedEndDateTime": "2026-01-01T00:00:00Z",
        "lastSegmentMemberCount": 1,
        "publishInterval": "NO_REFRESH",
        "includeCriteria": { "type": "LogicalComparison", "operator": "and", "filters": [] }
      }
    ]
  }
  ```
- **Error responses**:
  - `401 Unauthorized` — missing or invalid API key
  - `500 Internal Server Error` — Data 360 upstream failure or token acquisition failure

**`GET /api/v1/segments/:segmentApiName/individuals`**

- **Auth required**: yes
- **Description**: Resolves all unified individuals in a segment and joins related DMO records driven by the segment's criteria
- **Request headers**: `x-api-key: <value>`
- **Path params**: `segmentApiName` — the segment's API name (e.g. `Example_Segment__c`)
- **Response**: `200 OK`
  ```json
  {
    "totalCount": 1,
    "individuals": [
      {
        "id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
        "unifiedId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
        "firstName": "Example",
        "lastName": "User",
        "personName": "Example User",
        "salutation": null,
        "birthDate": null,
        "titleName": null,
        "primaryAccountId": null,
        "currentEmployerName": null,
        "dataSourceId": null,
        "dataSourceObjectId": null,
        "photoUrl": null,
        "relatedData": {
          "Page_View__dlm": [{ "ssot__Id__c": "1", "ssot__CreatedDate__c": "2026-01-01T00:00:00Z" }]
        }
      }
    ]
  }
  ```
- **Error responses**:
  - `401 Unauthorized` — missing or invalid API key
  - `500 Internal Server Error` — Data 360 query failure, segment not found, or token acquisition failure

## Tech Stack

| Layer         | Technology                                                                                          | Description                                                                |
| ------------- | --------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| Frontend      | [React 19](https://react.dev), [Vite](https://vite.dev), [Tailwind CSS v4](https://tailwindcss.com) | UI library, dev server / bundler, utility-first CSS                        |
| Routing       | [react-router v7](https://reactrouter.com)                                                          | Client-side routing                                                        |
| Icons         | [Lucide React](https://lucide.dev)                                                                  | Icon set                                                                   |
| Backend       | [Node.js 24](https://nodejs.org), [Express 5](https://expressjs.com)                                | JavaScript runtime with native TypeScript execution, minimal web framework |
| Data Platform | [Salesforce Data 360](https://www.salesforce.com/products/data/)                                    | Source of segments, unified individuals, and related DMO records           |
| Hosting       | [Heroku](https://www.heroku.com)                                                                    | Runs the Express app which serves the built React client                   |

## Configuration

## Prerequisites

To run this application locally, you will need the following:

- **Node.js** version 24 or later installed (type `node -v` in your terminal to check). Node 24 is required because the server uses native TypeScript execution — no `tsc` build step. Follow [instructions](https://nodejs.org/en/download) if you don't have Node.js installed
- **npm** version 11 or later installed (type `npm -v` in your terminal to check). Node.js includes `npm`
- **git** installed. Follow the instructions to [install git](https://git-scm.com/downloads)
- A [Salesforce Data 360](https://www.salesforce.com/products/data/) org with at least one published segment
- An [**External Client App**](https://help.salesforce.com/s/articleView?id=xcloud.external_client_apps.htm&type=5) in the Data 360 org with the `client_credentials` OAuth flow enabled and a user assigned as the run-as identity
- **The unified and unified-link DMO API names** for the `Individual` subject area — these are org-specific and must be copied out of the Data 360 setup UI

## Local Development

1. **Clone the repository**

   ```bash
   git clone https://github.com/mvrzan/salesforce-data360-segment-membership.git
   cd salesforce-data360-segment-membership
   ```

2. **Configure Salesforce Data 360**

   > **Important**: The External Client App's `client_credentials` flow must have a run-as user assigned, and that user must have the Data 360 API permission sets to read segments and run Query API SQL.

   Follow the [Salesforce External Client App documentation](https://help.salesforce.com/s/articleView?id=xcloud.external_client_apps.htm&type=5) to:
   - Create an External Client App with OAuth scopes covering Data 360
   - Enable the `client_credentials` flow and assign a run-as user
   - Copy the Consumer Key and Consumer Secret
   - Note the unified Individual DMO API name and unified link DMO API name from the Data 360 Data Model setup

3. **Configure Environment Variables**

   **Server:**

   ```bash
   cp server/.env.example server/.env
   ```

   Open `server/.env` and fill in all required values.

   **Client:**

   ```bash
   cp client/.env.example client/.env
   ```

   Open `client/.env` and fill in `VITE_API_KEY`. **It must match `API_KEY` in `server/.env`** — the client sends it as `x-api-key` and the server compares byte-for-byte.

   See [Environment Variables](#environment-variables) for a full description of every variable.

   Generate a secure API key:

   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

   > ⚠️ **Note**: The Vite dev server loads `VITE_*` vars at build/dev time. If you change `VITE_API_KEY`, restart `npm run dev` in the client.

4. **Install Dependencies**

   Install in both workspaces:

   ```bash
   (cd server && npm install)
   (cd client && npm install)
   ```

5. **Start the Application**

   Open two terminals.

   Terminal 1 — server (port 3000):

   ```bash
   cd server
   npm run dev
   ```

   Terminal 2 — client (port 5173, proxies `/api` to the server):

   ```bash
   cd client
   npm run dev
   ```

6. **Access the Application**

   Once both servers are running, open your browser and navigate to `http://localhost:5173`.

## Environment Variables

**Server (`server/.env`):**

| Variable                      | Required | Description                                                                                   |
| ----------------------------- | -------- | --------------------------------------------------------------------------------------------- |
| `PORT`                        | No       | Port the Express server listens on. Defaults to `3000`.                                       |
| `API_KEY`                     | Yes      | Shared secret validated against the `x-api-key` header on every `/api/v1/segments/*` request. |
| `SF_INSTANCE_URL`             | Yes      | Salesforce org instance URL (e.g. `https://example.my.salesforce.com`). No trailing slash.    |
| `SF_CLIENT_ID`                | Yes      | External Client App Consumer Key.                                                             |
| `SF_CLIENT_SECRET`            | Yes      | External Client App Consumer Secret.                                                          |
| `API_VERSION`                 | Yes      | Salesforce REST API version (e.g. `v66.0`).                                                   |
| `UNIFIED_INDIVIDUAL_DMO`      | Yes      | API name of the unified Individual DMO (e.g. `UnifiedssotIndividualInd__dlm`).                |
| `UNIFIED_LINK_INDIVIDUAL_DMO` | Yes      | API name of the unified link DMO that connects the unified Individual to source records.      |

**Client (`client/.env`):**

| Variable       | Required | Description                                                                                 |
| -------------- | -------- | ------------------------------------------------------------------------------------------- |
| `VITE_API_KEY` | Yes      | Copied into the `x-api-key` header on every API request. Must match the server's `API_KEY`. |

## Salesforce Data 360 Configuration

### External Client App with client_credentials

Create an External Client App in the target Salesforce org and enable the OAuth `client_credentials` grant. Assign a run-as user with permissions to read segments and run Data 360 SQL queries. External Client Apps are the modern replacement for Connected Apps for server-to-server integrations.

Official [instructions](https://help.salesforce.com/s/articleView?id=xcloud.external_client_apps.htm&type=5).

### Unified Individual DMO names

The `UNIFIED_INDIVIDUAL_DMO` and `UNIFIED_LINK_INDIVIDUAL_DMO` env vars are **org-specific** — they are generated when identity resolution is configured against the `Individual` subject area. Find them in Data 360 under **Data Model** → filter by `__dlm` objects prefixed with `Unified`.

## Deployment

The project is configured to deploy to Heroku from the repo root. The root `package.json` defines a `start` script that runs end-to-end:

1. Installs the client and builds the React bundle
2. Moves the `client/dist` output to `server/public/`
3. Installs server dependencies and boots the Express server via `node src/index.ts`

Heroku runs `npm install` and `npm start` at the root automatically — no `Procfile`, no manual build step.

### 1. Set Configuration

Set every server environment variable as a Heroku config var:

```bash
heroku config:set \
  CORS_ORIGIN=https://your-app.herokuapp.com \
  API_KEY=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))") \
  SF_INSTANCE_URL=https://example.my.salesforce.com \
  SF_CLIENT_ID=xxxxxxxx \
  SF_CLIENT_SECRET=xxxxxxxx \
  API_VERSION=v66.0 \
  UNIFIED_INDIVIDUAL_DMO=UnifiedssotIndividualInd__dlm \
  UNIFIED_LINK_INDIVIDUAL_DMO=UnifiedLinkssotIndividualInd__dlm
```

Because the client bundle is built on the Heroku dyno, `VITE_API_KEY` must be exposed at build time as well:

```bash
heroku config:set VITE_API_KEY=<same value as API_KEY>
```

### 2. Deploy

```bash
git push heroku main
```

Heroku runs `npm install` and `npm start` from the root. The `start` script handles the client build, copies assets into `server/public`, and boots the server, which serves the SPA and the API from a single dyno.

# License

ISC

---

# Disclaimer

This software is to be considered "sample code", a Type B Deliverable, and is delivered "as-is" to the user. Salesforce bears no responsibility to support the use or implementation of this software.
