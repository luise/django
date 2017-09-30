const { createDeployment, Machine, publicInternet } = require('@quilt/quilt');

const Django = require('./django.js');
const haproxy = require('@quilt/haproxy');
const Mongo = require('@quilt/mongo');

// Create infrastructure.
const deployment = createDeployment({});

const baseMachine = new Machine({
  provider: 'Amazon',
  // sshKeys: githubKeys("CHANGE_ME"), // Replace with your GitHub username
});
deployment.deploy(baseMachine.asMaster());
deployment.deploy(baseMachine.asWorker().replicate(3));

// Create applications.
const mongo = new Mongo(3);
mongo.deploy(deployment);

// Create three Django replicas created from the "quilt/django-polls" image, and
// connected to the mongo database.
const django = new Django(3, 'quilt/django-polls', mongo);
django.deploy(deployment);

const proxy = haproxy.simpleLoadBalancer(django.containers);
proxy.allowFrom(publicInternet, 80);
proxy.deploy(deployment);
