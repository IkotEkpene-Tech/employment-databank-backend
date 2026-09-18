import merge from "lodash.merge";
import dotenv from "dotenv";

dotenv.config();

const stage: any = process.env.NODE_ENV;
let config;

if (stage === "development") {
  config = require("./development").default;
} else if (stage === "production") {
  config = require("./production").default;
}

const merged = merge(
  {
    stage,
  },
  config,
);

// FRONTEND_URL is used to build absolute redirect URLs (Paystack callback,
// password reset links, etc). Without a scheme, `response.redirect()`
// silently treats it as a path relative to the current request instead of
// an external URL — sending users back to this API's own domain. Fail loud
// instead, so a bad env var is caught at boot, not discovered via a broken
// redirect in production.
if (merged.FRONTEND_URL && !/^https?:\/\//i.test(merged.FRONTEND_URL)) {
  throw new Error(
    `FRONTEND_URL must include a scheme (http:// or https://) — got "${merged.FRONTEND_URL}"`,
  );
}
merged.FRONTEND_URL = merged.FRONTEND_URL?.replace(/\/+$/, "");

export default merged;
