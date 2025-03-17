import type { Core } from '@strapi/strapi';
import { PLUGIN_ID } from './pluginId';

const bootstrap = async ({ strapi }: { strapi: Core.Strapi }) => {
  const config = strapi.config.get(`plugin::${PLUGIN_ID}`) as { forceMFA: boolean };

  // Subscribe to user lifecycle events
  strapi.db.lifecycles.subscribe({
    models: ['plugin::users-permissions.user'],

    async afterCreate(ctx) {
      const user = ctx.result;
      await strapi
        .plugin(PLUGIN_ID)
        .service('users')
        .mfaRegistrationCreate(user.id, 'email', config.forceMFA === true);
    },

    async beforeDelete(ctx) {
      await strapi.plugin(PLUGIN_ID).service('users').mfaRegistrationsDelete(ctx.params.where.id);
    },
  });
  // Add Authenticated access to /me routes
  const role = await strapi.db.query('plugin::users-permissions.role').findOne({
    where: { type: 'authenticated' },
  });

  if (!role) {
    strapi.log.warn(`⚠️ Could not find authenticated role`);
    return;
  }

  // Get existing permissions for this role
  const existingPermission = await strapi.db.query('plugin::users-permissions.permission').findOne({
    where: {
      action: `plugin::${PLUGIN_ID}.controller.myMFA`,
      role: role.id,
    },
  });

  // If the permission doesn't exist, create it
  if (!existingPermission) {
    await strapi.db.query('plugin::users-permissions.permission').create({
      data: {
        action: `plugin::${PLUGIN_ID}.controller.myMFA`,
        role: role.id,
        enabled: true,
      },
    });

    strapi.log.info(`✅ Auto-assigned permissions for ${PLUGIN_ID}`);
  } else {
    strapi.log.info(`🔍 Permissions for ${PLUGIN_ID} route already exist, skipping`);
  }
  // Create Basic Email templates

  // Define custom email templates
  const existingTemplates = await strapi
    .store({ type: 'plugin', name: 'users-permissions', key: 'email' })
    .get({});
  // console.log(existingTemplates['reset_password']);
  const customTemplates = [
    {
      name: 'mfa_otp_notification',
      subject: 'Your MFA Verification Code',
      text: `Hello {{username}},\n\nYour MFA verification code is: {{code}}\n\nIf you did not request this, please ignore this email.`,
      html: `<p>Hello {{username}},</p><p>Your MFA verification code is: <strong>{{code}}</strong></p><p>If you did not request this, please ignore this email.</p>`,
    },
    {
      name: 'mfa_enabled_notification',
      subject: 'MFA Enabled on Your Account',
      text: `Hello {{username}},\n\nMulti-factor authentication (MFA) has been enabled on your account.`,
      html: `<p>Hello {{username}},</p><p>Multi-factor authentication (MFA) has been <strong>enabled</strong> on your account.</p>`,
    },
  ];

  // Ensure `existingTemplates` is an object
  const updatedTemplates = existingTemplates || {};

  // Loop through each custom template
  for (const newTemplate of customTemplates) {
    if (!updatedTemplates[newTemplate.name]) {
      // Template does not exist, create it
      updatedTemplates[newTemplate.name] = {
        display: `Email.template.${newTemplate.name}`,
        icon: 'envelope', // Optional: Icon for UI
        options: {
          from: { name: 'Administration Panel', email: 'no-reply@strapi.io' },
          response_email: '',
          object: newTemplate.subject,
          message: newTemplate.text,
          message_html: newTemplate.html,
        },
      };

      strapi.log.info(`✅ Created email template: ${newTemplate.name}`);
    }
  }
  await strapi
    .store({ type: 'plugin', name: 'users-permissions', key: 'email' })
    .set({ value: updatedTemplates });

  strapi.log.info(`✅ Email templates have been updated successfully.`);
};

export default bootstrap;
