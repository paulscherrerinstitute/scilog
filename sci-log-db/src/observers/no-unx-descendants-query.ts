import {ObjectId} from 'mongodb';

export function noUnxDescendantsQuery(locationId: string, unxGroup: string) {
  return [
    {
      $match: {
        location: new ObjectId(locationId),
        snippetType: 'logbook',
      },
    },
    {
      $graphLookup: {
        from: 'Basesnippet',
        startWith: '$_id',
        connectFromField: '_id',
        connectToField: 'parentId',
        as: 'descendants',
        restrictSearchWithMatch: {
          snippetType: {$nin: ['history', 'update']},
          $or: [
            {createACL: {$ne: unxGroup}},
            {readACL: {$ne: unxGroup}},
            {shareACL: {$ne: unxGroup}},
            {updateACL: {$ne: unxGroup}},
            {deleteACL: {$ne: unxGroup}},
            {adminACL: {$ne: unxGroup}},
          ],
        },
      },
    },
    {
      $addFields: {
        descendants: {
          $concatArrays: [['$$ROOT'], '$descendants'],
        },
      },
    },
    {
      $project: {
        'descendants._id': 1,
      },
    },
    {$unwind: '$descendants'},
    {$replaceRoot: {newRoot: '$descendants'}},
  ];
}
