
async function isTokenValid(date) {
  if (!date) {
    return false;
  }

  const oneMinute = 60 * 1000;

  return Date.now() < (date - oneMinute);
}
export default isTokenValid
