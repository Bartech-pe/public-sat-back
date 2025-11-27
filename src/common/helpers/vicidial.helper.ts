export const buildQueryCID = (user: string, prefix: string, sufix?: string) => {
  const random = sufix ?? Math.random().toString(36).substring(2, 6); // 4 chars aleatorios
  const epoch = Math.floor(Date.now() / 1000);
  return `${prefix}${random}${epoch}${user.repeat(4)}`;
};

export const buildQueryCIDSurvey = (leadId: string) => {
  const epoch = Math.floor(Date.now() / 1000);
  return `DC${epoch}W0000000${leadId}W`;
};
