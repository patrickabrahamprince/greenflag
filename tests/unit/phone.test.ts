import { describe, it, expect } from 'vitest';
import { isValidPhoneNumber, parsePhoneNumber, getCountryCallingCode } from 'libphonenumber-js';

describe('Phone number validation', () => {
  it('should validate Indian phone number in E.164', () => {
    expect(isValidPhoneNumber('+919876543210')).toBe(true);
  });

  it('should validate US phone number', () => {
    expect(isValidPhoneNumber('+12025551234')).toBe(true);
  });

  it('should reject invalid phone number', () => {
    expect(isValidPhoneNumber('+91123')).toBe(false);
  });

  it('should parse Indian number correctly', () => {
    const parsed = parsePhoneNumber('+919876543210');
    expect(parsed?.country).toBe('IN');
    expect(parsed?.nationalNumber).toBe('9876543210');
  });

  it('should get country calling code for IN', () => {
    expect(getCountryCallingCode('IN')).toBe('91');
  });

  it('should get country calling code for US', () => {
    expect(getCountryCallingCode('US')).toBe('1');
  });

  it('should get country calling code for GB', () => {
    expect(getCountryCallingCode('GB')).toBe('44');
  });

  it('should get country calling code for UAE', () => {
    expect(getCountryCallingCode('AE')).toBe('971');
  });

  it('should format E.164 number correctly', () => {
    const parsed = parsePhoneNumber('+919876543210');
    expect(parsed?.format('E.164')).toBe('+919876543210');
  });

  it('should detect invalid short number', () => {
    expect(isValidPhoneNumber('+9112')).toBe(false);
  });
});
