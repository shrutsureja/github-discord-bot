import { createFactory } from "hono/factory";
import { addBountyToDiscord } from "./discord";
import { extractCommitData, hexToBytes } from "./utils";

const encoder = new TextEncoder();

const factory = createFactory();

// Check if the request is coming from GitHub webhook
export const checkGhSignature = factory.createMiddleware(async (c, next) => {
  try {
    const ghWebhookSecret = c.env.GITHUB_WEBHOOK_SECRET;
    const sigHex = c.req.header()["x-hub-signature-256"].split("=")[1];
    const algorithm = { name: "HMAC", hash: { name: "SHA-256" } };
    const keyBytes = encoder.encode(ghWebhookSecret);
    const extractable = false;
    const key = await crypto.subtle.importKey(
      "raw",
      keyBytes,
      algorithm,
      extractable,
      ["sign", "verify"]
    );
    const sigBytes = hexToBytes(sigHex);
    const dataBytes = encoder.encode(JSON.stringify(await c.req.json()));
    const equal = await crypto.subtle.verify(
      algorithm.name,
      key,
      sigBytes,
      dataBytes
    );

    if (!equal) c.set("error", "unauthorized");

    return await next();
  } catch (e) {
    console.log(e);
    c.set("error", "unauthorized");
    return await next();
  }
});

export const webhookHandler = factory.createHandlers(
  checkGhSignature,
  async (c) => {
    try {
      const discordWH = c.env.DISCORD_WEBHOOK_URL;

      if (c.var.error) return c.status(401);

      const body = await c.req.json();
      const extractedData = extractCommitData(body);

      await c.env.data.put("data", JSON.stringify(extractedData));

      // send the body
      if(extractedData){
        const discordResponse = await addBountyToDiscord({
          commitData : extractedData,
          discordWh: discordWH,
        });
        
        if (!discordResponse.ok) { 
          return c.json({
            message: "Error while sending notification to discord",
          });
        }
      }

      return c.json({ message: "Webhook received" });
    } catch (e) {
      console.log(e);
      c.status(200);
      return c.json({ message: "Unauthorized" });
    }
  }
);

export const dataViewer = factory.createHandlers(
  async (c) => {
    try {
      const data = await c.env.data.get("data");
      const parsed = JSON.parse(data)
      c.status(203)
      return c.json({data : parsed})
    } catch (e) {
      console.log(e);
      c.status(200);
      return c.json({ message: "Unauthorized" });
    }
  }
);