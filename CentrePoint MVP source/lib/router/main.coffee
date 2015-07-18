Router.map ->
  @route "home",
    path: "/"
    layoutTemplate: "homeLayout"
    waitOn: ->
      [
        subs.subscribe 'p1e_dclg'
        subs.subscribe 'scotland'
        subs.subscribe 'wales'
      ]

  @route "viz",
    path: "/viz"
    layoutTemplate: "viz"
    onBeforeAction: ->
      @redirect '/viz/bubble'

  @route "contact",
    path: "/#contact"
    layoutTemplate: "homeLayout"

  @route "about",
    path: "/#about"
    layoutTemplate: "homeLayout"  

  @route "charts",
    path: "/viz/charts"
    layoutTemplate: "viz"
    waitOn: ->
      [
        subs.subscribe 'foi'
      ]

  @route "map",
    path: "/viz/map"
    layoutTemplate: "viz"
    waitOn: ->
      [
        subs.subscribe 'p1e_dclg'
      ]

  @route "bubble",
    path: "/viz/bubble"
    layoutTemplate: "viz"
    waitOn: ->
      [
        subs.subscribe 'foi'
        subs.subscribe 'p1e_dclg'
        subs.subscribe 'scotland'
        subs.subscribe 'wales'
      ]

  @route "sankey",
    path: "/viz/sankey"
    layoutTemplate: "viz"
    waitOn: ->
      [
        subs.subscribe 'foi'
      ]

  @route "fullPicture",
    path: "/fullpicture"
    layoutTemplate: "viz"

  @route "nquiring",
    path: "/nquiring"
    layoutTemplate: "viz"

  @route "centrepointData",
    path: "/centrepoint"
    layoutTemplate: "viz"
    onBeforeAction: ->
      if not Roles.userIsInRole(Meteor.user(), ['admin','centrepoint'])
        @redirect '/dashboard'
        @stop()
      else
        layoutTemplate: "centrepoint"
      @next()

  # @route "admin",
  #   path: "/admin"
  #   onBeforeAction: ->
  #   waitOn: ->
  #     [
  #       subs.subscribe 'datatypes'
  #     ]

  @route "dashboard",
    path: "/dashboard"
    onBeforeAction: ->
      @redirect '/viz/bubble'
    # waitOn: ->
    #   [
    #     subs.subscribe 'posts'
    #     subs.subscribe 'comments'
    #     subs.subscribe 'attachments'
    #     subs.subscribe 'vizes'
    #     subs.subscribe 'reports'
    #   ]
    # data: ->
    #   posts: Posts.find({},{sort: {createdAt: -1}}).fetch()