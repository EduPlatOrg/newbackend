export const validateEdusource = (body) => {
    const langsSupported = ['es', 'de', 'it', 'en', 'fr', 'pt', 'other']
    const levelsSupported = ['1', '2', '3', '4', '5']

    // TODO: tenemos que definir los niveles que habrá, para ajustar bien los filtros
    
    const disciplinesSupported = [];
    const subDisciplinesSupported = [];
    const licencesSupported = [];

    const { language, level, discipline, subDicipline, licence } = body;
    let response = {}

    // console.log({ language, level, discipline, subDicipline, licence })

    if (language && langsSupported.includes(language.toLowerCase())) response.language = true;

    if (level && levelsSupported.includes(level.toLowerCase())) response.level = true;

    for (let key in response) {
        if (!response[key]) return false
    }
    return true
}




{/* <select
              {...register('discipline', { required: true })}
              id='discipline'
              name='discipline'
              required
              className='block w-full rounded-md border-0 py-1.5
               text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300
               focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 p-2'>
              <option value=''>Selecciona una disciplina</option>
              <option value='artes'>Artes</option>
              <option value='tics'>
                Informatica Tecnologia (TICS TEPS TRICS)
              </option>
              <option value='lengua'>Lenguas (Idiomas-Literatura)</option>
              <option value='matematicas'>Matemáticas</option>
              <option value='ciencias-naturales'>Ciencias Naturales</option>
              <option value='ciencias-sociales'>Ciencias Sociales</option>
              <option value='salud'>
                Salud–NB Educación Física. Educación mental
              </option>
              <option value='psicopedagogia'>Psicopedagogía</option>
              <option value='otras'>Otras Categorías</option>
            </select> */}