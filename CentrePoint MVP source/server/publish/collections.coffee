# You'll want to replace these functions. They publish the whole
# collection which is problematic after your app grows

Meteor.publish 'posts', ->
	Posts.find()

Meteor.publish 'datasets', ->
    Datasets.find()

Meteor.publish 'datatypes', ->
    DataTypes.find()

Meteor.publish 'attachments', ->
	Attachments.find()

Meteor.publish 'raw_data', ->
	RawData.find()

Meteor.publish 'vizes', ->
    Vizes.find()

Meteor.publish 'reports', ->
    Reports.find()

Meteor.publish 'core_dclg', ->
    CoreDCLG.find()

Meteor.publish 'p1e_dclg', ->
    P1E.find()

Meteor.publish 'scotland', ->
    Scotland.find()

Meteor.publish 'wales', ->
    Wales.find()

Meteor.publish 'foi', ->
    FOI.find()

Meteor.publish 'youth_housing', ->
    YouthHousing.find()