import type { Core } from '@strapi/strapi';
import { PLUGIN_ID } from '../pluginId';

interface MFAUpdateRequest {
  enabled: boolean;
}

const controller = ({ strapi }: { strapi: Core.Strapi }) => ({
  index(ctx) {
    ctx.body = strapi.plugin(PLUGIN_ID).service('service').getWelcomeMessage();
  },

  async myMFA(ctx) {
    try {
      const { auth } = ctx.state;
      const registrations = await strapi
        .documents(`plugin::${PLUGIN_ID}.mfa-registration`)
        .findMany({
          filters: { user: auth.credentials.id },
        });
      return (ctx.body = registrations);
    } catch (err) {
      console.error('Error:', err);
    }
  },
  async updateMyMFA(ctx) {
    try {
      const { auth } = ctx.state;
      const data = ctx.request.body.data as MFAUpdateRequest;
      const registrations = await strapi
        .documents(`plugin::${PLUGIN_ID}.mfa-registration`)
        .findMany({
          filters: { user: auth.credentials.id, documentId: ctx.params.id },
        });

      if (registrations.length > 0) {
        const response = await strapi.documents(`plugin::${PLUGIN_ID}.mfa-registration`).update({
          documentId: ctx.params.id,
          data: { enabled: data.enabled },
        });
        return (ctx.body = response);
      } else {
        ctx.throw(404, 'MFA registration not found');
      }
    } catch (err) {
      console.error('Error:', err);
    }
  },

  async userMfaStatus(ctx) {
    const registrations = await strapi.documents(`plugin::${PLUGIN_ID}.mfa-registration`).findMany({
      filters: { user: ctx.params.id },
      populate: ['user'],
    });

    const isEnabled = registrations.some((reg) => reg.enabled === true);

    ctx.body = {
      enabled: isEnabled ? true : false,
      registrations: registrations,
    };
  },
  async updateMfaRegistration(ctx) {
    const { data } = ctx.request.body;
    const registrations = await strapi
      .documents(`plugin::${PLUGIN_ID}.mfa-registration`)
      .update({ documentId: data.documentId, data: data });

    ctx.body = registrations;
  },
  async createMfaRegistration(ctx) {
    const { data } = ctx.request.body;
    // console.log(data);
    const registration = await strapi
      .documents(`plugin::${PLUGIN_ID}.mfa-registration`)
      .create({ data: data });
    await strapi.plugin(PLUGIN_ID).service('service').registerEmailMfa(data.value);

    ctx.body = registration;
  },
});

export default controller;
