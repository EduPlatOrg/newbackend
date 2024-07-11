import mongoose from 'mongoose';

export const queryFormatter = (req) => {
    const allowedFilters = [ 'title', 'discipline', 'description', 'autor', 'valorations', 'lang', 'range', 'text']

    let search = {}
    const query = req.query;
    const keys = Object.keys(query)

    keys.forEach((key) => {
        if (query[key] !== null || query[key] !=undefined || query[key] !== '') return search
        
        if (allowedFilters.includes(key)) {

            // TODO: filtrar por range en lugar de level

            // TODO: poner orden de valoracion por defecto


            switch (key) {

                case 'range': 
                    
                    
                    
                    
                    
                    break
                
                case 'autor':
                    search['autor.autorName'] = { $regex: query[key], $options: 'i' }
                    break


                default:
                    search[key] = { $regex: query[key], $options: 'i' }
                    break;
            }
        }
    }
    )
    console.log(search)
    
    return search
}