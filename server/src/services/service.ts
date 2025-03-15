import type { Core } from '@strapi/strapi';
const _ = require('lodash');
import { PLUGIN_ID } from '../pluginId';

interface NotifSettings {
  notifications: {
    email: {
      fromAddress: string;
      fromName: string;
      replyTo: string;
      subject: string;
    };
  };
}

const service = ({ strapi }: { strapi: Core.Strapi }) => ({
  getWelcomeMessage() {
    return 'Welcome to Strapi 🚀';
  },
  async notify2fa(user, payload, mfaRegistrations) {
    const config = strapi.config.get(`plugin::${PLUGIN_ID}`) as NotifSettings;
    mfaRegistrations.forEach(async (registration) => {
      switch (registration.type) {
        case 'email':
          // console.log('sending email', registration);
          // email 2fa
          const body = `Use the following one-time password (OTP) to sign in to your account. ${payload}`;
          const emailToSend = {
            to: registration.value || user.email, // fallback
            from:
              config.notifications.email.fromAddress || config.notifications.email.fromName
                ? `${config.notifications.email.fromName} <${config.notifications.email.fromAddress}>`
                : undefined,
            replyTo: config.notifications.email.replyTo,
            subject: config.notifications.email.subject,
            text: body,
            html: body,
          };
          // console.log(emailToSend);
          await strapi.plugin('email').service('email').send(emailToSend);
          break;
        default:
          console.log(`${registration.type} not supported`);
      }
    });
  },
  async registerEmailMfa(email) {
    const config = strapi.config.get(`plugin::${PLUGIN_ID}`) as NotifSettings;
    const body = `Hello, your account is now protected. You will be required to use 2FA when signing into your account.`;
    const emailToSend = {
      to: email, // fallback
      from:
        config.notifications.email.fromAddress || config.notifications.email.fromName
          ? `${config.notifications.email.fromName} <${config.notifications.email.fromAddress}>`
          : undefined,
      replyTo: config.notifications.email.replyTo,
      subject: 'Your account is now protected',
      text: body,
      html: body,
    };
    // console.log(emailToSend);
    await strapi.plugin('email').service('email').send(emailToSend);
  },
});

export default service;
