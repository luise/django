const {Container, Service} = require("@quilt/quilt");

// Specs for Django web service
function Django(nWorker, image, mongo, env = {}) {
  env.MONGO_URI = mongo.uri("django-example")

  var containers = new Container(image).withEnv(env).replicate(nWorker);
  this._app = new Service("app", containers);

  this.connect(mongo.port, mongo);
};

Django.prototype.deploy = function(deployment) {
  deployment.deploy(this.services());
};

Django.prototype.services = function() {
  return [this._app];
};

Django.prototype.connect = function(port, to) {
  var self = this;
  to.services().forEach(function(service) {
    self._app.connect(port, service);
  });
};

module.exports = Django;
