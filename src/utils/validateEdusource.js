export const validateEdusource = (body) => {
  const { language, discipline, range } = body;

  const langsSupported = ['es', 'de', 'it', 'en', 'fr', 'pt', 'other']
  const [minRangeSupported, maxRangeSupported] = [0, 18]
  const disciplinesSupported = ['artes', 'tics', 'lengua', 'matematicas', 'ciencias-naturales', 'ciencias-sociales', 'salud', 'psicopedagogia', 'otras'];

  // establecer filtro
  let response = {}

  if (language) {
    response.language = false;
    if (langsSupported.includes(language.toLowerCase())) response.language = true;
  }

  if (discipline) {
    response.discipline = false;
    if (disciplinesSupported.includes(discipline.toLowerCase())) response.discipline = true;
  }

  if (range) {
    response.range = false;
    let validArray = [false, false, false];
    for (let i = 0; i < validArray.length; i++) {
      if (minRangeSupported <= range[i] <= maxRangeSupported) {
        validArray[i] = true;
      }
    }
    if (validArray.every(e => e === true)) response.range = true;
  }

  for (let key in response) {
    if (!response[key]) return false
  }
  return true
}