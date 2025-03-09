import type { Core } from '@strapi/strapi';
import middleware from './middlewares';

const register = ({ strapi }: { strapi: Core.Strapi }) => {
  strapi.server.use(middleware.mfa({ strapi }));
};

export default register;
