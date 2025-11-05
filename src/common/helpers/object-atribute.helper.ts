export function cleanAttributes(obj) {
  const resultado = {};

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      resultado[key] = value.trim();
    } else {
      resultado[key] = value;
    }
  }

  return resultado;
}
