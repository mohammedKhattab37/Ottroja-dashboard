import Medusa from "@medusajs/js-sdk";

export const sdk = new Medusa({
  baseUrl: import.meta.env.MEDUSA_BASE_SERVER_URL || "/",
  debug: import.meta.env.NODE_ENV === "development",
  auth: {
    type: "session",
  },
});
