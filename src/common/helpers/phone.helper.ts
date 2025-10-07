export const formatPhoneNumber = (phoneNumber: string): string => {
  if (!phoneNumber) return phoneNumber;
  const cleanNumber = phoneNumber.replace(/\D/g, '');
  return cleanNumber.replace(/(\d{3})/g, '$1-').replace(/-$/, '');
};
