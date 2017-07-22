const {createDeployment, Machine, publicInternet} = require("@quilt/quilt");

let Django = require('./django.js');
let haproxy = require('@quilt/haproxy');
let Mongo = require('@quilt/mongo');

// Infrastructure
let deployment = createDeployment({});

let baseMachine = new Machine({
  provider: 'Amazon',
  // sshKeys: githubKeys("CHANGE_ME"), // Replace with your GitHub username
});

// Applications
let mongo = new Mongo(3);

// Three Django replicas created from the "quilt/django-polls" image, and
// connected to the mongo database.
let django = new Django(3, 'quilt/django-polls', mongo);

let proxy = haproxy.singleServiceLoadBalancer(1, django._app);

// Connections
proxy.allowFrom(publicInternet, 80);

// Deployment
deployment.deploy(baseMachine.asMaster());
deployment.deploy(baseMachine.asWorker().replicate(3));
deployment.deploy([django, mongo, proxy]);
