const interpolateTemplate = (template: string, variables: Record<string, string>): string => {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => variables[key] || '');
};

export { interpolateTemplate };
