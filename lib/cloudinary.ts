import "server-only";

import { v2 as cloudinary } from "cloudinary";

const url = process.env.CLOUDINARY_URL;

if (!url) {
  throw new Error("CLOUDINARY_URL is not defined");
}

cloudinary.config({
  secure: true
});

export default cloudinary;
