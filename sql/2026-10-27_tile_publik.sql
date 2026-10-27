-- Vector tile jaringan pipa untuk peta publik (situs tirtapatriot.co.id).
--
-- Masalah: pg_tileserv di tile.api.tirtapatriot.com memakai role yang dapat membaca hampir semua tabel GIS,
-- sehingga siapa pun dapat mengunduh layer jaringan.pipa lengkap (kedalaman, no_spk, noasbuild, sumberdana, ...)
-- dan layer lain seperti hublang.bangunanpelanggan, hublang.pengaduan, hublang.calonpelanggan, jaringan.valve,
-- jaringan.objekvital, jaringan.intake (lihat https://tile.api.tirtapatriot.com/index.json).
--
-- Perbaikan:
--   1. function layer publik.pipa(z, x, y) yang hanya mengirim geometri dan diameter (tanpa pipa dinas);
--   2. role tileserv_publik yang hanya boleh menjalankan function itu;
--   3. pg_tileserv publik dijalankan dengan role tersebut (lihat catatan di bawah).
--
-- Butuh PostGIS 3.0+ (ST_TileEnvelope). Jalankan sebagai pemilik tabel jaringan.pipa.

CREATE SCHEMA IF NOT EXISTS publik;

CREATE OR REPLACE FUNCTION publik.pipa(z integer, x integer, y integer)
RETURNS bytea
LANGUAGE sql
STABLE STRICT PARALLEL SAFE
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
  WITH batas AS (
    SELECT ST_TileEnvelope(z, x, y) AS env
  ),
  ruas AS (
    SELECT ST_AsMVTGeom(ST_Transform(p.geom, 3857), b.env, 4096, 64, true) AS geom,
           p.diameter
    FROM jaringan.pipa p, batas b
    WHERE z >= 10
      AND p.geom && ST_Transform(b.env, 4326)  -- SRID jaringan.pipa (lon/lat); konstanta agar indeks sidx_pipa terpakai
      AND coalesce(p.jenisjaringan, '') <> 'Dinas'
  )
  SELECT ST_AsMVT(ruas, 'pipa', 4096, 'geom') FROM ruas WHERE geom IS NOT NULL
$$;

COMMENT ON FUNCTION publik.pipa(integer, integer, integer) IS
  'Jaringan pipa untuk peta publik: hanya garis dan diameter, tanpa pipa dinas. Mulai zoom 10.';

-- Role baca-saja untuk pg_tileserv publik: tanpa akses tabel, hanya EXECUTE pada function di atas.
-- Ganti kata sandi sebelum dijalankan.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'tileserv_publik') THEN
    CREATE ROLE tileserv_publik LOGIN PASSWORD 'GANTI_KATA_SANDI';
  END IF;
END
$$;

REVOKE ALL ON SCHEMA publik FROM PUBLIC;
GRANT USAGE ON SCHEMA publik TO tileserv_publik;
REVOKE ALL ON FUNCTION publik.pipa(integer, integer, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION publik.pipa(integer, integer, integer) TO tileserv_publik;

-- Pemeriksaan: tabel/view yang masih dapat dibaca role publik (hasil seharusnya hanya tabel sistem PostGIS
-- seperti spatial_ref_sys). Bila ada tabel lain, hak itu kemungkinan diberikan ke PUBLIC dan perlu dicabut.
SELECT table_schema, table_name
FROM information_schema.role_table_grants
WHERE grantee IN ('tileserv_publik', 'PUBLIC')
  AND privilege_type = 'SELECT'
  AND table_schema NOT IN ('pg_catalog', 'information_schema')
ORDER BY 1, 2;

-- Pemasangan pg_tileserv publik:
--   DATABASE_URL=postgres://tileserv_publik:<sandi>@<host>/<db>
--   Setelah itu https://tile.api.tirtapatriot.com/index.json hanya berisi publik.pipa.
-- Bila ada aplikasi internal (GIS, survei) yang memakai layer lain dari server yang sama, pindahkan server
-- lama ke alamat internal (VPN atau autentikasi) dan jalankan pg_tileserv kedua dengan role ini untuk publik.
--
-- Uji:  curl -s -o /dev/null -w '%{http_code} %{size_download}\n' https://tile.api.tirtapatriot.com/publik.pipa/13/6531/4239.pbf
