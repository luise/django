const {createDeployment, Machine, publicInternet} = require("@quilt/quilt");

var Django = require("./django.js")
var haproxy = require("@quilt/haproxy");
var Mongo = require("@quilt/mongo");

// Infrastructure
var deployment = createDeployment({});

var baseMachine = new Machine({
  provider: "Amazon",
  // sshKeys: githubKeys("CHANGE_ME"), // Replace with your GitHub username
});

// Applications
var mongo = new Mongo(3);

// Three Django replicas created from the "quilt/django-polls" image, and
// connected to the mongo database.
var django = new Django(3, "quilt/django-polls", mongo);

var proxy = haproxy.singleServiceLoadBalancer(1, django._app);

// Connections
proxy.allowFrom(publicInternet, 80);

// Deployment
deployment.deploy(baseMachine.asMaster())
deployment.deploy(baseMachine.asWorker().replicate(3))
deployment.deploy([django, mongo, proxy]);
