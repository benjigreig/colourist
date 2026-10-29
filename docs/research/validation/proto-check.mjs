import * as z from "zod";
import * as v from "valibot";
const text='{"a":{"__proto__":{"polluted":true},"b":1}}';
const d=JSON.parse(text);
console.log("own keys", Object.keys(d.a));
const zr=z.record(z.string().regex(/^[a-z]+$/), z.any()).safeParse(d.a);
console.log("zod", zr.success, zr.success && Object.keys(zr.data), zr.success && Object.getPrototypeOf(zr.data));
const vr=v.safeParse(v.record(v.pipe(v.string(),v.regex(/^[a-z]+$/)), v.any()), d.a);
console.log("valibot", vr.success, vr.success && Object.keys(vr.output));
