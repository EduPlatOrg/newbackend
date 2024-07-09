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