const {
  VALID_STATUSES,
  VALID_PRIORITIES,
  VALID_PHASES,
  MAX_CLIENT_NAME_LENGTH,
  MAX_NOTES_LENGTH,
} = require('../constants');

function validateProjectInput(data) {
  const errors = [];
  if (data.clientName !== undefined && typeof data.clientName === 'string' && data.clientName.length > MAX_CLIENT_NAME_LENGTH) {
    errors.push(`clientName deve avere max ${MAX_CLIENT_NAME_LENGTH} caratteri`);
  }
  if (data.phase && !VALID_PHASES.includes(data.phase)) {
    errors.push(`phase non valida: ${data.phase}`);
  }
  if (data.notes !== undefined && typeof data.notes === 'string' && data.notes.length > MAX_NOTES_LENGTH) {
    errors.push(`notes troppo lunghe (max ${MAX_NOTES_LENGTH})`);
  }
  return errors;
}

function validateEvaluationInput(data) {
  const errors = [];
  if (data.status && !VALID_STATUSES.includes(data.status)) {
    errors.push(`status non valido: ${data.status}`);
  }
  if (data.priority && !VALID_PRIORITIES.includes(data.priority)) {
    errors.push(`priority non valida: ${data.priority}`);
  }
  if (data.notes !== undefined && typeof data.notes === 'string' && data.notes.length > MAX_NOTES_LENGTH) {
    errors.push(`notes troppo lunghe (max ${MAX_NOTES_LENGTH})`);
  }
  return errors;
}

module.exports = { validateProjectInput, validateEvaluationInput };
