export const formatPhoneNumber = (phoneNumber: string): string => {
  if (!phoneNumber) return phoneNumber;
  const cleanNumber = phoneNumber.replace(/\D/g, '');
  return cleanNumber.replace(/(\d{3})/g, '$1-').replace(/-$/, '');
};

export const stripPeruCode = (phoneNumber: string): string => {
  if (!phoneNumber) return phoneNumber;
  // quitar espacios, guiones, paréntesis
  const onlyDigits = phoneNumber.replace(/[^\d]/g, '');
  // capturar móvil peruano: opcional +/00 + 51, y después 9 dígitos que comienzan con 9
  const m = onlyDigits.match(/^(?:\+?51|0051)?(9\d{8})$/);
  return m ? m[1] : onlyDigits; // si no coincide deja lo que había (o podrías retornar null)
};
