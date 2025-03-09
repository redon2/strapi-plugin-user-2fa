export default {
  default: {
    mfaTokenSecret: 'FakeSecret',
    mfaTokenExpiresIn: '11m',
    mfaExpiresSeconds: 600,  // 600 seconds = 10 minutes
    notifications: {
      email: {
        fromAddress: 'email@local.com',
        fromName: 'Local Strapi',
        replyTo: 'reply@local.com',
      }
    }
  },
  validator() {},
};
