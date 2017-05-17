const {createDeployment, Machine} = require("@quilt/quilt");

var Django = require("./django.js")
var HaProxy = require("@quilt/haproxy").Haproxy;
var Mongo = require("@quilt/mongo");

// Infrastructure
var deployment = createDeployment({});

var baseMachine = new Machine({
  provider: "Amazon",
  // sshKeys: githubKeys("CHANGE_ME"), // Replace with your GitHub username
});

// Applications
var mongo = new Mongo(3);

var django = new Django({
  nWorker: 3,
  image: "quilt/django-polls",
}, mongo);

var haproxy = new HaProxy(1, django.services());

// Connections
haproxy.public();

// Deployment
deployment.deploy(baseMachine.asMaster())
deployment.deploy(baseMachine.asWorker().replicate(3))
deployment.deploy([django, mongo, haproxy]);
