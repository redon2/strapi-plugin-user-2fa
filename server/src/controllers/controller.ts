import type { Core } from '@strapi/strapi';
import { PLUGIN_ID } from '../pluginId';

const controller = ({ strapi }: { strapi: Core.Strapi }) => ({
  index(ctx) {
    ctx.body = strapi.plugin(PLUGIN_ID).service('service').getWelcomeMessage();
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
    console.log(data);
    const registration = await strapi
      .documents(`plugin::${PLUGIN_ID}.mfa-registration`)
      .create({ data: data });

    ctx.body = registration;
  },
});

export default controller;
