// import { authenticator } from 'otplib';
import * as OTPAuth from 'otpauth';

const { OTP_SECRET } = process.env;

const totp = new OTPAuth.TOTP({
  issuer: 'pma',
  label: 'pma',
  algorithm: 'SHA1',
  digits: 4,
  period: 120,
  secret: OTP_SECRET,
});
export const generateOtp = () => {
  const token = totp.generate();
  return token;
};

const emailOtp = new OTPAuth.TOTP({
  issuer: 'pma',
  label: 'pma',
  algorithm: 'SHA1',
  digits: 4,
  period: 120,
  secret: OTP_SECRET,
});
export const EmailVerificationToken = () => {
  const token = emailOtp.generate();
  return token;
};
