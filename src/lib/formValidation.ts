/**
 * Form Validation Utilities for VipraKarma Platform
 * Centralized validation functions for consistent form handling
 */

export interface ValidationResult {
    isValid: boolean;
    error?: string;
}

/**
 * Validate date of birth
 * @param date - Date string in YYYY-MM-DD format
 * @returns Validation result
 */
export function validateDateOfBirth(date: string): ValidationResult {
    if (!date) {
        return { isValid: false, error: "Date of birth is required" };
    }

    const birthDate = new Date(date);
    const minDate = new Date('1900-01-01');
    const maxDate = new Date();

    if (birthDate < minDate) {
        return { isValid: false, error: "Date of birth cannot be before 1900" };
    }

    if (birthDate > maxDate) {
        return { isValid: false, error: "Date of birth cannot be in the future" };
    }

    return { isValid: true };
}

/**
 * Validate time of birth
 * @param time - Time string in HH:MM format
 * @returns Validation result
 */
export function validateTimeOfBirth(time: string): ValidationResult {
    if (!time) {
        return { isValid: false, error: "Time of birth is required" };
    }

    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;

    if (!timeRegex.test(time)) {
        return { isValid: false, error: "Invalid time format. Use HH:MM (00:00 - 23:59)" };
    }

    return { isValid: true };
}

/**
 * Validate phone number with default +91 country code
 * @param phone - Phone number string
 * @returns Validation result
 */
export function validatePhoneNumber(phone: string): ValidationResult {
    if (!phone) {
        return { isValid: false, error: "Phone number is required" };
    }

    // Remove spaces and dashes
    const cleanPhone = phone.replace(/[\s-]/g, '');

    // Check if it starts with +91 or just the 10-digit number
    const phoneRegex = /^(\+91)?[6-9]\d{9}$/;

    if (!phoneRegex.test(cleanPhone)) {
        return { isValid: false, error: "Invalid phone number. Must be 10 digits starting with 6-9" };
    }

    return { isValid: true };
}

/**
 * Format phone number with +91 prefix if not present
 * @param phone - Phone number string
 * @returns Formatted phone number
 */
export function formatPhoneNumber(phone: string): string {
    const cleanPhone = phone.replace(/[\s-]/g, '');

    if (cleanPhone.startsWith('+91')) {
        return cleanPhone;
    }

    if (cleanPhone.startsWith('91') && cleanPhone.length === 12) {
        return `+${cleanPhone}`;
    }

    return `+91${cleanPhone}`;
}

/**
 * Validate latitude coordinate
 * @param lat - Latitude value
 * @returns Validation result
 */
export function validateLatitude(lat: number | string): ValidationResult {
    const latitude = typeof lat === 'string' ? parseFloat(lat) : lat;

    if (isNaN(latitude)) {
        return { isValid: false, error: "Latitude must be a valid number" };
    }

    if (latitude < -90 || latitude > 90) {
        return { isValid: false, error: "Latitude must be between -90 and 90" };
    }

    return { isValid: true };
}

/**
 * Validate longitude coordinate
 * @param lon - Longitude value
 * @returns Validation result
 */
export function validateLongitude(lon: number | string): ValidationResult {
    const longitude = typeof lon === 'string' ? parseFloat(lon) : lon;

    if (isNaN(longitude)) {
        return { isValid: false, error: "Longitude must be a valid number" };
    }

    if (longitude < -180 || longitude > 180) {
        return { isValid: false, error: "Longitude must be between -180 and 180" };
    }

    return { isValid: true };
}

/**
 * Validate coordinates (both latitude and longitude)
 * @param lat - Latitude value
 * @param lon - Longitude value
 * @returns Validation result
 */
export function validateCoordinates(lat: number | string, lon: number | string): ValidationResult {
    const latResult = validateLatitude(lat);
    if (!latResult.isValid) {
        return latResult;
    }

    const lonResult = validateLongitude(lon);
    if (!lonResult.isValid) {
        return lonResult;
    }

    return { isValid: true };
}

/**
 * Validate email address
 * @param email - Email string
 * @returns Validation result
 */
export function validateEmail(email: string): ValidationResult {
    if (!email) {
        return { isValid: false, error: "Email is required" };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
        return { isValid: false, error: "Invalid email address" };
    }

    return { isValid: true };
}

/**
 * Validate name (minimum 2 characters, only letters and spaces)
 * @param name - Name string
 * @returns Validation result
 */
export function validateName(name: string): ValidationResult {
    if (!name || name.trim().length < 2) {
        return { isValid: false, error: "Name must be at least 2 characters long" };
    }

    const nameRegex = /^[a-zA-Z\s]+$/;

    if (!nameRegex.test(name)) {
        return { isValid: false, error: "Name can only contain letters and spaces" };
    }

    return { isValid: true };
}

/**
 * Get min and max dates for date input
 * @returns Object with min and max dates in YYYY-MM-DD format
 */
export function getDateLimits() {
    const minDate = '1900-01-01';
    const maxDate = new Date().toISOString().split('T')[0];

    return { minDate, maxDate };
}
