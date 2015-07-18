share.dataLoaders =
  loadToCollection: (parsed)->
    if parsed
      # console.log($("select[name='datatype'] option:selected").text())
      newDoc = {}
      fieldOrder = {}
      order = 0
      for field in parsed.data[0]
        newDoc[field] = ""
        fieldOrder[order] = field
        order += 1

      for row in parsed.data
        nextNewDoc = newDoc
        #console.log(row)
        for fieldnum of fieldOrder
          nextNewDoc[fieldOrder[fieldnum]] = row[fieldnum]
          # console.log([fieldOrder[fieldnum]])
          # console.log(row[fieldnum])

        # share.inserCoreDCLG nextNewDoc
        # share.P1E nextNewDoc
        # share.FOI nextNewDoc
        # share.Scotland nextNewDoc
        share.Wales nextNewDoc
        console.log nextNewDoc

share.Wales = Meteor.bindEnvironment((nextNewDoc) ->
  Wales.insert nextNewDoc
  return
, (e) ->
  throw e
)   

share.Scotland = Meteor.bindEnvironment((nextNewDoc) ->
  Scotland.insert nextNewDoc
  return
, (e) ->
  throw e
)   

share.FOI = Meteor.bindEnvironment((nextNewDoc) ->
  FOI.insert nextNewDoc
  return
, (e) ->
  throw e
)   

share.P1E = Meteor.bindEnvironment((nextNewDoc) ->
  P1E.insert nextNewDoc
  return
, (e) ->
  throw e
)    

share.inserCoreDCLG = Meteor.bindEnvironment((nextNewDoc) ->
  CoreDCLG.insert nextNewDoc
  return
, (e) ->
  throw e
)        

@RawData = new FS.Collection("RawData",
    stores: [
        new FS.Store.GridFS("raw_data", {
            transformWrite: (fileObj, readStream, writeStream)->
                string = ''
                readStream.on('data',
                    (data)->
                        string += data.toString()
                )
                readStream.on('end', ->
                    parsed = Baby.parse(string, {delimiter: ','})
                    # parsed = Baby.parse(string, {delimiter: '\t'})
                    share.dataLoaders.loadToCollection(parsed)
                )
                readStream.pipe(writeStream)
        })
    ]
)
