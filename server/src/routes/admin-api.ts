export default {
  type: 'admin',
  routes: [
    {
      method: 'GET',
      path: '/user-mfa-status/:id',
      handler: 'controller.userMfaStatus',
      config: {
        policies: [],
      },
    },
    {
      method: 'PUT',
      path: '/user-mfa-registration/:id',
      handler: 'controller.updateMfaRegistration',
      config: {
        policies: [],
      },
    },
    {
      method: 'POST',
      path: '/user-mfa-activate/:id',
      handler: 'controller.createMfaRegistration',
      config: {
        policies: [],
      },
    },
  ],
};
