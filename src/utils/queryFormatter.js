export const queryFormatter = (req) => {
  const allowedFilters = [
    'title',
    'discipline',
    'description',
    'autor',
    'valorations',
    'lang',
    'range',
    'text',
  ];

  const search = {};
  const query = req.query;
  const keys = Object.keys(query);

  for (let key of keys) {
    if (
      query[key] == null ||
      query[key] == undefined ||
      query[key] === '' ||
      query[key] === "''" ||
      query[key] === '""'
    ) {
      continue;
    }

    if (allowedFilters.includes(key)) {
      switch (key) {
        case 'range':
          search['range'] = +query['range'];
          break;

        case 'autor':
          search['autor.autorName'] = { $regex: query[key], $options: 'i' };
          break;

        default:
          search[key] = { $regex: query[key], $options: 'i' };
          break;
      }
    }
  }
  return search;
};
