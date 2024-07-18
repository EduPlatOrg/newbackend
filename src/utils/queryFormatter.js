import mongoose from 'mongoose';

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

  let search = {};
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
      // TODO: poner orden de valoracion por defecto

      switch (key) {
        case 'range':
          // TODO: filtrar por range
          search['range'] = query['range'];
          console.log('filtra por ', key);
          console.log({ search });

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

  console.log({ search });
  return search;
};
