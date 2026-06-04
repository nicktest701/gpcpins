// workers/session.worker.js

const { loadAuthState } = require("../services/whatsapp/whatsapp.auth");
const { WhatsAppService } = require("../services/whatsapp/whatsapp.service");

const whatsappService = new WhatsAppService();

module.exports = async function jobHandler(job) {
  if (job.name === "START_SESSION") {
    const { sessionId } = job.data;

    const authState = await loadAuthState(sessionId);

    await whatsappService.create(sessionId, authState);
  }
};
