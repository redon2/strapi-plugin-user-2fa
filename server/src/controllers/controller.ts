import type { Core } from '@strapi/strapi';
import { PLUGIN_ID } from '../pluginId';

interface MFAUpdateRequest {
  enabled: boolean;
  documentId?: string; // Optional in some cases
}

interface MFARegistration {
  id?: string;
  user: string; // Assuming this links to the User
  enabled: boolean;
  value?: string; // Optional field for other MFA data
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
      const data = ctx.request.body?.data as MFAUpdateRequest;

      // Validate request data
      if (!data || typeof data.enabled !== 'boolean') {
        ctx.throw(400, "Invalid request: 'enabled' must be a boolean");
      }

      const registrations = await strapi
        .documents(`plugin::${PLUGIN_ID}.mfa-registration`)
        .findMany({
          filters: { user: auth.credentials.id, documentId: ctx.params.id },
        });

      if (registrations.length === 0) {
        ctx.throw(404, 'MFA registration not found');
      }

      const response = await strapi.documents(`plugin::${PLUGIN_ID}.mfa-registration`).update({
        documentId: ctx.params.id,
        data: data as Partial<MFARegistration>,
      });

      ctx.body = response;
    } catch (err) {
      console.error('Error:', err);
      ctx.throw(500, 'Failed to update MFA');
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
    const registration = await strapi
      .documents(`plugin::${PLUGIN_ID}.mfa-registration`)
      .create({ data: data, populate: ['user'] });
    await strapi.plugin(PLUGIN_ID).service('service').notifyEmailMFAChange(registration);

    ctx.body = registration;
  },
});

export default controller;
