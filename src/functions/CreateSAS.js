const { app } = require("@azure/functions");
const crypto = require("crypto");

app.http("hello", {
  methods: ["GET", "POST"],
  authLevel: "anonymous",
  handler: async (request, context) => {
    context.log(`Http function processed request for url "${request.url}"`);

    const name = request.query.get("name") || (await request.text()) || "world";

    return { body: `Hello, ${name}!` };
  },
});

app.http("CreateSAS", {
  methods: ["GET"],
  authLevel: "anonymous",
  handler: async (request, context) => {
    context.log(process.env.uri);
    
    return {
      body: `${createSharedAccessToken(
        process.env.uri,
        process.env.saName,
        process.env.saKey
      )}`,
    };
  },
});

function createSharedAccessToken(uri, saName, saKey) {
    try {
      if (!uri || !saName || !saKey) {
        throw "Missing required parameter";
      }
      var encoded = encodeURIComponent(uri);
      var now = new Date();
      var week = 60 * 60 * 24 * 7;
      var ttl = Math.round(now.getTime() / 1000) + week;
      var signature = encoded + "\n" + ttl;
      var hash = crypto
        .createHmac("sha256", saKey)
        .update(signature, "utf8")
        .digest("base64");
      return (
        "SharedAccessSignature sr=" +
        encoded +
        "&sig=" +
        encodeURIComponent(hash) +
        "&se=" +
        ttl +
        "&skn=" +
        saName
      );
    } catch (error) {
        console.log(error);
        
        throw error;

    }
}
