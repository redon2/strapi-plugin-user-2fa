export default {
  type: 'content-api',
  routes: [
    {
      method: 'GET',
      path: '/me',
      handler: 'controller.myMFA',
    },
    {
      method: 'PATCH',
      path: '/me/:id',
      handler: 'controller.updateMyMFA',
    },
  ],
};
