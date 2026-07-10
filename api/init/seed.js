db.Basesnippet.bulkWrite([
  {
    updateOne: {
      filter: {_id: ObjectId('64e898e65b05b2003e22c2e4')},
      update: {
        $set: {
          snippetType: 'location',
          createdBy: 'scilog@scilog',
          updatedBy: 'scilog@scilog',
          readACL: ['any-authenticated-user'],
          deleteACL: ['admin'],
          adminACL: ['admin'],
          name: 'root',
          location: 'root',
        },
      },
      upsert: true,
    },
  },
  {
    updateOne: {
      filter: {_id: ObjectId('64e898e65b05b2003e22c2e5')},
      update: {
        $set: {
          snippetType: 'location',
          createdBy: 'scilog@scilog',
          updatedBy: 'scilog@scilog',
          readACL: ['any-authenticated-user'],
          deleteACL: ['admin'],
          adminACL: ['admin'],
          parentId: ObjectId('64e898e65b05b2003e22c2e4'),
          name: 'test',
          location: 'test',
        },
      },
      upsert: true,
    },
  },
]);
