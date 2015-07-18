# These values get propagated through the app
# E.g. The 'name' and 'subtitle' are used in seo.coffee

@Config =

	# Basic Details
	name: 'Youth Homelessness Databank'
	title: ->
			TAPi18n.__ 'configTitle'
	subtitle: ->
			TAPi18n.__ 'configSubtitle'
	logo: ->
		'<b>' + @name + '</b>'
	footer: ->
		@name + ' - Copyright ' + new Date().getFullYear()

	# Emails
	emails:
		from: 'no-reply@' + Meteor.absoluteUrl()
		contact: 'hello' + Meteor.absoluteUrl()

	# Username - if true, users are forced to set a username
	username: false
	
	# Localisation
	defaultLanguage: 'en'
	dateFormat: 'D/M/YYYY'

	# Meta / Extenrnal content
	privacyUrl: 'http://centrepoint.org.uk/'
	termsUrl: 'http://centrepoint.org.uk/'

	# For email footers
	legal:
		address: 'Central House, 25 Camperdown Street, London, E1 8DZ'
		name: 'Centrepoint'
		url: 'http://centrepoint.org.uk'

	about: 'http://centrepoint.org.uk'
	blog: 'http://centrepoint.org.uk/news-events'

	socialMedia:
		facebook:
			url: 'https://www.facebook.com/centrepoint.charity'
			icon: 'facebook'
		twitter:
			url: 'https://twitter.com/centrepointuk'
			icon: 'twitter'
		github:
			url: 'https://github.com/thedataist/yhd'
			icon: 'github'
		info:
			url: 'http://www.centrepoint.org.uk/google'
			icon: 'link'

	#Routes
	homeRoute: '/'
	publicRoutes: ['home']
	dashboardRoute: '/dashboard'
