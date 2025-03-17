export default {
  default: {
    mfaTokenSecret: 'FakeSecret',
    mfaTokenExpiresIn: '11m',
    mfaExpiresSeconds: 600, // 600 seconds = 10 minutes
    forceMFA: false, // global setting to force MFA for all users
  },
  validator() {},
};
