const { createDeployment, Machine, publicInternet } = require('kelda');

const Django = require('./django.js');
const haproxy = require('@kelda/haproxy');
const Mongo = require('@kelda/mongo');

const numReplicas = 3;

// Create infrastructure.
const deployment = createDeployment({});

const baseMachine = new Machine({
  provider: 'Amazon',
  // sshKeys: githubKeys("CHANGE_ME"), // Replace with your GitHub username
});
deployment.deploy(baseMachine.asMaster());
deployment.deploy(baseMachine.asWorker().replicate(numReplicas));

// Create applications.
const mongo = new Mongo(numReplicas);
mongo.deploy(deployment);

// Create three Django replicas created from the "keldaio/django-polls" image, and
// connected to the mongo database.
const django = new Django(numReplicas, 'keldaio/django-polls', mongo);
django.deploy(deployment);

const proxy = haproxy.simpleLoadBalancer(django.containers);
proxy.allowFrom(publicInternet, 80);
proxy.deploy(deployment);
