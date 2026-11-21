# Product & Technical Requirements Document (PRD / TRD) — Skymock

- **Nama Produk**: Skymock
- **Kategori**: Instant Multi-Project API Mock Server & Request Inspector
- **Ekosistem**: Sky-Suite (terintegrasi dengan Skyboard & Skytype)

---

## 1. Ringkasan Produk & Tujuan (PRD)

### 1.1 Latar Belakang
Proses pengembangan aplikasi frontend dan mobile sering terhambat (*blocked*) karena menunggu kesiapan endpoint dari tim backend, serta kesulitan mensimulasikan skenario error atau latensi jaringan. Skymock hadir sebagai layanan berbasis web yang menerbitkan Base URL publik instan per proyek berdasarkan kontrak JSON yang didefinisikan oleh developer.

### 1.2 Target Pengguna
- **Frontend & Mobile Developer**: Melakukan integrasi API paralel sebelum backend selesai, serta menguji kondisi loading, empty state, dan error handling.
- **Backend Developer & QA**: Membagikan kontrak API interaktif dan menguji webhook/callback dari layanan pihak ketiga.

### 1.3 Ruang Lingkup Fitur Utama (Core Features)

1. **Multi-Project Workspace & Base URL Generator**
   - Setiap proyek memiliki isolasi data dan menerbitkan satu Base URL publik unik (`https://api.skymock.dev/m/{project_slug}`).
   - Mendukung mode akses **Public** (tanpa token) dan **Protected** (wajib header `x-skymock-key`).

2. **Multi-Method Endpoint Builder**
   - Mendukung seluruh metode HTTP standar (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`, serta penanganan otomatis `OPTIONS` untuk CORS).
   - Mendukung dynamic path parameters (contoh: `/v1/users/:id/orders/:orderId`).

3. **Request Guards & Conditional Rules**
   - **Header & Bearer Auth Check**: Validasi keberadaan atau nilai header (misal wajib `Authorization: Bearer *`, jika tidak ada otomatis balas `401 Unauthorized`).
   - **Body & Query Validation**: Pengecekan *required fields* pada payload `POST`/`PUT`/`PATCH` (otomatis balas `422 Unprocessable Entity` jika tidak terpenuhi).
   - **Conditional Variants**: Satu endpoint dapat memiliki beberapa variasi respons berdasarkan kondisi input (misal `$body.email == "fail@test.com"` → `401`).

4. **Dynamic Template & Echo Engine**
   - Mendukung injeksi variabel dinamis di dalam JSON response: `{{$uuid}}`, `{{$isoTimestamp}}`, `{{$body.field}}`, `{{$header.name}}`, dan `{{$params.id}}`.

5. **Network & Chaos Simulator**
   - Pengaturan artificial latency (`delay_ms`) dan override HTTP status code (`200`, `201`, `400`, `401`, `429`, `500`) secara real-time dari dashboard.

6. **Live Request Inspector**
   - Pemantauan lalu lintas request masuk (header, payload, query, waktu respons) secara real-time di dashboard untuk mempermudah debugging lintas perangkat.

---

## 2. Spesifikasi Teknis & Arsitektur (TRD)

### 2.1 Arsitektur Sistem (Dual-Plane)
Sistem dipisah menjadi dua layanan dalam satu monorepo untuk menjamin kecepatan eksekusi mock request:
- **Control Plane (Web Dashboard)**: Next.js / React, Tailwind CSS, Shadcn UI, Monaco Editor (untuk validasi & formatting JSON).
- **Data Plane (Mock Engine Gateway)**: Hono / ElysiaJS (Node.js atau Bun) yang bertugas menangkap seluruh wildcard traffic dan mengeksekusi aturan mock dengan latensi minimal.

> **Catatan Repo Saat Ini**: Template monorepo saat ini menggunakan `apps/web` (React 19 + Vite + TypeScript) dan `apps/api` (ASP.NET Core Web API). Sesuaikan implementasi dengan stack aktif di repository kecuali ada keputusan migrasi ke Hono/ElysiaJS.

### 2.2 Skema Database (PostgreSQL)

| Tabel | Kolom Utama | Keterangan |
| :--- | :--- | :--- |
| `projects` | `id` (UUID), `user_id`, `name`, `slug` (Unique), `is_protected` (Bool), `api_key`, `created_at` | Menyimpan isolasi proyek dan konfigurasi keamanan global. |
| `endpoints` | `id` (UUID), `project_id` (FK), `method`, `path`, `status_code`, `delay_ms`, `response_headers` (JSONB), `response_body` (JSONB) | Menyimpan definisi rute dan respons default per proyek. |
| `endpoint_rules` | `id` (UUID), `endpoint_id` (FK), `priority` (Int), `condition_type` (`header`/`body`/`query`), `condition_key`, `operator`, `expected_value`, `override_status`, `override_body` (JSONB) | Menyimpan aturan validasi (seperti Bearer token check) dan respons kondisional. |

### 2.3 Caching, State & Real-Time Layer (Redis / DragonflyDB)
- **Route Config Cache**: Definisi endpoint dan rules di-cache per `project_slug` dan di-invalidasi setiap kali ada perubahan di dashboard (menghindari query berulang ke PostgreSQL).
- **Rate Limiting**: Pembatasan request berbasis sliding window per `project_slug` dan IP klien untuk menjaga stabilitas server publik.
- **Live Inspector Stream**: Menggunakan Redis Pub/Sub yang diteruskan ke browser melalui **Server-Sent Events (SSE)** setiap kali request selesai diproses oleh Mock Engine.

### 2.4 Alur Eksekusi Request pada Mock Engine

```text
Incoming HTTP Request (ALL /m/:projectSlug/*)
  │
  ├─► 1. CORS Preflight Check (Jika OPTIONS -> langsung balas 204 + Wildcard Headers)
  ├─► 2. Project Lookup & Guard Check (Validasi project_slug & x-skymock-key jika protected)
  ├─► 3. Route Pattern Matching (Cocokkan HTTP Method & Dynamic Path /users/:id)
  ├─► 4. Rules & Auth Evaluation (Cek Bearer token, required headers, & required body fields)
  ├─► 5. Template Rendering (Parse {{$body.*}}, {{$params.*}}, {{$uuid}}, dll.)
  ├─► 6. Artificial Delay Execution (Sleep sesuai delay_ms)
  └─► 7. Send Response & Publish Log Event (Kirim JSON ke klien + stream log ke SSE)
```

### 2.5 Kebutuhan Infrastruktur & Keamanan
- **Domain Routing**:
  - `skymock.domain.com` → Control Plane (Web App)
  - `api.skymock.domain.com` → Data Plane (Mock Engine)
- **CORS Policy**: Wajib menyertakan `Access-Control-Allow-Origin: *`, `Access-Control-Allow-Methods: *`, dan `Access-Control-Allow-Headers: *` agar dapat diakses mulus dari browser (`localhost`), emulator, maupun perangkat mobile fisik.
- **Payload Cap**: Batas maksimal ukuran JSON response (misal 512 KB per endpoint) dan request body (misal 1 MB) untuk mencegah penyalahgunaan memori.

---

## 3. Tahapan Implementasi (Milestones)

- **Milestone 1 (Core MVP)**: Setup database, pembuatan proyek & Base URL slug, CRUD endpoint dasar (`GET`, `POST`, `PUT`, `DELETE`), pencocokan path dinamis (`:id`), serta dukungan CORS penuh.
- **Milestone 2 (Rules & Dynamic Engine)**: Implementasi pengecekan Header / Bearer Token, validasi required body fields, parser variabel dinamis (`{{$body.*}}`, `{{$uuid}}`), serta simulator delay dan status code.
- **Milestone 3 (Inspector & Ekosistem)**: Integrasi Live Request Inspector via SSE dan tombol ekspor payload bermasalah langsung ke Skytype.
