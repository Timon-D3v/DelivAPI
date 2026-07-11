# DelivAPI

A personal CDN/WebAPI for uploading and pulling images and other files.

- Version: **2.0.0**
- Repo: https://github.com/Timon-D3v/DelivAPI
- Docker image: `timond3v/delivapi:latest`
- Client library: https://github.com/Timon-D3v/DelivAPI-Client (NPM: `delivapi-client`)

> DelivAPI v2.0 adds an improved database structure and **chunked uploads**.

---

## Features

- Upload files via HTTP (`/api/upload`)
- Update/replace existing files (`/api/update`)
- Chunked uploads for large files:
  - init upload session (`/api/uploadInitialChunk`)
  - upload chunks (`/api/uploadChunk`)
  - init chunked update (`/api/updateInitialChunk`)
- CDN-style file serving:
  - `GET /cdn/:database/:filename`
  - Automatically reassembles chunked files server-side
- Basic HMAC authentication via `x-signature`
- MySQL storage backend (separate schemas for users/files/chunks)
- Metadata utilities:
  - list URLs (`/api/getAllFileUrls`)
  - list file metadata (`/api/getFilesMetadata`)
- Delete file endpoint (`/api/deleteFile`)

---

## Architecture overview

### Routers
- `/api/*` — JSON/FormData API for uploads, updates, chunk handling, listing, deletion
- `/cdn/*` — public file delivery endpoints (streams raw data)

### Storage model (MySQL)
DelivAPI uses multiple schemas:

- `delivapi` — holds users and API keys
- `cdn` — holds file records per organization/user
- `chunks` — holds chunk data per organization/user for chunked files

Chunked uploads store a **placeholder** file record (JSON) in `cdn.<org>` containing:
- `type: "chunked"`
- `uuid`
- `mimetype`
- `length` (chunk count)

Chunks are stored separately in `chunks.<org>` and reassembled on `GET /cdn/...`.

---

## Requirements

- Node.js (Docker image uses `node:24.15.0-alpine3.23`)
- MySQL 8 (dev compose uses `mysql:8.0.43`)
- (Optional) Docker + Docker Compose for local dev/prod deployment

---

## Configuration (Environment variables)

DelivAPI loads configuration via `dotenv` and expects the following variables:

| Variable | Type | Description |
|---|---:|---|
| `ENV` | `dev \| prod` | Runtime environment |
| `HOST` | `string` | Bind host (e.g. `0.0.0.0`) |
| `PORT` | `number` | Bind port (e.g. `8080`) |
| `MYSQL_HOST` | `string` | MySQL host |
| `MYSQL_PORT` | `number` | MySQL port |
| `MYSQL_USER` | `string` | MySQL user |
| `MYSQL_PASSWORD` | `string` | MySQL password |
| `MYSQL_SCHEMA` | `string` | Main schema name (project uses multiple schemas) |
| `ORIGIN` | `string` | Public origin used to build returned URLs (e.g. `https://api.example.com`) |

---

## Development

### 1) Start the dev database (Docker Compose)
A dev compose file exists at `./dev/compose.yaml` and starts MySQL:

```bash
docker compose -f ./dev/compose.yaml up -d
```

It exposes MySQL on `localhost:8081` (container port 3306).

### 2) Run the API in watch mode
```bash
npm run dev
```

This runs the dev DB compose (as above) and starts `tsx watch src/app.ts`.

---

## Build & run (without Docker)

```bash
npm install
npm run build
npm start
```

---

## Docker

### Build locally
```bash
npm run docker:build
```

### Run locally
```bash
npm run docker:run
```

This runs the container and binds port `8080:8080` and loads environment variables from `./docker.env`.

### Stop
```bash
npm run docker:stop
```

### Multi-arch build and push
```bash
npm run docker:buildx:push
```

Image: `timond3v/delivapi:latest`

---

## API Documentation

All `/api/*` endpoints are served by the API router (mounted at `/api`), and the CDN router is mounted at `/cdn`.

> Note: upload endpoints use `multer` with `memoryStorage()` and a server-side upload size limit of **100 MB**.

### Authentication: `x-signature`

Most write endpoints require an `x-signature` header.

Current signing scheme (as implemented server-side):

- For upload/update/chunk endpoints:
  - `expectedSignature = HMAC_SHA256(user.key, user + fileOrChunkBytes)`
- For delete:
  - `expectedSignature = HMAC_SHA256(user.key, user + filename)`

Where `user.key` is the API key stored in the `delivapi.user` table.

---

## Endpoints (summary)

### `POST /api/upload`
Upload a file.

**FormData**
- `file`: file blob
- `user`: string

**Headers**
- `x-signature`: HMAC(user + fileBytes)

**Response**: `DelivApiUploadResponse`
- `{ error: false, message, url }` on success

---

### `POST /api/update`
Replace/update an existing file.

**FormData**
- `filename`: string (UUID or stored filename)
- `file`: file blob
- `user`: string

**Headers**
- `x-signature`: HMAC(user + fileBytes)

**Response**: `DelivApiUpdateResponse`

---

### `POST /api/uploadInitialChunk`
Initialize a chunked upload (creates placeholder + stores chunk 0).

**FormData**
- `chunk`: blob
- `chunkCount`: number (total chunks)
- `user`: string

**Headers**
- `x-signature`: HMAC(user + chunkBytes)

**Response**: `DelivApiUploadInitialChunkResponse`  
Returns a URL containing the generated UUID/filename.

---

### `POST /api/updateInitialChunk`
Initialize a chunked update for an existing file (replaces metadata, clears existing chunks, stores chunk 0).

**FormData**
- `filename`: string
- `chunk`: blob
- `chunkCount`: number
- `user`: string

**Headers**
- `x-signature`: HMAC(user + chunkBytes)

**Response**: `DelivApiUpdateInitialChunkResponse`

---

### `POST /api/uploadChunk`
Upload a subsequent chunk to an existing chunked file.

**FormData**
- `chunkIndex`: number (0-based; note: endpoint expects `>= 0`)
- `filename`: string
- `chunk`: blob
- `user`: string

**Headers**
- `x-signature`: HMAC(user + chunkBytes)

**Response**: `DelivApiUploadChunkResponse`

---

### `POST /api/deleteFile`
Delete a file and any associated chunks.

**Body** (no file upload; `multer.none()`)
- `user`: string
- `filename`: string

**Headers**
- `x-signature`: HMAC(user + filename)

**Response**: `DelivApiResponse`

---

### `POST /api/getAllFileUrls`
Returns all file URLs for a user.

**Body**
- `user`: string

**Response**
- `{ error, message, urls: string[] }`

> Note: currently this endpoint does not appear to require authentication.

---

### `POST /api/getFilesMetadata`
Returns UUID + mimetype + URL for all files for a user.

**Body**
- `user`: string

**Response**
- `{ error, message, metadata: { uuid, url, mimetype }[] }`

> Note: currently this endpoint does not appear to require authentication.

---

### `GET /cdn/:database/:filename`
Fetch a file.

- If the file record is a chunked placeholder JSON (`{ type: "chunked", ... }`), DelivAPI:
  - loads all chunks
  - sorts by `chunkIndex`
  - streams the combined content
  - sets `Content-Type` and `Content-Disposition`

- If the `download` query param is set to `true`, the file will automatically be downloaded.

Otherwise it returns the file directly from the `cdn` schema.

Example:
```text
GET /cdn/<user>/<uuid>
```

Example (with download):
```text
GET /cdn/<user>/<uuid>?download=true
```

---

## Database setup

### Initial schemas + user table
An initialization SQL script creates:

- schema: `cdn`
- schema: `chunks`
- schema: `delivapi`
- table: `delivapi.user (id, name, key)`

### Per-user/organization tables
For each organization/user `${organizationName}`, DelivAPI uses:

- `cdn.${organizationName}`: stores `{ uuid, mimetype, file(LONGBLOB) }`
- `chunks.${organizationName}`: stores `{ id, uuid, chunkIndex, chunk(LONGBLOB) }`

---

## Roadmap

- [x] Share downloadable links with a query param
- [ ] Add a UI (admin / upload browser / file list)

---

## License

MIT © Timon Fiedler (@Timon-D3v)