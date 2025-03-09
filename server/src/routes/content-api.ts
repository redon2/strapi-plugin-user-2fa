export default {
    type: 'content-api',
    routes: [
      {
        method: 'GET',
        path: '/hello',
        handler: 'controller.index',
      },
    ],
  };