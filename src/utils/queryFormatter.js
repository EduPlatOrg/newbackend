// TODO: añadir busqueda general por texto en todo el documento

import mongoose from 'mongoose';

export const queryFormatter = (req) => {
    const allowedFilters = ['creatorId', 'title', 'discipline', 'description', 'autor', 'valorations', 'language', 'level', 'text']

    let search = {}
    const query = req.query;
    const keys = Object.keys(query)




    keys.forEach((key) => {
        if (allowedFilters.includes(key)) {

            switch (key) {
                case 'creatorId': search[key] = mongoose.Types.ObjectId.createFromHexString(query['creatorId'])
                    break

                case 'valorations':
                    search['valorationsAverage.average'] = { $gte: +`${query[key]}` }
                    break;

                case 'autor':
                    search['autor.autorName'] = { $regex: query[key], $options: 'i' }
                    break

                case 'text':
                    // search = { $text: { $search: query[key] } }
                    console.log(search)
                    
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