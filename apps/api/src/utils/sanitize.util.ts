import sanitizeHtml from "sanitize-html";

const sanitizeStringValue = (value: string): string => {
  return sanitizeHtml(value, {
    allowedAttributes: {},
    allowedTags: [],
  }).trim();
};

export const sanitizeValue = <T>(value: T): T => {
  if (typeof value === "string") {
    return sanitizeStringValue(value) as T;
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeValue(item)) as T;
  }

  if (value && typeof value === "object") {
    const sanitizedObject = Object.entries(value as Record<string, unknown>).reduce<
      Record<string, unknown>
    >((accumulator, [key, nestedValue]) => {
      accumulator[key] = sanitizeValue(nestedValue);
      return accumulator;
    }, {});

    return sanitizedObject as T;
  }

  return value;
};
