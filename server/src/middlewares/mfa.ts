import jwt from 'jsonwebtoken';
import { PLUGIN_ID } from '../pluginId';

interface JwtPayload {
  userId: number;
}

const sanitizeUser = (user, ctx) => {
  const { auth } = ctx.state;
  const userSchema = strapi.getModel('plugin::users-permissions.user');

  return strapi.contentAPI.sanitize.output(user, userSchema, { auth });
};

function mfa({ strapi }) {
  const config = strapi.config.get(`plugin::${PLUGIN_ID}`);

  return async (ctx, next) => {
    await next();

    if (
      ctx.request.method === 'POST' &&
      ctx.request.path === '/api/auth/local' &&
      ctx.response.status === 200
    ) {
      // Check if User has MFA enabled
      const mfaRegistrations = await strapi
        .plugin(PLUGIN_ID)
        .service('users')
        .mfaRegistrations(ctx.response.body.user.id);
      if (mfaRegistrations.length > 0) {
        const mfa = await strapi
          .plugin(PLUGIN_ID)
          .service('users')
          .userMfaInit(ctx.response.body.user.id);

        // call service to send notification
        await strapi.plugin(PLUGIN_ID).service('service').notify2fa(ctx.response.body.user, mfa, mfaRegistrations);

        const mfaToken = jwt.sign({ userId: ctx.response.body?.user?.id }, config.mfaTokenSecret, {
          expiresIn: config.mfaTokenExpiresIn,
        });
        ctx.response.body = {
          mfaToken: mfaToken,
        };
      }

    }
    if (ctx.request.method === 'POST' && ctx.request.path === '/api/auth/local/2fa') {
      const mfaToken = ctx.request.body?.mfaToken;
      const mfaOTP = ctx.request.body?.mfaOTP;
      if (mfaToken && mfaOTP) {
        try {
          const decoded = (await jwt.verify(mfaToken, config.mfaTokenSecret)) as JwtPayload;
          //   console.log(decoded); // tempMFAToken is valid
          const isMfaValid = await strapi
            .plugin(PLUGIN_ID)
            .service('users')
            .validateUserMfa(mfaOTP, decoded.userId);
          console.log('Valid', isMfaValid);
          if (isMfaValid) {
            const user = await strapi.db
              .query('plugin::users-permissions.user')
              .findOne(decoded.userId);
            ctx.send({
              jwt: strapi.plugin('users-permissions').service('jwt').issue({ id: decoded.userId }),
              user: await sanitizeUser(user, ctx),
            });
          }
        } catch (err) {
          console.log(err);
          ctx.status = 401;
          ctx.response.body = { error: 'Invalid Token' };
        }
      }
    }
  };
}
export default mfa;
