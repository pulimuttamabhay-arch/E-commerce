
// import mongoose from 'mongoose';

// export function startChangeWatcher(io) {
//   const db = mongoose.connection.db;

//   if (!db) {
//     throw new Error('MongoDB is not connected');
//   }

//   // Watch all collections in the current database.
//   const changeStream = db.watch([], {
//     fullDocument: 'updateLookup',
//   });

//   changeStream.on('change', (change) => {
//     const operation = change.operationType;
//     const collection = change.ns?.coll;

//     // Ignore database commands and other non-CRUD events.
//     const supportedOperations = [
//       'insert',
//       'update',
//       'replace',
//       'delete',
//     ];

//     if (!supportedOperations.includes(operation)) {
//       return;
//     }

//     const labels = {
//       insert: 'Created',
//       update: 'Updated',
//       replace: 'Replaced',
//       delete: 'Deleted',
//     };

//     const collectionName = collection || 'record';
//     const readableCollection =
//       collectionName.charAt(0).toUpperCase() +
//       collectionName.slice(1);

//     const notification = {
//       id: `${change.clusterTime?.toString() || Date.now()}-${Math.random()}`,
//       type: operation,
//       collection: collectionName,
//       title: `${readableCollection} ${labels[operation]}`,
//       message: `${collectionName} record ${labels[operation].toLowerCase()}.`,
//       documentId: change.documentKey?._id?.toString(),
//       createdAt: new Date().toISOString(),
//     };

//     io.emit('newNotification', notification);

//     console.log('MongoDB notification:', notification.title);
//   });

//   changeStream.on('error', (error) => {
//     console.error('MongoDB Change Stream error:', error);
//   });

//   console.log('MongoDB Change Stream started');
//   return changeStream;
// }
