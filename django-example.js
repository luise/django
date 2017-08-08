const { createDeployment, Machine, publicInternet } = require('@quilt/quilt');

const Django = require('./django.js');
const haproxy = require('@quilt/haproxy');
const Mongo = require('@quilt/mongo');

// Infrastructure
const deployment = createDeployment({});

const baseMachine = new Machine({
  provider: 'Amazon',
  // sshKeys: githubKeys("CHANGE_ME"), // Replace with your GitHub username
});

// Applications
const mongo = new Mongo(3);

// Three Django replicas created from the "quilt/django-polls" image, and
// connected to the mongo database.
const django = new Django(3, 'quilt/django-polls', mongo);

const proxy = haproxy.singleServiceLoadBalancer(1, django.app);

// Connections
proxy.allowFrom(publicInternet, 80);

// Deployment
deployment.deploy(baseMachine.asMaster());
deployment.deploy(baseMachine.asWorker().replicate(3));
deployment.deploy([django, mongo, proxy]);
