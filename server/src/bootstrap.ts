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
};

export default bootstrap;
