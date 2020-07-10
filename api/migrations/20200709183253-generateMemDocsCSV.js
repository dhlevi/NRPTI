'use strict';

const fs = require('fs');

let dbm;
let type;
let seed;

const https = require('https');
const bcmiUrl = 'https://mines.empr.gov.bc.ca'; // prod api url

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = async function (db) {
  try {
    // API call to pull data from BCMI
    console.log('Fetching all major mines in BCMI...');
    const publishedMines = await getRequest(bcmiUrl + '/api/projects/published');
    console.log('Located ' + publishedMines.length + ' mines. Fetching Collections and Docs for CSV Report...');

    const errorRows = [];
    const csvRows = [];

    for (let i = 0; i < publishedMines.length; i++) {
      const mine = publishedMines[i];
      try {
        let collections = await getRequest(bcmiUrl + '/api/collections/project/' + mine.code);

        collections.forEach(collectionData => {
          const csvRowHeader = {
            // Mine specific information
            mineId:   mine._id,
            mineCode: mine.code,
            mineName: mine.name,
            permitId: mine.memPermitID,
            // Collection Specific Information
            collectionId:         collectionData._id,
            isForMEM:             collectionData.isForMEM,
            isForEAO:             collectionData.isForEAO,
            isForENV:             collectionData.isForENV,
            collectionStatus:     collectionData.status,
            collectionType:       collectionData.type,
            collectionParentType: collectionData.parentType,
            collectionName:       collectionData.displayName,
          };

          // Iterate through the main and other doc collections
          // each document becomes a row in the CSV
          collectionData.mainDocuments.forEach(mainDoc => {
            csvRows.push(createCsvRow(csvRowHeader, mainDoc));
          });

          collectionData.otherDocuments.forEach(otherDoc => {
            csvRows.push(createCsvRow(csvRowHeader, otherDoc));
          });
        });
      } catch(err) {
        console.error('Could not find ' + publishedMines[i]._id + ' : ' + publishedMines[i].name);
        console.error(err);
        errorRows.push({ id: publishedMines[i]._id, name: publishedMines[i].name, code: publishedMines[i].code, error: err});
        // dont rethrow, we'll just ignore this one as a failure and check the rest
      }
    }

    console.log('Completed fetching document data. Generating CSV report...');

    // Flatten the JSON objects into an array of strings
    // We might have commas in our strings. Convert them to prevent any issues
    const commaReplacement = '~!!~';

    // This will: Create a new array containing arrays of the values of each object in csvRows
    // first it creates a header of the key values, then concatenates in a map of the csvRows
    // which is generated from a map of each rows values. The process could be all done in a single
    // line... convertedRows = Object.keys().concat(csvRos.map(...)); but it would be ugly and confusing

    // create an array for the headers
    const headers = [Object.keys(csvRows[0]).join()];
    // create an array containing the csvRows and any error logouts (should be empty)
    const mergedRowsAndErrors = csvRows.concat(errorRows);
    // now, map the rows. We want to stringify the values, but strip out any double-quotes
    // additionally, commas within a string could cause problems for the CSV. We shouldn't
    // see any commas in the fields we have, but to be safe we'll do a replace for now
    // then re-convert them back
    const mappedRows = mergedRowsAndErrors.map(row => Object.keys(row).map(key => JSON.stringify(row[key]).replace(/"/g, '').replace(/,/g, commaReplacement)));
    // finally, create the 'final' array by concatenating headers and the mapped rows
    const convertedRows = headers.concat(mappedRows);

    // now that we have a big array of the data, we'll join it all together with
    // a newline and some double-quotes. Make sure the commas are double-quoted as well
    // once we have a big string of data, lets make sure we revert our converted
    // commas from the source data back into commas. CSV will be happy now because
    // those commas will be within quoted strings
    let csvData = `"${convertedRows.join('"\n"').replace(/,/g, '","')}"`;
    csvData = csvData.replace(new RegExp(`${commaReplacement}`, 'g'), ',');

    await fs.promises.writeFile('mem-admin_doc_report.csv', csvData, 'utf8', function(err) {
      if (err) {
        console.error('Error occured while writing the CSV: ' + err);
      } else {
        console.log('CSV report saved successfully');
      }
    });

    // bada-bing bada-boom We're done!
  } catch(err) {
    console.error('Error on CSV Generation: ' + err);
  }
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  "version": 1
};

function createCsvRow(csvRowHeader, collectionDocument) {
  const doc = collectionDocument.document;

  let csvRow = Object.assign({}, csvRowHeader);
  csvRow['sortOrder']               = collectionDocument.sortOrder;
  csvRow['collectiondocumentId']    = collectionDocument._id;

  if (doc) {
    csvRow['documentId']              = doc._id;
    csvRow['isPublished']             = doc.isPublished;
    csvRow['inspectionNumber']        = doc.inspectionReport ? doc.inspectionReport.inspectionNumber : null;
    csvRow['inspectorName']           = doc.inspectionReport ? doc.inspectionReport.inspectorName : null;
    csvRow['accompanyingInspectors']  = doc.inspectionReport ? doc.inspectionReport.accompanyingInspectors : null;
    csvRow['mineManager']             = doc.inspectionReport ? doc.inspectionReport.mineManager : null;
    csvRow['personsContacted']        = doc.inspectionReport ? doc.inspectionReport.personsContacted : null;
    csvRow['dateFollowUp']            = doc.inspectionReport ? doc.inspectionReport.dateFollowUp : null;
    csvRow['dateResponse']            = doc.inspectionReport ? doc.inspectionReport.dateResponse : null;
    csvRow['dateReportIssued']        = doc.inspectionReport ? doc.inspectionReport.dateReportIssued : null;
    csvRow['associatedAuthorization'] = doc.inspectionReport ? doc.inspectionReport.associatedAuthorization : null;
    csvRow['eaoStatus']               = doc.eaoStatus;
    csvRow['internalSize']            = doc.internalSize;
    csvRow['internalExt']             = doc.internalExt;
    csvRow['internalMime']            = doc.internalMime;
    csvRow['internalName']            = doc.internalName;
    csvRow['internalOriginalName']    = doc.internalOriginalName;
    csvRow['internalURL']             = doc.internalURL;
    csvRow['internalEncoding']        = doc.internalEncoding;
    csvRow['relatedDocuments']        = doc.relatedDocuments ? doc.relatedDocuments.join(' ') : null;
    csvRow['documentCategories']      = doc.documentCategories ? doc.documentCategories.join(' ') : null;
    csvRow['documentAuthor']          = doc.documentAuthor;
    csvRow['documentIsInReview']      = doc.documentIsInReview;
    csvRow['documentSource']          = doc.documentSource;
    csvRow['documentIsLatestVersion'] = doc.documentIsLatestVersion;
    csvRow['documentVersion']         = doc.documentVersion;
    csvRow['documentFileFormat']      = doc.documentFileFormat;
    csvRow['documentFileSize']        = doc.documentFileSize;
    csvRow['documentFileURL']         = doc.documentFileURL;
    csvRow['documentFileName']        = doc.documentFileName;
    csvRow['documentEPICProjectId']   = doc.documentEPICProjectId;
    csvRow['documentEPICId']          = doc.documentEPICId;
    csvRow['projectFolderAuthor']     = doc.projectFolderAuthor;
    csvRow['projectFolderURL']        = doc.projectFolderURL;
    csvRow['dateReceived']            = doc.dateReceived;
    csvRow['datePosted']              = doc.datePosted;
    csvRow['dateUploaded']            = doc.dateUploaded;
    csvRow['dateUpdated']             = doc.dateUpdated;
    csvRow['dateAdded']               = doc.dateAdded;
    csvRow['documentDateDisplayMnYr'] = doc.documentDateDisplayMnYr;
    csvRow['documentDate']            = doc.documentDate;
    csvRow['description']             = doc.description;
    csvRow['displayName']             = doc.displayName;
    csvRow['directoryID']             = doc.directoryID;
    csvRow['inspectionType']          = doc.inspectionType;
  }

  return csvRow;
}

function getRequest(url) {
  return new Promise(function(resolve, reject) {
      let req = https.get(url, function(res) {
          if (res.statusCode < 200 || res.statusCode >= 300) {
              return reject(new Error('statusCode=' + res.statusCode));
          }
          let body = [];
          res.on('data', function(chunk) {
              body.push(chunk);
          });
          res.on('end', function() {
              try {
                  body = JSON.parse(Buffer.concat(body).toString());
              } catch(e) {
                  reject(e);
              }
              resolve(body);
          });
      });

      req.on('error', function(err) {
          reject(err);
      });

      req.end();
  });
}
