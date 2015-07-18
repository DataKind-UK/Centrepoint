Meteor.methods
	deleteAccount: (userId) ->
		if @userId == userId
			Meteor.users.remove _id: @userId

	insertCOREData: (userId)->
		if Roles.userIsInRole(Meteor.user(), ['admin','data-admin'])
			console.log('inserting CORE Data')