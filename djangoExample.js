const { Infrastructure, Machine, publicInternet, allowTraffic } = require('kelda');

const Django = require('./django.js');
const haproxy = require('@kelda/haproxy');
const Mongo = require('@kelda/mongo');

const numReplicas = 3;

const baseMachine = new Machine({ provider: 'Amazon' });

// Create infrastructure.
const infra = new Infrastructure(
  baseMachine,
  baseMachine.replicate(numReplicas));

// Create applications.
const mongo = new Mongo(numReplicas);
mongo.deploy(infra);

// Create three Django replicas created from the "keldaio/django-polls" image, and
// connected to the mongo database.
const django = new Django(numReplicas, 'keldaio/django-polls', mongo);
django.deploy(infra);

const proxy = haproxy.simpleLoadBalancer(django.containers);
allowTraffic(publicInternet, proxy, 80);
proxy.deploy(infra);
