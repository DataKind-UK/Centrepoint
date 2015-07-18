@Vizes = new Meteor.Collection('vizes');

Schemas.Vizes = new SimpleSchema
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

    dataset:
        type:String

    vizType:
        type:String
    
    location:
        type: String

    startDate:
        type: Date

    endDate:
        type: Date

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


Vizes.attachSchema(Schemas.Vizes)