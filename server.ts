import { serveDir } from "jsr:@std/http/file-server";

Deno.serve({ hostname: "0.0.0.0", port: 7777 }, (req) => {
    return serveDir(req, { fsRoot: "./dist" });
});