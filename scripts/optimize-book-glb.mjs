/**
 * Repack ancient_book.glb for the web.
 *
 * The authored model ships six 4K PNG maps (~22 MB of the 24 MB file), which is
 * far more than a 0.2 m book covering a third of the viewport can show. This
 * downsamples them and re-encodes as JPEG (glTF-core, no extension needed),
 * then rewrites the binary chunk with corrected bufferView offsets.
 *
 *   node scripts/optimize-book-glb.mjs [in.glb] [out.glb]
 */
import { readFile, writeFile } from "node:fs/promises";
import sharp from "sharp";

const IN = process.argv[2] ?? "public/ancient_book.glb";
const OUT = process.argv[3] ?? "public/ancient_book.web.glb";

/* normal maps keep more resolution — creases are the whole point of them */
const SIZE = (name) => (/normal/i.test(name) ? 1024 : 1024);
const QUALITY = (name) => (/normal/i.test(name) ? 92 : 84);

const GLB_MAGIC = 0x46546c67;
const CHUNK_JSON = 0x4e4f534a;
const CHUNK_BIN = 0x004e4942;
const pad4 = (n) => (n + 3) & ~3;

const glb = await readFile(IN);
if (glb.readUInt32LE(0) !== GLB_MAGIC) throw new Error(`${IN} is not a GLB`);

/* ---- split the container into its JSON and BIN chunks ---- */
let json = null;
let bin = null;
for (let off = 12; off < glb.length; ) {
  const len = glb.readUInt32LE(off);
  const type = glb.readUInt32LE(off + 4);
  const body = glb.subarray(off + 8, off + 8 + len);
  if (type === CHUNK_JSON) json = JSON.parse(body.toString("utf8"));
  else if (type === CHUNK_BIN) bin = body;
  off += 8 + pad4(len);
}
if (!json || !bin) throw new Error("GLB is missing a JSON or BIN chunk");
if (json.buffers?.length !== 1) throw new Error("expected a single embedded buffer");

const view = (i) => {
  const bv = json.bufferViews[i];
  return bin.subarray(bv.byteOffset ?? 0, (bv.byteOffset ?? 0) + bv.byteLength);
};

/* ---- re-encode every embedded image ---- */
const replaced = new Map(); // bufferView index -> new bytes
for (const image of json.images ?? []) {
  if (image.bufferView == null) continue;
  const src = view(image.bufferView);
  const name = image.name ?? `image_${image.bufferView}`;
  const meta = await sharp(src).metadata();
  const size = SIZE(name);
  const out = await sharp(src)
    .resize(Math.min(size, meta.width), Math.min(size, meta.height), { fit: "inside" })
    .jpeg({ quality: QUALITY(name), chromaSubsampling: "4:4:4", mozjpeg: true })
    .toBuffer();
  replaced.set(image.bufferView, out);
  image.mimeType = "image/jpeg";
  console.log(
    `  ${name.padEnd(26)} ${meta.width}x${meta.height} ${(src.length / 1e6).toFixed(2)}MB` +
      ` -> ${Math.min(size, meta.width)}px ${(out.length / 1e6).toFixed(2)}MB`,
  );
}

/* ---- rebuild the binary chunk, keeping bufferView order ---- */
const parts = [];
let cursor = 0;
json.bufferViews.forEach((bv, i) => {
  const bytes = replaced.get(i) ?? view(i);
  /* accessors read with typed arrays, so every view stays 4-byte aligned */
  const gap = pad4(cursor) - cursor;
  if (gap) parts.push(Buffer.alloc(gap));
  cursor += gap;
  bv.byteOffset = cursor;
  bv.byteLength = bytes.length;
  parts.push(bytes);
  cursor += bytes.length;
});

const newBin = Buffer.concat(parts);
json.buffers[0] = { byteLength: newBin.length };

const jsonBuf = Buffer.from(JSON.stringify(json), "utf8");
const jsonPad = Buffer.alloc(pad4(jsonBuf.length) - jsonBuf.length, 0x20);
const binPad = Buffer.alloc(pad4(newBin.length) - newBin.length, 0);

const chunks = [
  chunk(CHUNK_JSON, Buffer.concat([jsonBuf, jsonPad])),
  chunk(CHUNK_BIN, Buffer.concat([newBin, binPad])),
];
const header = Buffer.alloc(12);
header.writeUInt32LE(GLB_MAGIC, 0);
header.writeUInt32LE(2, 4);
header.writeUInt32LE(12 + chunks.reduce((n, c) => n + c.length, 0), 8);

await writeFile(OUT, Buffer.concat([header, ...chunks]));
console.log(
  `\n${IN} ${(glb.length / 1e6).toFixed(1)}MB -> ${OUT} ${(
    (12 + chunks.reduce((n, c) => n + c.length, 0)) / 1e6
  ).toFixed(1)}MB`,
);

function chunk(type, body) {
  const head = Buffer.alloc(8);
  head.writeUInt32LE(body.length, 0);
  head.writeUInt32LE(type, 4);
  return Buffer.concat([head, body]);
}
