// utils/brevo.js
const SibApiV3Sdk = require("sib-api-v3-sdk");

const client = SibApiV3Sdk.ApiClient.instance;
const apiKey = client.authentications["api-key"];
apiKey.apiKey = process.env.BREVO_API_KEY; // keep this in .env

const transactionalEmailsApi = new SibApiV3Sdk.TransactionalEmailsApi();

module.exports = transactionalEmailsApi;
