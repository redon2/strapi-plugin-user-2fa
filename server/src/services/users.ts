import type { Core } from '@strapi/strapi';
import { totp } from 'otplib';
import crypto from 'crypto';
import { PLUGIN_ID } from '../pluginId';

interface TOTPSettings {
  mfaExpiresSeconds: number;
}

const users = ({ strapi }: { strapi: Core.Strapi }) => ({
  /**
   * Generates an MFA code based on a shared secret.
   * @param {string} secret - The shared secret used for TOTP generation.
   * @returns {string} The generated MFA code (6-digit).
   */
  generateMfaCode(secret: string): string {
    const config = strapi.config.get(`plugin::${PLUGIN_ID}`) as TOTPSettings;
    totp.options = { step: config.mfaExpiresSeconds };

    if (typeof secret !== 'string' || secret.length === 0) {
      throw new Error('Invalid secret');
    }
    if (process.env.NODE_ENV === 'development') {
      return '12345'; // Static secret for development mode
    }
    return totp.generate(secret); // Generates the MFA code
  },

  /**
   * Generates a random secret for MFA.
   * @returns {string} The generated secret.
   */
  generateSecret(): string {
    return crypto.randomBytes(20).toString('base64'); // Generates a 20-byte secret
  },

  /**
   * Initializes MFA for the user by generating a new secret.
   * @param {string} userId - The user ID for which to initialize MFA.
   * @returns {string} The generated MFA code for the user.
   */
  async userMfaInit(userId: string): Promise<string> {
    const secret = this.generateSecret(); // Generate new secret for the user

    // clear any previous codes

    const previousMfa = await strapi
      .query(`plugin::${PLUGIN_ID}.mfa`)
      .findMany({ where: { userId: userId } });

    previousMfa.forEach(async (each) => {
      await strapi
        .query(`plugin::${PLUGIN_ID}.mfa`)
        .delete({ where: { documentId: each.documentId } });
    });

    // Store the new secret in the database
    const mfaEntry = await strapi
      .query(`plugin::${PLUGIN_ID}.mfa`)
      .create({ data: { userId: userId, secret: secret } });

    const otp = this.generateMfaCode(secret);
    return otp; // This is the code the user should input into their MFA app
  },

  /**
   * Validates the MFA OTP for a user.
   * @param {string} mfaOTP - The MFA code submitted by the user.
   * @param {string} userId - The user ID to validate the code for.
   * @returns {boolean} True if the code is valid, false otherwise.
   */
  async validateUserMfa(mfaOTP: string, userId: string): Promise<boolean> {
    const config = strapi.config.get(`plugin::${PLUGIN_ID}`) as TOTPSettings;
    totp.options = { step: config.mfaExpiresSeconds };

    const mfaEntry = await strapi.query(`plugin::${PLUGIN_ID}.mfa`).findOne({
      where: {
        userId: userId,
      },
    });
    if (mfaEntry?.id) {
      await strapi
        .query(`plugin::${PLUGIN_ID}.mfa`)
        .delete({ where: { documentId: mfaEntry.documentId } });

      const isValid =
        totp.check(mfaOTP, mfaEntry.secret) ||
        (process.env.NODE_ENV === 'development' && mfaOTP === '12345'); // Check if the code is valid

      return isValid; // Return true if valid, false otherwise
    }
    return false;
  },
  async mfaRegistrations(userId) {
    const registrations = await strapi.query(`plugin::${PLUGIN_ID}.mfa-registration`).findMany({
      where: {
        user: userId,
        enabled: true,
      },
    });
    return registrations;
  },
  async mfaRegistrationCreate(userId, type, enabled) {
    const registration = await strapi.query(`plugin::${PLUGIN_ID}.mfa-registration`).create({
      data: {
        user: userId,
        type: type,
        enabled: enabled,
      },
    });
    return registration;
  },
  async mfaRegistrationsDelete(userId) {
    const registration = await strapi.query(`plugin::${PLUGIN_ID}.mfa-registration`).delete({
      where: {
        user: userId,
      },
    });
    return registration;
  },
});

export default users;
