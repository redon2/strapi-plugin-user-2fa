import type { Core } from '@strapi/strapi';
import { interpolateTemplate } from '../utils';

const service = ({ strapi }: { strapi: Core.Strapi }) => ({
  getWelcomeMessage() {
    return 'Welcome to Strapi 🚀';
  },
  async notify2fa(user, payload, mfaRegistrations) {
    mfaRegistrations.forEach(async (registration) => {
      switch (registration.type) {
        case 'email':
          const emailTemplates = await strapi
            .store({ type: 'plugin', name: 'users-permissions', key: 'email' })
            .get();
          const templateOptions = emailTemplates['mfa_otp_notification'].options;
          if (!templateOptions) {
            throw new Error("Template 'mfa_otp_notification' not found");
          }
          const values = {
            username: user.username,
            code: payload,
          };
          const emailToSend = {
            to: registration.value || user.email, // fallback
            from:
              templateOptions.from.email && templateOptions.from.name
                ? `${templateOptions.from.name} <${templateOptions.from.email}>`
                : undefined,
            replyTo: templateOptions.response_email || '',
            subject: templateOptions.object || 'MFA Email',
            text: interpolateTemplate(templateOptions.message, values),
            html: interpolateTemplate(templateOptions.message_html, values),
          };
          await strapi.plugin('email').service('email').send(emailToSend);
          break;
        default:
          console.log(`${registration.type} not supported`);
      }
    });
  },
  async notifyEmailMFAChange(registration) {
    // Currently triggered on Create only.
    const emailTemplates = await strapi
      .store({ type: 'plugin', name: 'users-permissions', key: 'email' })
      .get();
    const templateOptions = emailTemplates['mfa_enabled_notification'].options;
    if (!templateOptions) {
      throw new Error("Template 'mfa_enabled_notification' not found");
    }
    const values = {
      username: registration.user.username,
    };
    const emailToSend = {
      to: registration.value || registration.user.email, // fallback
      from:
        templateOptions.from.email && templateOptions.from.name
          ? `${templateOptions.from.name} <${templateOptions.from.email}>`
          : undefined,
      replyTo: templateOptions.response_email || '',
      subject: templateOptions.object || 'MFA Email',
      text: interpolateTemplate(templateOptions.message, values),
      html: interpolateTemplate(templateOptions.message_html, values),
    };
    await strapi.plugin('email').service('email').send(emailToSend);
  },
});

export default service;
