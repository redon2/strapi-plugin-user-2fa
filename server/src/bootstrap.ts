import type { Core } from '@strapi/strapi';

const bootstrap = ({ strapi }: { strapi: Core.Strapi }) => {
  console.log('++++BOOTING');
  // bootstrap phase
};

export default bootstrap;
