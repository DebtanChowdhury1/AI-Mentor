import "server-only";

import { v2 as cloudinary } from "cloudinary";

let configured = false;

function ensureConfigured() {
  if (configured) {
    return;
  }

  if (!process.env.CLOUDINARY_URL) {
    throw new Error("CLOUDINARY_URL is not defined");
  }

  cloudinary.config({
    secure: true
  });
  configured = true;
}

const cloudinaryClient: typeof cloudinary = new Proxy(cloudinary, {
  get(target, prop, receiver) {
    ensureConfigured();
    return Reflect.get(target, prop, receiver);
  },
  apply(target, thisArg, argArray) {
    ensureConfigured();
    return Reflect.apply(target as unknown as (...args: unknown[]) => unknown, thisArg, argArray);
  }
});

export function getCloudinary() {
  ensureConfigured();
  return cloudinaryClient;
}

export default cloudinaryClient;
