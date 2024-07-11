import mongoose from 'mongoose';

export const queryFormatter = (req) => {
    const allowedFilters = [ 'title', 'discipline', 'description', 'autor', 'valorations', 'language', 'level', 'text']

    let search = {}
    const query = req.query;
    const keys = Object.keys(query)

    keys.forEach((key) => {
        if (allowedFilters.includes(key)) {

            // TODO: validar que si viene el key pero está vacío o undefined no haga filtro o null

            // TODO: filtrar por range en lugar de level

            // TODO: quitar busqueda por valoración y meter orden de valoracion por defecto


            switch (key) {

                case 'valorations':
                    search['valorationsAverage.average'] = { $gte: +`${query[key]}` }
                    break;

                case 'autor':
                    search['autor.autorName'] = { $regex: query[key], $options: 'i' }
                    break

                case 'text':
                    search = { $text: { $search: query[key] } }
                    break

                default:
                    search[key] = { $regex: query[key], $options: 'i' }
                    break;
            }
        }
    }
    )
    return search
}