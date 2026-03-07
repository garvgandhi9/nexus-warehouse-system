import { useState, useCallback } from "react";

export interface ValidationRules {
    required?: boolean;
    pattern?: RegExp;
    minLength?: number;
    maxLength?: number;
    isEmail?: boolean;
    isPhone?: boolean; // 10 digits
    isNumeric?: boolean;
}

export const useFormValidation = <T extends Record<string, any>>(
    initialValues: T,
    rules: Partial<Record<keyof T, ValidationRules>>
) => {
    const [values, setValues] = useState<T>(initialValues);
    const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
    const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});

    const validateField = useCallback((name: keyof T, value: any) => {
        const fieldRules = rules[name];
        if (!fieldRules) return "";

        const stringValue = String(value || "").trim();

        if (fieldRules.required && !stringValue) {
            return "Required";
        }

        if (fieldRules.isPhone) {
            if (stringValue.length > 0 && (stringValue.length !== 10 || !/^\d+$/.test(stringValue))) {
                return "Please enter a valid 10-digit mobile number";
            }
        }

        if (fieldRules.isEmail) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (stringValue.length > 0 && !emailRegex.test(stringValue)) {
                return "Please enter a valid email address";
            }
        }

        if (fieldRules.pattern && stringValue.length > 0 && !fieldRules.pattern.test(stringValue)) {
            return "Invalid format";
        }

        if (fieldRules.minLength && stringValue.length > 0 && stringValue.length < fieldRules.minLength) {
            return `Minimum ${fieldRules.minLength} characters required`;
        }

        if (fieldRules.maxLength && stringValue.length > fieldRules.maxLength) {
            return `Maximum ${fieldRules.maxLength} characters allowed`;
        }

        return "";
    }, [rules]);

    const handleChange = useCallback((
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        const fieldName = name as keyof T;
        const fieldRules = rules[fieldName];

        // Strict Phone Input: Prevent typing non-digits or more than 10 chars
        if (fieldRules?.isPhone) {
            if (!/^\d*$/.test(value) || value.length > 10) {
                return;
            }
        }

        setValues(prev => ({ ...prev, [fieldName]: value }));
        setTouched(prev => ({ ...prev, [fieldName]: true }));

        const error = validateField(fieldName, value);
        setErrors(prev => ({ ...prev, [fieldName]: error }));
    }, [rules, validateField]);

    const getInputStyles = useCallback((name: keyof T) => {
        const base = "w-full transition-all duration-200 focus:outline-none ";
        if (!touched[name]) return base + "border-border focus:border-primary";
        if (errors[name]) return base + "border-red-500 focus:border-red-500 bg-red-500/5";
        if (values[name]) return base + "border-emerald-500 focus:border-emerald-500 bg-emerald-500/5";
        return base + "border-border focus:border-primary";
    }, [touched, errors, values]);

    const isValid = useCallback(() => {
        const hasMissingRequired = Object.keys(rules).some(key => {
            const fieldRules = rules[key as keyof T];
            return fieldRules?.required && !values[key as keyof T];
        });

        const hasErrors = Object.values(errors).some(error => error !== "");

        return !hasMissingRequired && !hasErrors;
    }, [rules, values, errors]);

    return {
        values,
        setValues,
        errors,
        touched,
        handleChange,
        getInputStyles,
        isValid,
        setTouched,
        setErrors
    };
};
