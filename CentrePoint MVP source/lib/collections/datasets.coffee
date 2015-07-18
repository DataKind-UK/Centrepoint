@Datasets = new Meteor.Collection('datasets');

Schemas.Datasets = new SimpleSchema
    title:
        type:String
        max: 60

    description:
        type: String
        autoform:
            rows: 5

    createdAt: 
        type: Date
        autoValue: ->
            if this.isInsert
                new Date()

    updatedAt:
        type:Date
        optional:true
        autoValue: ->
            if this.isUpdate
                new Date()

    dataType:
        type:String
        autoform:
            options: ->
                _.map DataTypes.find().fetch(), (dType)->
                    label: dType.title
                    value: dType._id

    fileType:
        type:String
        autoform:
            options: ->
                fTypes = ['csv', 'tab', 'xsl', 'xslx']
                _.map fTypes, (fType)->
                    label: fType
                    value: fType


    rawData:
        type: String
        autoform:
            afFieldInput:
                type: 'fileUpload'
                collection: 'RawData'

    creator: 
        type: String
        regEx: SimpleSchema.RegEx.Id
        autoValue: ->
            if this.isInsert
                Meteor.userId()
        autoform:
            options: ->
                _.map Meteor.users.find().fetch(), (user)->
                    label: user.emails[0].address
                    value: user._id

Datasets.attachSchema(Schemas.Datasets)