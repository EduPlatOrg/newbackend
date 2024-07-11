export const validateEdusource = (body) => {
  const langsSupported = ['es', 'de', 'it', 'en', 'fr', 'pt', 'other']
  const disciplinesSupported = ['artes', 'tics', 'lengua', 'matematicas', 'ciencias-naturales', 'ciencias-sociales', 'salud', 'psicopedagogia', 'otras'];
  const levelsSupported = ['basico', 'intermedio', 'avanzado']
  const range = [ 0, 18 ]

  const { language, level, discipline } = body;
  
  // establecer filtro
  let response = {}
  language ? response.language = false : ''
  level ? response.level = false : ''
  discipline ? response.discipline = false : ''

  if (language && langsSupported.includes(language.toLowerCase())) response.language = true;
  if (level && levelsSupported.includes(level.toLowerCase())) response.level = true;
  if (discipline && disciplinesSupported.includes(discipline.toLowerCase())) response.discipline = true;

  for (let key in response) {
    if (!response[key]) return false
  }
  return true
}