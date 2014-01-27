tc = {};

tc.thing_schema = {
    name: 'thing'
    , indexes: [
	{ keyPath: 'handles'
	  , multiEntry: true
	}
    ]
};

tc.template_schema = {
    name: 'template'
    , keyPath: 'campaign'
};

tc.schema = { 
    stores: [ tc.thing_schema, tc.template_schema ]
    , version: 1
};

tc.db = new ydn.db.Storage('tc',tc.schema);
