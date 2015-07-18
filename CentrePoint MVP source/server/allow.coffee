ProfilePictures.allow
	insert: (userId, doc) ->
		true
	update: (userId, doc, fieldNames, modifier) ->
		true
	download: (userId)->
		true

Posts.allow
	insert: (userId, doc) ->
		userId == doc.owner
	update: (userId, doc, fields, modifier) ->
		userId == doc.owner
	remove: (userId, doc) ->
		userId == doc.owner

Datasets.allow
	insert: (userId, doc) ->
		true
	update: (userId, doc, fields, modifier) ->
		true
	remove: (userId, doc) ->
		true

DataTypes.allow
	insert: (userId, doc) ->
		true
	update: (userId, doc, fields, modifier) ->
		true
	remove: (userId, doc) ->
		true

FOI.allow
	insert: (userId, doc) ->
		true
	update: (userId, doc, fields, modifier) ->
		true
	remove: (userId, doc) ->
		true

P1E.allow
	insert: (userId, doc) ->
		true
	update: (userId, doc, fields, modifier) ->
		true
	remove: (userId, doc) ->
		true

Wales.allow
	insert: (userId, doc) ->
		true
	update: (userId, doc, fields, modifier) ->
		true
	remove: (userId, doc) ->
		true	

Scotland.allow
	insert: (userId, doc) ->
		true
	update: (userId, doc, fields, modifier) ->
		true
	remove: (userId, doc) ->
		true		

CoreDCLG.allow
	insert: (userId, doc) ->
		userId == doc.owner
	update: (userId, doc, fields, modifier) ->
		userId == doc.owner
	remove: (userId, doc) ->
		userId == doc.owner

RawData.allow
	insert: (userId, doc) ->
		true
	update: (userId, doc, fieldNames, modifier) ->
		true
	download: (userId)->
		true

Attachments.allow
	insert: (userId, doc) ->
		true
	update: (userId, doc, fieldNames, modifier) ->
		true
	download: (userId)->
		true

Vizes.allow
	insert: (userId, doc) ->
		true
	update: (userId, doc, fields, modifier) ->
		true

Reports.allow
	insert: (userId, doc) ->
		true
	update: (userId, doc, fields, modifier) ->
		true

Meteor.users.allow
	update: (userId, doc, fieldNames, modifier) ->
		if userId == doc._id and not doc.username and fieldNames.length == 1 and fieldNames[0] == 'username'
			true
		else
			false