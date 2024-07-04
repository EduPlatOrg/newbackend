export const queryFormatter = (req) => {
    const primaryFilters = ['creatorId', 'language', 'level']
    const secondaryFilters = ['title', 'discipline', 'description', 'autor', 'valorations']

    const search = {}
    const query = req.query;
    const keys = Object.keys(query)

    keys.forEach((key) => {
        if (primaryFilters.includes(key)) {
            search[key] = query[key]
        }
        else if (secondaryFilters.includes(key)) {
            switch (key) {
                case 'valorations':
                    search['valorationsAverage.average'] = { $gte: +`${query[key]}` }
                    break;

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
    return search
}