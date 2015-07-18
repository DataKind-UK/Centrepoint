Meteor.startup(function () {
	if (Roles.getAllRoles().fetch() == [])
	{
	    Roles.createRole('external');
	    Roles.createRole('centrepoint');
	    Roles.createRole('user-admin');
	    Roles.createRole('data-admin');
	    Roles.createRole('admin');
	} else {
		//console.log(Roles.getAllRoles().fetch().map(function(obj){return obj['name']}));
	}
});
