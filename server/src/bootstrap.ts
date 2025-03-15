import type { Core } from '@strapi/strapi';
import { PLUGIN_ID } from './pluginId';

const bootstrap = ({ strapi }: { strapi: Core.Strapi }) => {
  const config = strapi.config.get(`plugin::${PLUGIN_ID}`) as { forceMFA: boolean };
  // bootstrap phase for user lifecycle events
  strapi.db.lifecycles.subscribe({
    models: ['plugin::users-permissions.user'],

    async afterCreate(ctx) {
      const user = ctx.result;
      await strapi
        .plugin(PLUGIN_ID)
        .service('users')
        .mfaRegistrationCreate(user.id, 'email', config.forceMFA === true ? true : false);
    },

    async beforeDelete(ctx) {
      await strapi.plugin(PLUGIN_ID).service('users').mfaRegistrationsDelete(ctx.params.where.id);
    },
  });
};

export default bootstrap;
