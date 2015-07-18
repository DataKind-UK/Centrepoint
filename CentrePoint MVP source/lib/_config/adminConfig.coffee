
@AdminConfig =
    name: Config.name
    adminEmails: ['peter@datai.st','yhdteam@centrepoint.org']
    roles:['admin','centrepoint','public', 'user_admin', 'data_admin', 'external']
    collections :
        Vizes: {
            color: 'purple'
            icon: 'pencil'
            auxCollections: ['Datasets']
            tableColumns: [
              {label: 'Title',name:'title'}
              {label:'Creator',name:'creator',collection:'Users'}
            ]
        },
        Datasets: {
            color: 'orange'
            icon: 'table'
            auxCollections: ['Attachments']
            tableColumns: [
              {label: 'Title',name:'title'}
              {label: 'Data Type', name:'datatype', collection:'DataTypes'}
              {label:'Creator',name:'creator',collection:'Users'}
            ]
        },
        DataTypes: {
            color: 'yellow'
            icon: 'pencil'
            tableColumns: [
              {label: 'Title',name:'title'}
              {label:'Creator',name:'creator',collection:'Users'}
            ]
        },
        Posts: {
            color: 'red'
            icon: 'pencil'
            auxCollections: ['Attachments']
            tableColumns: [
              {label: 'Title',name:'title'}
              {label:'User',name:'owner',collection:'Users'}
            ]
        },
        Comments: {
            color: 'green'
            icon: 'comments'
            auxCollections: ['Posts']
            tableColumns: [
              {label: 'Content',name:'content'}
              {label:'Post',name:'doc',collection: 'Posts',collection_property:'title'}
              {label:'User',name:'owner',collection:'Users'}
            ]
        }
    dashboard:
        homeUrl: '/dashboard'
        # widgets: [
        #   {
        #       template: 'adminCollectionWidget'
        #       data:
        #           collection: 'Posts'
        #           class: 'col-lg-3 col-xs-6'
        #   }
        #   {
        #       template: 'adminUserWidget'
        #       data:
        #           class: 'col-lg-3 col-xs-6'
        #   }
        # ]
    autoForm: 
            omitFields: ['createdAt', 'updatedAt']
