import contentApi from './content-api';

// export default {
//   'content-api': contentApi,
// };
export default [
  {
    method: 'GET',
    path: '/hello',
    handler: 'controller.index',
    config: {
      policies: [],
    },
  },
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
];
