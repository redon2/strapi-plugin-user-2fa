import type { Core } from '@strapi/strapi';
const _ = require('lodash');
import { PLUGIN_ID } from '../pluginId';

interface NotifSettings {
  notifications: {
    email: {
      fromAddress: string;
      fromName: string;
      replyTo: string;
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
          console.log('sending email');
          // email 2fa
          const emailToSend = {
            to: user.email,
            from:
              config.notifications.email.fromAddress || config.notifications.email.fromName
                ? `${config.notifications.email.fromName} <${config.notifications.email.fromAddress}>`
                : undefined,
            replyTo: config.notifications.email.replyTo,
            subject: 'Subject',
            text: 'Body',
            html: 'emailBody ' + payload,
          };
          console.log(emailToSend);
          await strapi.plugin('email').service('email').send(emailToSend);
          break;
        default:
          console.log(`${registration.type} not supported`);
      }
    });
  },
});

export default service;
